import TimeValue from '@/data-model/TimeValue';
import buildQuery from '@/sparql/buildQuery';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import { Condition, ConditionValue } from '@/sparql/QueryRepresentation';
import ReferenceRelation from '@/data-model/ReferenceRelation';
import ConditionRelation from '@/data-model/ConditionRelation';

describe( 'buildQuery', () => {

	function getSimpleCondition( propertyId: string, value: ConditionValue ): Condition {
		const propertyValueRelation = PropertyValueRelation.Matching;
		const simpleCondition: Condition = {
			propertyId,
			value,
			datatype: 'string',
			propertyValueRelation,
			referenceRelation: ReferenceRelation.Regardless,
			subclasses: false,
			conditionRelation: null,
			negate: false,
		};

		return simpleCondition;
	}

	it( 'builds a query from conditions connected with OR', () => {
		const expectedQuery = `SELECT DISTINCT ?item WHERE {
      ?item p:P31 ?statement0. ?statement0 (ps:P31) wd:Q515.
      { ?item p:P17 ?statement1. ?statement1 (ps:P17) wd:Q17. } UNION
      { ?item p:P17 ?statement2. ?statement2 (ps:P17) wd:Q183. }
    }`;

		const actualQuery = buildQuery( {
			conditions: [
				{
					...getSimpleCondition( 'P31', 'Q515' ),
					datatype: 'wikibase-item',
				},
				{
					...getSimpleCondition( 'P17', 'Q17' ),
					datatype: 'wikibase-item',
				},
				{
					...getSimpleCondition( 'P17', 'Q183' ),
					datatype: 'wikibase-item',
					conditionRelation: ConditionRelation.Or,
				},
			],
			omitLabels: true,
		} );

		expect( actualQuery.replace( /\s+/g, ' ' ) ).toEqual( expectedQuery.replace( /\s+/g, ' ' ) );
	} );

	it( 'builds a query from conditions connected with AND and OR', () => {
		const expectedQuery = `SELECT DISTINCT ?item WHERE {
      { ?item p:P31 ?statement0. ?statement0 (ps:P31) wd:Q515. } UNION
      { ?item p:P17 ?statement1. ?statement1 (ps:P17) wd:Q183. }
	  { ?item p:P66 ?statement2. ?statement2 (ps:P66) wd:Q432. } UNION
	  { ?item p:P99 ?statement3. ?statement3 (ps:P99) wd:Q5653. }
    }`;

		const actualQuery = buildQuery( {
			conditions: [
				{
					...getSimpleCondition( 'P31', 'Q515' ),
					datatype: 'wikibase-item',
				},
				{
					...getSimpleCondition( 'P17', 'Q183' ),
					datatype: 'wikibase-item',
					conditionRelation: ConditionRelation.Or,
				},
				{
					...getSimpleCondition( 'P66', 'Q432' ),
					datatype: 'wikibase-item',
					// all conditionRelations that are not the first have implicitly
					// conditionRelation: ConditionRelation.And added to them in the store
				},
				{
					...getSimpleCondition( 'P99', 'Q5653' ),
					datatype: 'wikibase-item',
					conditionRelation: ConditionRelation.Or,
				},
			],
			omitLabels: true,
		} );

		expect( actualQuery.replace( /\s+/g, ' ' ) ).toEqual( expectedQuery.replace( /\s+/g, ' ' ) );
	} );

	it( 'builds a query only with references', () => {
		const propertyId = 'P666';
		const value = 'blah';
		const actualQuery = buildQuery( {
			conditions: [
				{
					...getSimpleCondition( propertyId, value ),
					referenceRelation: ReferenceRelation.With,
				},
			],
			omitLabels: true,
		} );
		const expectedQuery = `SELECT DISTINCT ?item WHERE {
			{ ?item p:P666 ?statement0.
			?statement0 (ps:${propertyId}) "${value}".
			FILTER(EXISTS { ?statement0 prov:wasDerivedFrom ?reference.
			}) } }`;
		expect( actualQuery.replace( /\s+/g, ' ' ) ).toEqual( expectedQuery.replace( /\s+/g, ' ' ) );
	} );

	it( 'builds a query only without references', () => {
		const propertyId = 'P666';
		const value = 'blah';
		const actualQuery = buildQuery( {
			conditions: [
				{
					...getSimpleCondition( propertyId, value ),
					referenceRelation: ReferenceRelation.Without,
				},
			],
			omitLabels: true,
		} );
		const expectedQuery = `SELECT DISTINCT ?item WHERE {
			{ ?item p:P666 ?statement0.
			?statement0 (ps:${propertyId}) "${value}".
			FILTER(NOT EXISTS { ?statement0 prov:wasDerivedFrom ?reference.
			}) } }`;
		expect( actualQuery.replace( /\s+/g, ' ' ) ).toEqual( expectedQuery.replace( /\s+/g, ' ' ) );
	} );

	it( 'builds a query from a property and a string value', () => {
		const propertyId = 'P666';
		const value = 'blah';
		const expectedQuery = `SELECT DISTINCT ?item WHERE {
		 ?item p:${propertyId} ?statement0.
		 ?statement0 (ps:${propertyId}) "${value}".
		 }`;
		const actualQuery = buildQuery( {
			conditions: [
				getSimpleCondition( propertyId, value ),
			],
			omitLabels: true,
		} );
		expect( actualQuery.replace( /\s+/g, ' ' ) ).toEqual( expectedQuery.replace( /\s+/g, ' ' ) );
	} );

	it( 'builds a query from a property and a string value with not matching selected', () => {
		const propertyId = 'P666';
		const value = 'blah';
		const condition = getSimpleCondition( propertyId, value );
		condition.propertyValueRelation = PropertyValueRelation.NotMatching;

		const expectedQuery =
			`SELECT DISTINCT ?item WHERE {
			?item p:${propertyId} ?statement0.
			?statement0 (ps:${propertyId}) ?instance.
			MINUS { ?item (p:P666/ps:P666) "${value}". }
			}`;

		const receivedQuery = buildQuery( {
			conditions: [ condition ],
			omitLabels: true,
		} );

		expect( receivedQuery.replace( /\s+/g, ' ' ) ).toEqual( expectedQuery.replace( /\s+/g, ' ' ) );
	} );

	it( 'builds a query from a property with "any value" selected', () => {
		const propertyId = 'P666';
		const condition = getSimpleCondition( propertyId, '' );
		condition.propertyValueRelation = PropertyValueRelation.Regardless;
		const expectedQuery =
			`SELECT DISTINCT ?item WHERE {
				?item p:${propertyId} ?statement0.
				?statement0 (ps:${propertyId}) _:anyValue${propertyId}.
			}`;
		const actualQuery = buildQuery( {
			conditions: [ condition ],
			omitLabels: true,
		} );

		expect( actualQuery.replace( /\s+/g, ' ' ) ).toEqual( expectedQuery.replace( /\s+/g, ' ' ) );
	} );

	it( 'builds a query from multiple conditions, one matching and one regardless', () => {
		const expectedQuery =
			`SELECT DISTINCT ?item WHERE {
			?item p:P666 ?statement0.
			?statement0 (ps:P666) "blah".
			?item p:P66 ?statement1.
			?statement1 (ps:P66) _:anyValueP66.
			}`;
		const secondCondition = getSimpleCondition( 'P66', '' );
		secondCondition.propertyValueRelation = PropertyValueRelation.Regardless;
		const actualQuery = buildQuery( {
			conditions: [
				getSimpleCondition( 'P666', 'blah' ),
				secondCondition,
			],
			omitLabels: true,
		} );

		expect( actualQuery.replace( /\s+/g, ' ' ) ).toEqual( expectedQuery.replace( /\s+/g, ' ' ) );
	} );

	it( 'builds a query from multiple conditions, one matching and one non-matching', () => {
		const expectedQuery =
			`SELECT DISTINCT ?item WHERE {
			?item p:P666 ?statement0.
			?statement0 (ps:P666) "blah".
			?item p:P66 ?statement1.
			?statement1 (ps:P66) ?instance.
			MINUS { ?item (p:P66/ps:P66) "foo". }
			}`;
		const secondCondition = getSimpleCondition( 'P66', 'foo' );
		secondCondition.propertyValueRelation = PropertyValueRelation.NotMatching;
		const actualQuery = buildQuery( {
			conditions: [
				getSimpleCondition( 'P666', 'blah' ),
				secondCondition,
			],
			omitLabels: true,
		} );

		expect( actualQuery.replace( /\s+/g, ' ' ) ).toEqual( expectedQuery.replace( /\s+/g, ' ' ) );
	} );

	it( 'builds a query from multiple conditions, one non-matching and one matching', () => {
		const expectedQuery =
			`SELECT DISTINCT ?item WHERE {
			?item p:P666 ?statement0.
			?statement0 (ps:P666) ?instance.
			MINUS { ?item (p:P666/ps:P666) "blah". }
			?item p:P66 ?statement1.
			?statement1 (ps:P66) "foo".
			}`;
		const firstCondition = getSimpleCondition( 'P666', 'blah' );
		firstCondition.propertyValueRelation = PropertyValueRelation.NotMatching;
		const actualQuery = buildQuery( {
			conditions: [
				firstCondition,
				getSimpleCondition( 'P66', 'foo' ),
			],
			omitLabels: true,
		} );

		expect( actualQuery.replace( /\s+/g, ' ' ) ).toEqual( expectedQuery.replace( /\s+/g, ' ' ) );
	} );

	it( 'builds a query from a property and an wikibase-item value', () => {
		const propertyId = 'P31';
		const value = 'Q146';
		const condition = getSimpleCondition( propertyId, value );
		condition.datatype = 'wikibase-item';
		const actualQuery = buildQuery( {
			conditions: [ condition ],
			omitLabels: true,
		} );
		const expectedQuery = `SELECT DISTINCT ?item WHERE {
		?item p:${propertyId} ?statement0.
			?statement0 (ps:${propertyId}) wd:${value}. }`;
		expect( actualQuery.replace( /\s+/g, ' ' ) ).toEqual( expectedQuery.replace( /\s+/g, ' ' ) );
	} );

	it( 'builds a query from a property and a string value with omitLabels set to false (shows labels)', () => {
		const propertyId = 'P666';
		const value = 'blah';
		const expectedQuery =
			`SELECT DISTINCT ?item ?itemLabel WHERE {
			SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". }
			{ SELECT DISTINCT ?item WHERE {
			?item p:P666 ?statement0.
			?statement0 (ps:P666) "blah".
			 } } }`;
		const actualQuery = buildQuery( {
			conditions: [ getSimpleCondition( propertyId, value ) ],
			omitLabels: false,
		} );
		expect( actualQuery.replace( /\s+/g, ' ' ) ).toEqual( expectedQuery.replace( /\s+/g, ' ' ) );
	} );

	it( 'builds a query from a property and a wikibase-item value with subclasses', async () => {
		const propertyId = 'P666';
		const value = 'Q456';
		process.env.VUE_APP_SUBCLASS_PROPERTY_MAP = '{"P666":"P66"}';
		const expectedQuery =
			`SELECT DISTINCT ?item WHERE {
				?item p:${propertyId} ?statement0.
				?statement0 (ps:${propertyId}/(wdt:P66*)) wd:${value}.
			}`;
		const condition = getSimpleCondition( propertyId, value );
		condition.datatype = 'wikibase-item';
		condition.subclasses = true;

		const actualQuery = buildQuery( {
			conditions: [ condition ],
			omitLabels: true,
		} );

		expect( actualQuery.replace( /\s+/g, ' ' ) ).toEqual( expectedQuery.replace( /\s+/g, ' ' ) );
	} );

	it( 'builds a query from a property and a string value with subclasses falling back to default', async () => {
		const propertyId = 'P666';
		const value = 'Q456';
		process.env.VUE_APP_SUBCLASS_PROPERTY_MAP = '{"P66":"P66","default":"P279"}';
		const expectedQuery =
			`SELECT DISTINCT ?item WHERE {
				?item p:${propertyId} ?statement0.
				?statement0 (ps:${propertyId}/(wdt:P279*)) wd:${value}.
			}`;
		const condition = getSimpleCondition( propertyId, value );
		condition.datatype = 'wikibase-item';
		condition.subclasses = true;

		const actualQuery = buildQuery( {
			conditions: [ condition ],
			omitLabels: true,
		} );

		expect( actualQuery.replace( /\s+/g, ' ' ) ).toEqual( expectedQuery.replace( /\s+/g, ' ' ) );
	} );

	it( 'builds a query from a property and a string value but with negate', () => {
		const propertyId = 'P666';
		const value = 'blah';
		const expectedQuery =
			`SELECT DISTINCT ?item WHERE {
			?item wikibase:sitelinks _:anyValue.
			MINUS {
				?item p:${propertyId} ?statement0.
				?statement0 (ps:${propertyId}) "${value}".
			}
			}`;
		const condition = getSimpleCondition( propertyId, value );
		condition.negate = true;
		const actualQuery = buildQuery( {
			conditions: [ condition ],
			omitLabels: true,
		} );
		expect( actualQuery.replace( /\s+/g, ' ' ) ).toEqual( expectedQuery.replace( /\s+/g, ' ' ) );
	} );

	it( 'builds a query with a negated condition that checks references', () => {
		const instanceCondition = getSimpleCondition( 'P31', 'Qtaxon' );
		const negatedCondition = getSimpleCondition( 'PTaxonName', 'whatever' );
		negatedCondition.negate = true;
		negatedCondition.referenceRelation = ReferenceRelation.With;
		negatedCondition.propertyValueRelation = PropertyValueRelation.Regardless;
		const expectedQuery =
		`SELECT DISTINCT ?item WHERE {
			?item p:P31 ?statement0.
			?statement0 (ps:P31) "Qtaxon".
			MINUS { {
				?item p:PTaxonName ?statement1.
				?statement1 (ps:PTaxonName) _:anyValuePTaxonName.
				FILTER(EXISTS { ?statement1 prov:wasDerivedFrom ?reference. })
			} }
		}`;

		const actualQuery = buildQuery( {
			conditions: [ instanceCondition, negatedCondition ],
			omitLabels: true,
		} );

		expect( actualQuery.replace( /\s+/g, ' ' ) ).toEqual( expectedQuery.replace( /\s+/g, ' ' ) );
	} );

	describe( 'Queries for date values', () => {

		it( 'builds a query from a property and a date value with day precision', () => {
			const propertyId = 'P585';
			const value: TimeValue = { value: '+1789-07-14T00:00:00Z', precision: 11 };
			const expectedQuery = `SELECT DISTINCT ?item WHERE {
			?item p:${propertyId} ?statement_0.
			?statement_0 psv:${propertyId} ?statementValue_0.

			?statementValue_0 wikibase:timePrecision ?precision_0.
			FILTER(?precision_0 >= 11 )

			?statementValue_0 wikibase:timeValue ?${propertyId}_0.
			BIND("${value.value}"^^xsd:dateTime AS ?${propertyId}_0)
		 }`;
			const testCondition = getSimpleCondition( propertyId, value );
			testCondition.datatype = 'time';
			const actualQuery = buildQuery( {
				conditions: [
					testCondition,
				],
				omitLabels: true,
			} );
			expect( actualQuery.replace( /\s+/g, ' ' ) ).toEqual( expectedQuery.replace( /\s+/g, ' ' ) );
		} );

		it( 'builds a query from a property and a date value with month precision', () => {
			const propertyId = 'P585';
			const value: TimeValue = { value: '+1789-07-00T00:00:00Z', precision: 10 };
			const expectedQuery = `SELECT DISTINCT ?item WHERE {
			?item p:${propertyId} ?statement_0.
			?statement_0 psv:${propertyId} ?statementValue_0.

			?statementValue_0 wikibase:timePrecision ?precision_0. hint:Prior hint:rangeSafe "true"^^xsd:boolean.
			FILTER(?precision_0 >= 10 )

			?statementValue_0 wikibase:timeValue ?${propertyId}_0. hint:Prior hint:rangeSafe "true"^^xsd:boolean.
			FILTER(("+1789-07-00T00:00:00Z"^^xsd:dateTime <= ?${propertyId}_0) &&
         (?${propertyId}_0 < "+1789-08-00T00:00:00Z"^^xsd:dateTime))
		 }`;
			const testCondition = getSimpleCondition( propertyId, value );
			testCondition.datatype = 'time';
			const actualQuery = buildQuery( {
				conditions: [
					testCondition,
				],
				omitLabels: true,
			} );
			expect( actualQuery.replace( /\s+/g, ' ' ) ).toEqual( expectedQuery.replace( /\s+/g, ' ' ) );
		} );

		it( 'builds a query from a property and a date value with year precision', () => {
			const propertyId = 'P585';
			const value: TimeValue = { value: '+1789-00-00T00:00:00Z', precision: 9 };
			const expectedQuery = `SELECT DISTINCT ?item WHERE {
			?item p:${propertyId} ?statement_0.
			?statement_0 psv:${propertyId} ?statementValue_0.

			?statementValue_0 wikibase:timePrecision ?precision_0. hint:Prior hint:rangeSafe "true"^^xsd:boolean.
			FILTER(?precision_0 >= 9 )

			?statementValue_0 wikibase:timeValue ?${propertyId}_0. hint:Prior hint:rangeSafe "true"^^xsd:boolean.
			FILTER(("+1789-00-00T00:00:00Z"^^xsd:dateTime <= ?${propertyId}_0) &&
         (?${propertyId}_0 < "+1790-00-00T00:00:00Z"^^xsd:dateTime))
		 }`;
			const testCondition = getSimpleCondition( propertyId, value );
			testCondition.datatype = 'time';
			const actualQuery = buildQuery( {
				conditions: [
					testCondition,
				],
				omitLabels: true,
			} );
			expect( actualQuery.replace( /\s+/g, ' ' ) ).toEqual( expectedQuery.replace( /\s+/g, ' ' ) );
		} );
	} );

	it( 'builds a query from date values connected with OR', () => {

		const timeValue1: TimeValue = { value: '+2009-11-01T00:00:00Z', precision: 11 };
		const timeValue2: TimeValue = { value: '+2010-11-01T00:00:00Z', precision: 11 };

		const expectedQuery = `SELECT DISTINCT ?item WHERE {
         {
			 ?item p:P585 ?statement_0.
			 ?statement_0 psv:P585 ?statementValue_0. 
			 ?statementValue_0 wikibase:timePrecision ?precision_0. 
			 FILTER(?precision_0 >= 11 ) 
			 ?statementValue_0 wikibase:timeValue ?P585_0. 
			 BIND("+2009-11-01T00:00:00Z"^^xsd:dateTime AS ?P585_0)
			}
			UNION
			{
			 ?item p:P585 ?statement_1. 
			 ?statement_1 psv:P585 ?statementValue_1.
			 ?statementValue_1 wikibase:timePrecision ?precision_1.
			 FILTER(?precision_1 >= 11 ) 
			 ?statementValue_1 wikibase:timeValue ?P585_1. 
			 BIND("+2010-11-01T00:00:00Z"^^xsd:dateTime AS ?P585_1)
			}
		  }`;

		const actualQuery = buildQuery( {
			conditions: [
				{
					...getSimpleCondition( 'P585', timeValue1 ),
					datatype: 'time',
				},
				{
					...getSimpleCondition( 'P585', timeValue2 ),
					datatype: 'time',
					conditionRelation: ConditionRelation.Or,
				},
			],
			omitLabels: true,
		} );

		expect( actualQuery.replace( /\s+/g, ' ' ) ).toEqual( expectedQuery.replace( /\s+/g, ' ' ) );

	} );

} );
