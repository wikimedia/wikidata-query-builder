import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import { Condition } from '@/sparql/QueryRepresentation';
import rdfNamespaces from '@/sparql/rdfNamespaces';
import SyntaxBuilder from '@/sparql/SyntaxBuilder';
import TripleBuilder from '@/sparql/TripleBuilder';
import ValuePatternBuilder from '@/sparql/ValuePatternBuilder';
import { MinusPattern, Pattern, PropertyPath, Term } from 'sparqljs';

export default class EntityValueBuilder implements ValuePatternBuilder {
	private readonly expectedDatatype: string;
	private readonly tripleBuilder: TripleBuilder;
	private readonly syntaxBuilder: SyntaxBuilder;

	public constructor( expectedDatatype: string ) {
		this.expectedDatatype = expectedDatatype;
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
			subclasses,
		} = condition;
		if ( datatype !== this.expectedDatatype ) {
			throw new Error( 'Expected datatype ' + this.expectedDatatype + ', got: ' + datatype );
		}

		if ( typeof value !== 'string' ) {
			throw new Error( 'Unexpected ' + this.expectedDatatype + ' value type: ' + typeof value );
		}
		let patterns: Pattern[] = [];

		const statementVariable = this.syntaxBuilder.buildVariableTermFromName( 'statement' + conditionIndex );
		const entityToStatementTriple = this.syntaxBuilder.buildSimpleTriple(
			{
				termType: 'Variable',
				value: 'item',
			},
			rdfNamespaces.p + propertyId,
			statementVariable,
		);
		const statementToValueTriple = this.syntaxBuilder.buildPathTriple(
			statementVariable,
			this.buildStatementToValuePredicateItems(
				propertyId, subclasses,
			),
			this.buildObjectItems( propertyId, propertyValueRelation, value, repeatingPropertyIndex ),
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
			const notMatchingPattern = this.buildNotMatchingPattern( propertyId, value );
			patterns.push( notMatchingPattern );
		}

		return patterns;
	}

	private buildNotMatchingPattern( propertyId: string, value: string ): MinusPattern {
		const notMatchingValueTriple = this.syntaxBuilder.buildPathTriple(
			{
				termType: 'Variable',
				value: 'item',
			},
			[
				rdfNamespaces.p + propertyId,
				rdfNamespaces.ps + propertyId,
				// todo: should this have the subclass as well?
			],
			{
				termType: 'NamedNode',
				value: `${rdfNamespaces.wd}${value}`,
			},
		);
		return {
			type: 'minus',
			patterns: [ this.syntaxBuilder.buildBgpPattern( [ notMatchingValueTriple ] ) ],
		};
	}

	private buildStatementToValuePredicateItems(
		propertyId: string, subclasses: boolean,
	): ( PropertyPath | string )[] {
		const statementToValuePredicateItems: ( PropertyPath | string )[] = [
			rdfNamespaces.ps + propertyId,
		];
		if ( subclasses ) {
			statementToValuePredicateItems.push(
				this.syntaxBuilder.buildPropertyPath( '*', [
					{
						termType: 'NamedNode',
						value: rdfNamespaces.wdt + this.getSubclassPropertyId( propertyId ),
					},
				] ),
			);
		}
		return statementToValuePredicateItems;
	}

	private getSubclassPropertyId( propertyId: string ): string {
		if ( !process.env.VUE_APP_SUBCLASS_PROPERTY_MAP ) {
			return 'P279';
		}
		const propertyMap = JSON.parse( process.env.VUE_APP_SUBCLASS_PROPERTY_MAP );
		if ( !propertyMap[ propertyId ] ) {
			return propertyMap.default;
		}
		return propertyMap[ propertyId ];
	}

	private buildObjectItems(
		propertyId: string,
		propertyValueRelation: PropertyValueRelation,
		value: string,
		propertyIndex: string,
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
					termType: 'NamedNode',
					value: `${rdfNamespaces.wd}${value}`,
				};
			default:
				throw new Error( `unsupported relation: ${propertyValueRelation}` );
		}
	}
}
