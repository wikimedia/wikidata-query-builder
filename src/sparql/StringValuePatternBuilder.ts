import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import { Condition } from '@/sparql/QueryRepresentation';
import rdfNamespaces from '@/sparql/rdfNamespaces';
import SyntaxBuilder from '@/sparql/SyntaxBuilder';
import TripleBuilder from '@/sparql/TripleBuilder';
import ValuePatternBuilder from '@/sparql/ValuePatternBuilder';
import { MinusPattern, Pattern, Term } from 'sparqljs';

type StringTermType = 'NamedNode' | 'Literal';

export default class StringValuePatternBuilder implements ValuePatternBuilder {
	private readonly ALLOWED_DATATYPES = [ 'string', 'external-id', 'url' ];

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
			datatype,
			value,
			negate,
		} = condition;

		if ( !this.ALLOWED_DATATYPES.includes( datatype ) ) {
			throw new Error( 'Unexpected datatype: ' + datatype );
		}
		if ( typeof value !== 'string' ) {
			throw new Error( 'Unexpected value type: ' + typeof value );
		}
		const objectTermType: StringTermType = datatype === 'url' ? 'NamedNode' : 'Literal';
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
			this.buildObjectItems( propertyId, propertyValueRelation, value, repeatingPropertyIndex, objectTermType ),
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

		if ( propertyValueRelation === PropertyValueRelation.NotMatching ) {
			const notMatchingPattern = this.buildNotMatchingPattern( propertyId, value, objectTermType );
			patterns.push( notMatchingPattern );
		}

		return patterns;
	}

	private buildNotMatchingPattern(
		propertyId: string,
		value: string,
		objectTermType: StringTermType,
	): MinusPattern {
		const notMatchingValueTriple = this.syntaxBuilder.buildPathTriple(
			{
				termType: 'Variable',
				value: 'item',
			},
			[
				rdfNamespaces.p + propertyId,
				rdfNamespaces.ps + propertyId,
			],
			{
				termType: objectTermType,
				value,
			},
		);
		return {
			type: 'minus',
			patterns: [ this.syntaxBuilder.buildBgpPattern( [ notMatchingValueTriple ] ) ],
		};
	}

	private buildObjectItems(
		propertyId: string,
		propertyValueRelation: PropertyValueRelation,
		value: string,
		propertyIndex: string,
		objectTermType: StringTermType,
	): Term {
		switch ( propertyValueRelation ) {
			case ( PropertyValueRelation.NotMatching ):
				return {
					termType: 'Variable',
					value: 'instance', // TODO should this have + propertyId?
				};
			case ( PropertyValueRelation.Regardless ):
				return {
					termType: 'BlankNode',
					value: propertyIndex !== '' ? `anyValue${propertyId}_${propertyIndex}` : `anyValue${propertyId}`,
				};
			case ( PropertyValueRelation.Matching ):
				return {
					termType: objectTermType,
					value,
				};
			default:
				throw new Error( `unsupported relation: ${propertyValueRelation}` );
		}
	}

}
