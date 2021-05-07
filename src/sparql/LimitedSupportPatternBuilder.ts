import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import { Condition } from '@/sparql/QueryRepresentation';
import rdfNamespaces from '@/sparql/rdfNamespaces';
import SyntaxBuilder from '@/sparql/SyntaxBuilder';
import TripleBuilder from '@/sparql/TripleBuilder';
import ValuePatternBuilder from '@/sparql/ValuePatternBuilder';
import { Pattern } from 'sparqljs';

export default class LimitedSupportPatternBuilder implements ValuePatternBuilder {
	private readonly tripleBuilder: TripleBuilder;
	private readonly syntaxBuilder: SyntaxBuilder;

	public constructor() {
		this.tripleBuilder = new TripleBuilder();
		this.syntaxBuilder = new SyntaxBuilder();
	}

	public buildValuePatternFromCondition(
		condition: Condition,
		conditionIndex: number,
		repeatingPropertyIndex: string,
	): Pattern[] {
		const {
			propertyId,
			referenceRelation,
			propertyValueRelation,
			negate,
		} = condition;

		if ( propertyValueRelation !== PropertyValueRelation.Regardless ) {
			throw new Error( 'datatypes with limited support _must_ have PropertyValueRelation.Regardless!' );
		}

		let patterns: Pattern[] = [];

		const statementVariable = this.syntaxBuilder.buildVariableTermFromName( 'statement' + conditionIndex );
		const entityToStatementTriple = this.syntaxBuilder.buildSimpleTriple(
			{ termType: 'Variable', value: 'item' },
			rdfNamespaces.p + propertyId,
			statementVariable,
		);
		const statementToValueTriple = this.syntaxBuilder.buildPathTriple(
			statementVariable,
			[ rdfNamespaces.ps + propertyId ],
			{
				termType: 'BlankNode',
				value: repeatingPropertyIndex !== '' ?
					`anyValue${propertyId}_${repeatingPropertyIndex}` :
					`anyValue${propertyId}`,
			},
		);
		const entityValuePattern = this.syntaxBuilder.buildBgpPattern( [
			entityToStatementTriple,
			statementToValueTriple,
		] );
		patterns.push( entityValuePattern );

		const referenceFilterPattern = this.tripleBuilder.buildReferenceFilterPattern(
			referenceRelation,
			statementVariable,
		);
		if ( referenceFilterPattern !== null ) {
			patterns.push( referenceFilterPattern );
			patterns = [ { type: 'group', patterns } ];
		}

		if ( negate ) {
			patterns = [ {
				type: 'minus',
				patterns,
			} ];
		}

		return patterns;
	}
}
