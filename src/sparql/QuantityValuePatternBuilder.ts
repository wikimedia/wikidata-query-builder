import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import ReferenceRelation from '@/data-model/ReferenceRelation';
import UnitValue from '@/data-model/UnitValue';
import { Condition, ConditionValue } from '@/sparql/QueryRepresentation';
import rdfNamespaces from '@/sparql/rdfNamespaces';
import SyntaxBuilder from '@/sparql/SyntaxBuilder';
import TripleBuilder from '@/sparql/TripleBuilder';
import ValuePatternBuilder from '@/sparql/ValuePatternBuilder';
import { BindPattern, Pattern } from 'sparqljs';

export default class QuantityValuePatternBuilder implements ValuePatternBuilder {

	private readonly tripleBuilder: TripleBuilder;
	private readonly syntaxBuilder: SyntaxBuilder;

	public constructor() {
		this.tripleBuilder = new TripleBuilder();
		this.syntaxBuilder = new SyntaxBuilder();
	}

	public buildValuePatternFromCondition( condition: Condition, conditionIndex: number ): Pattern[] {
		const {
			propertyId,
			negate,
			referenceRelation,
			propertyValueRelation,
			datatype,
			value,
		} = condition;

		if ( datatype !== 'quantity' ) {
			throw new Error( 'Unexpected datatype: ' + datatype );
		}

		let patterns: Pattern[];

		if ( propertyValueRelation === PropertyValueRelation.Regardless ) {
			patterns = this.buildRegardlessOfValuePattern( propertyId, conditionIndex, referenceRelation );
		} else {
			patterns = this.buildValuePatterns(
				value,
				propertyValueRelation,
				propertyId,
				conditionIndex,
				referenceRelation,
			);
		}

		if ( negate ) {
			return [ {
				type: 'minus',
				patterns: patterns,
			} ];
		}
		return patterns;
	}

	private buildValuePatterns(
		value: ConditionValue,
		propertyValueRelation: PropertyValueRelation,
		propertyId: string,
		conditionIndex: number,
		referenceRelation: ReferenceRelation,
	): Pattern[] {
		if ( !this.isQuantityValue( value ) ) {
			throw new Error( 'Unexpected value quantity value: ' + JSON.stringify( value ) );
		}

		const numericValue = value.value;
		const unit = value.unit;

		if ( unit === null || propertyValueRelation === PropertyValueRelation.Regardless ) {
			return this.buildPatternsForUnitlessValue(
				propertyId,
				numericValue,
				conditionIndex,
				referenceRelation,
				propertyValueRelation,
			);
		} else {
			return this.buildFullQuantityPattern(
				numericValue,
				unit,
				conditionIndex,
				propertyId,
				referenceRelation,
				propertyValueRelation,
			);
		}
	}

	private buildRegardlessOfValuePattern(
		propertyId: string,
		conditionIndex: number,
		referenceRelation: ReferenceRelation,
	): Pattern[] {
		const numericQuantityVariable = this.syntaxBuilder.buildVariableTermFromName( 'numericQuantity' );
		const statementVariable = this.syntaxBuilder.buildVariableTermFromName( 'statement' + conditionIndex );
		const bgp = this.syntaxBuilder.buildBgpPattern( [
			this.syntaxBuilder.buildSimpleTriple(
				{
					termType: 'Variable',
					value: 'item',
				},
				rdfNamespaces.p + propertyId,
				statementVariable,
			),
			this.syntaxBuilder.buildPathTriple(
				statementVariable,
				[
					rdfNamespaces.psv + propertyId,
					rdfNamespaces.wikibase + 'quantityAmount',
				],
				numericQuantityVariable,
			),
		] );

		const patterns: Pattern[] = [ bgp ];

		const referenceFilterPattern = this.tripleBuilder.buildReferenceFilterPattern(
			referenceRelation,
			statementVariable,
		);
		if ( referenceFilterPattern !== null ) {
			patterns.push( referenceFilterPattern );
		}

		return patterns;
	}

	private buildFullQuantityPattern(
		numericValue: number,
		unit: string,
		conditionIndex: number,
		propertyId: string,
		referenceRelation: ReferenceRelation,
		propertyValueRelation: PropertyValueRelation,
	): Pattern[] {
		const patterns: Pattern[] = [];

		const userQuantityVariable = this.syntaxBuilder.buildVariableTermFromName( 'userQuantity' );
		const userQuantityBind: BindPattern = {
			type: 'bind',
			variable: userQuantityVariable,
			expression: this.syntaxBuilder.buildLiteralTermForDecimalNumber( numericValue ),
		};
		patterns.push( userQuantityBind );

		const userUnitVariable = this.syntaxBuilder.buildVariableTermFromName( 'userUnit' );
		const userUnitBind: BindPattern = {
			type: 'bind',
			variable: userUnitVariable,
			expression: {
				termType: 'NamedNode',
				value: `${rdfNamespaces.wd}${unit}`,
			},
		};
		patterns.push( userUnitBind );

		const conversionPropertyId = this.getSiConversionPropertyId();

		const conversionFactorVariable = this.syntaxBuilder.buildVariableTermFromName( 'conversionFactor' );
		const unitToConversionFactorTriple = this.syntaxBuilder.buildPathTriple(
			userUnitVariable,
			[
				rdfNamespaces.p + conversionPropertyId,
				rdfNamespaces.psv + conversionPropertyId,
				rdfNamespaces.wikibase + 'quantityAmount',
			],
			conversionFactorVariable,
		);
		const coherentUnitVariable = this.syntaxBuilder.buildVariableTermFromName( 'coherentUnit' );
		const unitToCoherentUnitTriple = this.syntaxBuilder.buildPathTriple(
			userUnitVariable,
			[
				rdfNamespaces.p + conversionPropertyId,
				rdfNamespaces.psv + conversionPropertyId,
				rdfNamespaces.wikibase + 'quantityUnit',
			],
			coherentUnitVariable,
		);
		const conversionGroup = this.syntaxBuilder.buildBgpPattern( [
			unitToConversionFactorTriple,
			unitToCoherentUnitTriple,
		] );
		patterns.push( conversionGroup );

		const coherentUserQuantityVariable = this.syntaxBuilder.buildVariableTermFromName( 'coherentUserQuantity' );
		const coherentUserQuantityBind: BindPattern = {
			type: 'bind',
			variable: coherentUserQuantityVariable,
			expression: this.syntaxBuilder.buildOperationsExpression(
				userQuantityVariable,
				'*',
				conversionFactorVariable,
			),
		};
		patterns.push( coherentUserQuantityBind );

		const statementVariable = this.syntaxBuilder.buildVariableTermFromName( 'statement' + conditionIndex );
		const entityToStatementTriple = this.syntaxBuilder.buildSimpleTriple(
			{
				termType: 'Variable',
				value: 'item',
			},
			rdfNamespaces.p + propertyId,
			statementVariable,
		);
		const statementQuantityVariable = this.syntaxBuilder.buildVariableTermFromName( 'statementQuantity' );
		const statementToAmountTriple = this.syntaxBuilder.buildPathTriple(
			statementVariable,
			[
				rdfNamespaces.psn + propertyId,
				rdfNamespaces.wikibase + 'quantityAmount',
			],
			statementQuantityVariable,
		);
		const statementToUnitTyple = this.syntaxBuilder.buildPathTriple(
			statementVariable,
			[
				rdfNamespaces.psn + propertyId,
				rdfNamespaces.wikibase + 'quantityUnit',
			],
			coherentUnitVariable,
		);
		const entityQuantityGroup = this.syntaxBuilder.buildBgpPattern(
			[
				entityToStatementTriple,
				statementToAmountTriple,
				statementToUnitTyple,
			],
		);
		patterns.push( entityQuantityGroup );

		const operator = this.getFilterOperatorFromRelation( propertyValueRelation );
		if ( operator !== null ) {
			const valueFilterPattern = this.syntaxBuilder.buildOperatorFilterPattern(
				statementQuantityVariable,
				operator,
				coherentUserQuantityVariable,
			);
			patterns.push( valueFilterPattern );
		}

		const referenceFilterPattern = this.tripleBuilder.buildReferenceFilterPattern(
			referenceRelation,
			statementVariable,
		);
		if ( referenceFilterPattern !== null ) {
			patterns.push( referenceFilterPattern );
		}

		return patterns;
	}

	private buildPatternsForUnitlessValue(
		propertyId: string,
		numericValue: number,
		conditionIndex: number,
		referenceRelation: ReferenceRelation,
		propertyValueRelation: PropertyValueRelation,
	): Pattern[] {
		const patterns: Pattern[] = [];
		const numericQuantityVariable = this.syntaxBuilder.buildVariableTermFromName( 'numericQuantity' );
		const statementVariable = this.syntaxBuilder.buildVariableTermFromName( 'statement' + conditionIndex );
		const bgp = this.syntaxBuilder.buildBgpPattern( [
			this.syntaxBuilder.buildSimpleTriple(
				{
					termType: 'Variable',
					value: 'item',
				},
				rdfNamespaces.p + propertyId,
				statementVariable,
			),
			this.syntaxBuilder.buildPathTriple(
				statementVariable,
				[
					rdfNamespaces.psv + propertyId,
					rdfNamespaces.wikibase + 'quantityAmount',
				],
				numericQuantityVariable,
			),
		] );
		patterns.push( bgp );

		const operator = this.getFilterOperatorFromRelation( propertyValueRelation );
		if ( operator !== null ) {
			const valueFilterPattern = this.syntaxBuilder.buildOperatorFilterPattern(
				numericQuantityVariable,
				operator,
				this.syntaxBuilder.buildLiteralTermForDecimalNumber( numericValue ),
			);
			patterns.push( valueFilterPattern );
		}

		const referenceFilterPattern = this.tripleBuilder.buildReferenceFilterPattern(
			referenceRelation,
			statementVariable,
		);
		if ( referenceFilterPattern !== null ) {
			patterns.push( referenceFilterPattern );
		}

		return patterns;
	}

	private isQuantityValue( value: ConditionValue ): value is UnitValue {
		return typeof value === 'object' &&
			( ( value as UnitValue ).unit === null || typeof ( value as UnitValue ).unit === 'string' );
	}

	private getFilterOperatorFromRelation( propertyValueRelation: PropertyValueRelation ): string | null {
		switch ( propertyValueRelation as PropertyValueRelation ) {
			case PropertyValueRelation.Matching:
				return '=';
			case PropertyValueRelation.NotMatching:
				return '!=';
			case PropertyValueRelation.LessThan:
				return '<';
			case PropertyValueRelation.MoreThan:
				return '>';
			case PropertyValueRelation.Regardless:
				return null;
		}
	}

	private getSiConversionPropertyId(): string {
		if ( !process.env.VUE_APP_SI_CONVERSION_PROPERTY ) {
			throw new Error( 'Property for conversion to SI units has to be defined!' );
		}
		return process.env.VUE_APP_SI_CONVERSION_PROPERTY;
	}
}
