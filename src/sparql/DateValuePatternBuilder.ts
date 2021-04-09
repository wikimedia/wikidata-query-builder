import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import ReferenceRelation from '@/data-model/ReferenceRelation';
import TimeValue from '@/data-model/TimeValue';
import { Condition, ConditionValue } from '@/sparql/QueryRepresentation';
import rdfNamespaces from '@/sparql/rdfNamespaces';
import SyntaxBuilder from '@/sparql/SyntaxBuilder';
import TripleBuilder from '@/sparql/TripleBuilder';
import ValuePatternBuilder from '@/sparql/ValuePatternBuilder';
import * as RdfJs from 'rdf-js';
import { BindPattern, FilterPattern, Pattern, VariableTerm } from 'sparqljs';

enum Precision {
	DAY= 11,
	MONTH = 10,
	YEAR = 9,
}

export default class DateValuePatternBuilder implements ValuePatternBuilder {

	private readonly tripleBuilder: TripleBuilder;
	private readonly syntaxBuilder: SyntaxBuilder;
	private conditionIndex: number | null = null;

	public constructor() {
		this.tripleBuilder = new TripleBuilder();
		this.syntaxBuilder = new SyntaxBuilder();
	}

	public buildValuePatternFromCondition( condition: Condition, conditionIndex: number ): Pattern[] {
		const {
			propertyId,
			referenceRelation,
			propertyValueRelation,
			value,
			negate,
		} = condition;
		this.conditionIndex = conditionIndex;

		let patterns: Pattern[];

		if ( propertyValueRelation === PropertyValueRelation.Regardless ) {
			patterns = this.buildRegardlessOfValuePattern( propertyId );
		} else {
			patterns = this.buildValuePattern( propertyId, value, propertyValueRelation );
		}

		patterns = this.addReferenceFilterPatternIfNeeded( patterns, referenceRelation );
		patterns = this.negatePatternsIfNeeded( patterns, negate );

		return patterns;
	}

	private buildValuePattern(
		propertyId: string,
		value: ConditionValue,
		propertyValueRelation: PropertyValueRelation,
	): Pattern[] {
		if ( !this.isDateValue( value ) ) {
			throw new Error( 'Unexpected value for date: ' + JSON.stringify( value ) );
		}

		let patterns: Pattern[];

		if ( value.precision === Precision.DAY ) {
			patterns = this.buildDayPrecisionPatterns( propertyId, value, propertyValueRelation );
		} else {
			patterns = this.buildLowPrecisionPatterns( propertyId, value, propertyValueRelation );
		}

		return patterns;
	}

	private buildRegardlessOfValuePattern(
		propertyId: string,
	): Pattern[] {
		let patterns: Pattern[] = [];

		patterns = this.addEntityToStatementPattern( patterns, propertyId );
		patterns = this.addStatementToStatementValuePattern( patterns, propertyId );
		patterns = this.addStatementValueToTimeValuePattern( patterns, propertyId );

		return patterns;
	}

	private buildDayPrecisionPatterns(
		propertyId: string,
		value: TimeValue,
		propertyValueRelation: PropertyValueRelation,
	): Pattern[] {
		let patterns: Pattern[] = [];

		patterns = this.addEntityToStatementPattern( patterns, propertyId );
		patterns = this.addStatementToStatementValuePattern( patterns, propertyId );
		patterns = this.addStatementValueToTimeValuePattern( patterns, propertyId );

		const datetimeVariable = this.getConditionVariable( propertyId );
		if ( propertyValueRelation === PropertyValueRelation.Matching ) {
			const matchingDateBind: BindPattern = {
				type: 'bind',
				variable: datetimeVariable,
				expression: this.syntaxBuilder.buildLiteralTermForDateTime( value.value ),
			};
			patterns.push( matchingDateBind );
		}
		if ( propertyValueRelation === PropertyValueRelation.NotMatching ) {
			const notMatchingFilter = this.syntaxBuilder.buildOperatorFilterPattern(
				datetimeVariable,
				'!=',
				this.syntaxBuilder.buildLiteralTermForDateTime( value.value ),
			);
			patterns.push( notMatchingFilter );
		}

		if ( propertyValueRelation === PropertyValueRelation.LessThan ) {
			const beforeFilter = this.syntaxBuilder.buildOperatorFilterPattern(
				datetimeVariable,
				'<',
				this.syntaxBuilder.buildLiteralTermForDateTime( value.value ),
			);
			patterns.push( beforeFilter );
		}

		if ( propertyValueRelation === PropertyValueRelation.MoreThan ) {
			const afterFilter = this.syntaxBuilder.buildOperatorFilterPattern(
				datetimeVariable,
				'>',
				this.syntaxBuilder.buildLiteralTermForDateTime( value.value ),
			);
			patterns.push( afterFilter );
		}

		return patterns;
	}

	private buildLowPrecisionPatterns(
		propertyId: string,
		value: TimeValue,
		propertyValueRelation: PropertyValueRelation,
	): Pattern[] {
		let patterns: Pattern[] = [];

		patterns = this.addEntityToStatementPattern( patterns, propertyId );
		patterns = this.addStatementToStatementValuePattern( patterns, propertyId );

		patterns = this.addStatementValueToPrecisionPattern( patterns );
		patterns = this.addRangeSafeHintPattern( patterns );
		patterns = this.addPrecisionFilterPattern( patterns, value );

		patterns = this.addStatementValueToTimeValuePattern( patterns, propertyId );
		patterns = this.addRangeSafeHintPattern( patterns );
		patterns = this.addDateTimeFilterPattern( patterns, value, propertyId, propertyValueRelation );

		return patterns;
	}

	private addDateTimeFilterPattern(
		patterns: Pattern[],
		value: TimeValue,
		propertyId: string,
		propertyValueRelation: PropertyValueRelation,
	): Pattern[] {
		const dateTimeFilterPattern = this.buildDateTimeFilterPattern( value, propertyId, propertyValueRelation );
		patterns.push( dateTimeFilterPattern );
		return patterns;
	}

	private buildDateTimeFilterPattern(
		value: TimeValue,
		propertyId: string,
		propertyValueRelation: PropertyValueRelation,
	): FilterPattern {
		let followingDateTime;
		switch ( value.precision ) {
			case Precision.MONTH:
				followingDateTime = this.calculateFollowingMonthDateTime( value.value );
				break;
			case Precision.YEAR:
				followingDateTime = this.calculateFollowingYearDateTime( value.value );
				break;
			default:
				throw new Error( 'Unexpected precision value: ' + value.precision );
		}
		const dateTimeVariable = this.getConditionVariable( propertyId );

		if ( propertyValueRelation === PropertyValueRelation.Matching ) {
			return this.syntaxBuilder.buildOperatorFilterPattern(
				this.syntaxBuilder.buildOperationsExpression(
					this.syntaxBuilder.buildLiteralTermForDateTime( value.value ),
					'<=',
					dateTimeVariable,
				),
				'&&',
				this.syntaxBuilder.buildOperationsExpression(
					dateTimeVariable,
					'<',
					this.syntaxBuilder.buildLiteralTermForDateTime( followingDateTime ),
				),
			);
		}
		if ( propertyValueRelation === PropertyValueRelation.NotMatching ) {
			return this.syntaxBuilder.buildOperatorFilterPattern(
				this.syntaxBuilder.buildOperationsExpression(
					this.syntaxBuilder.buildLiteralTermForDateTime( value.value ),
					'<',
					dateTimeVariable,
				),
				'||',
				this.syntaxBuilder.buildOperationsExpression(
					dateTimeVariable,
					'>=',
					this.syntaxBuilder.buildLiteralTermForDateTime( followingDateTime ),
				),
			);
		}

		if ( propertyValueRelation === PropertyValueRelation.LessThan ) {
			return this.syntaxBuilder.buildOperatorFilterPattern(
				this.syntaxBuilder.buildLiteralTermForDateTime( value.value ),
				'<',
				dateTimeVariable,
			);
		}

		if ( propertyValueRelation === PropertyValueRelation.MoreThan ) {
			return this.syntaxBuilder.buildOperatorFilterPattern(
				dateTimeVariable,
				'>=',
				this.syntaxBuilder.buildLiteralTermForDateTime( followingDateTime ),
			);
		}

		throw new Error( 'Unexpected property value relation: ' + propertyValueRelation );
	}

	private calculateFollowingYearDateTime( originalDateTime: string ): string {
		const match = originalDateTime.match( /^(?<sign>[+-])(?<year>\d+)/ );
		if ( match === null || !match.groups ) {
			throw new Error( 'date string not in expected format: ' + originalDateTime );
		}
		const {
			year: originalYear,
			sign: originalSign,
		} = match.groups;
		const followingYear = originalSign === '+' ?
			( Number( originalYear ) + 1 ).toString() :
			( Number( originalYear ) - 1 ).toString();

		return `${originalSign}${followingYear}-00-00T00:00:00Z`;
	}

	private calculateFollowingMonthDateTime( originalDateTime: string ): string {
		const match = originalDateTime.match( /^(?<sign>[+-])(?<year>\d+)-(?<month>\d{2})/ );
		if ( match === null || !match.groups ) {
			throw new Error( 'date string not in expected format: ' + originalDateTime );
		}
		const {
			year: originalYear,
			month: originalMonth,
			sign: originalSign,
		} = match.groups;
		let followingMonth;
		let followingYear;
		if ( originalMonth !== '12' ) {
			followingMonth = ( Number( originalMonth ) + 1 ).toString().padStart( 2, '0' );
			followingYear = originalYear;
		} else {
			followingMonth = '01';
			followingYear = originalSign === '+' ?
				( Number( originalYear ) + 1 ).toString() :
				( Number( originalYear ) - 1 ).toString();
		}

		return `${originalSign}${followingYear}-${followingMonth}-00T00:00:00Z`;
	}

	private addEntityToStatementPattern( patterns: Pattern[], propertyId: string ): Pattern[] {
		const statementVariable = this.getConditionVariable( 'statement' );
		const entityToStatementTriple = this.syntaxBuilder.buildSimpleTriple(
			{ termType: 'Variable', value: 'item' },
			rdfNamespaces.p + propertyId,
			statementVariable,
		);
		patterns.push( this.syntaxBuilder.buildBgpPattern( [
			entityToStatementTriple,
		] ) );
		return patterns;
	}

	private addStatementToStatementValuePattern( patterns: Pattern[], propertyId: string ): Pattern[] {
		const statementVariable = this.getConditionVariable( 'statement' );
		const statementValueVariable = this.getConditionVariable( 'statementValue' );
		const statementToStatementValueTriple = this.syntaxBuilder.buildSimpleTriple(
			statementVariable,
			rdfNamespaces.psv + propertyId,
			statementValueVariable,
		);
		patterns.push( this.syntaxBuilder.buildBgpPattern( [
			statementToStatementValueTriple,
		] ) );
		return patterns;
	}

	private addStatementValueToTimeValuePattern( patterns: Pattern[], propertyId: string ): Pattern[] {
		const statementValueVariable = this.getConditionVariable( 'statementValue' );
		const datetimeVariable = this.getConditionVariable( propertyId );
		const statementToValueTriple = this.syntaxBuilder.buildSimpleTriple(
			statementValueVariable,
			rdfNamespaces.wikibase + 'timeValue',
			datetimeVariable,
		);
		patterns.push( this.syntaxBuilder.buildBgpPattern( [
			statementToValueTriple,
		] ) );
		return patterns;
	}

	private addStatementValueToPrecisionPattern( patterns: Pattern[] ): Pattern[] {
		const statementValueVariable = this.getConditionVariable( 'statementValue' );
		const precisionVariable = this.getConditionVariable( 'precision' );
		const statementValueToPrecisionTriple = this.syntaxBuilder.buildSimpleTriple(
			statementValueVariable,
			rdfNamespaces.wikibase + 'timePrecision',
			precisionVariable,
		);
		const precisionPattern = this.syntaxBuilder.buildBgpPattern( [
			statementValueToPrecisionTriple,
		] );
		patterns.push( precisionPattern );

		return patterns;
	}

	private addRangeSafeHintPattern( patterns: Pattern[] ): Pattern[] {
		const hintRangeSafeTriple = this.syntaxBuilder.buildSimpleTriple(
			{
				termType: 'NamedNode',
				value: rdfNamespaces.hint + 'Prior',
			},
			rdfNamespaces.hint + 'rangeSafe',
			{
				termType: 'Literal',
				value: 'true',
				datatype: {
					termType: 'NamedNode',
					value: rdfNamespaces.xsd + 'boolean',
				} as RdfJs.NamedNode,
			},
		);
		const hintPattern = this.syntaxBuilder.buildBgpPattern( [
			hintRangeSafeTriple,
		] );
		patterns.push( hintPattern );

		return patterns;
	}

	private addPrecisionFilterPattern( patterns: Pattern[], value: TimeValue ): Pattern[] {
		const precisionVariable = this.getConditionVariable( 'precision' );
		const precisionFilterPattern = this.syntaxBuilder.buildOperatorFilterPattern(
			precisionVariable,
			'>=',
			this.syntaxBuilder.buildLiteralTermForDecimalNumber( value.precision ),
		);
		patterns.push( precisionFilterPattern );
		return patterns;
	}

	private addReferenceFilterPatternIfNeeded( patterns: Pattern[], referenceRelation: ReferenceRelation ): Pattern[] {
		const referenceFilterPattern = this.tripleBuilder.buildReferenceFilterPattern(
			referenceRelation,
			this.getConditionVariable( 'statement' ),
		);
		if ( referenceFilterPattern !== null ) {
			patterns.push( referenceFilterPattern );
			patterns = [ { type: 'group', patterns } ];
		}

		return patterns;
	}

	private negatePatternsIfNeeded( patterns: Pattern[], negate: boolean ): Pattern[] {
		if ( negate ) {
			return [ {
				type: 'minus',
				patterns: patterns,
			} ];
		}

		return patterns;
	}

	private getConditionVariable( prefix: string ): VariableTerm {
		if ( this.conditionIndex === null ) {
			throw new Error( 'initializing condition index failed!' );
		}
		return this.syntaxBuilder.buildVariableTermFromName( `${prefix}_${this.conditionIndex}` );
	}

	private isDateValue( value: ConditionValue ): value is TimeValue {
		return typeof value === 'object' &&
			typeof ( value as TimeValue ).value === 'string' && typeof ( value as TimeValue ).precision === 'number';
	}
}
