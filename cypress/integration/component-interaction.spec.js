// for some reason Cypress keeps quotes around env vars coming from docker through `.env`
const API_URL = Cypress.env( 'API_URL' ).replace( /(^')|('$)/g, '' );

function wikibaseApiRequest( query ) {
	return {
		url: API_URL,
		query,
	};
}

describe( 'Component interaction test', () => {
	it( 'Tests whether components behave as they should when values change', () => {
		cy.visit( '/' );

		/**
		 * The intercepts basically mock an API request, as we type into the lookup component
		 * with different search strings. see the .json files in the /fixtures directory
		 */
		cy.intercept(
			wikibaseApiRequest( { action: 'wbsearchentities', search: 'has pet' } ),
			{ fixture: 'wbsearchentities-has-pet.json' },
		).as( 'hasPetRequest' );
		cy.intercept(
			wikibaseApiRequest( { action: 'wbsearchentities', search: 'house cat' } ),
			{ fixture: 'wbsearchentities-house-cat.json' },
		).as( 'houseCatRequest' );

		cy.intercept(
			wikibaseApiRequest( { action: 'wbsearchentities', search: 'instance of' } ),
			{ fixture: 'wbsearchentities-instance-of.json' },
		).as( 'hasInstanceRequest' );

		cy.intercept(
			wikibaseApiRequest( { action: 'wbsearchentities', search: 'IMDb ID' } ),
			{ fixture: 'wbsearchentities-external-id.json' },
		).as( 'hasImdbRequest' );

		cy.intercept(
			wikibaseApiRequest( { action: 'wbsearchentities', search: 'elevation above sea level' } ),
			{ fixture: 'wbsearchentities-elevation-above-sea-level.json' },
		).as( 'hasQuantityRequest' );

		cy.intercept(
			wikibaseApiRequest( { action: 'wbsearchentities', search: 'metre' } ),
			{ fixture: 'wbsearchentities-unit.json' },
		).as( 'hasUnitRequest' );

		cy.intercept(
			wikibaseApiRequest( { action: 'wbsearchentities', search: 'publication date' } ),
			{ fixture: 'wbsearchentities-publication-date.json' },
		).as( 'hasPublicationDateRequest' );
		cy.intercept(
			wikibaseApiRequest( { action: 'wbparsevalue' } ),
			{ fixture: 'wbparsevalue-date.json' },
		).as( 'hasParseValueRequest' );
		cy.intercept(
			wikibaseApiRequest( { action: 'wbformatvalue' } ),
			{ fixture: 'wbformatvalue-date.json' },
		).as( 'hasFormatvalueRequest' );

		cy.intercept(
			wikibaseApiRequest( { action: 'wbsearchentities', search: 'LilyPond notation' } ),
			{ fixture: 'wbsearchentities-limited-support.json' },
		).as( 'hasLimitedSupportedRequest' );

		cy.intercept(
			wikibaseApiRequest( { action: 'wbsearchentities' } ),
			{ fixture: 'wbsearchentities-empty.json' },
		);

		cy.get( '.query-condition__property-lookup .wikit-Input' )
			.type( 'has pet' )
			.wait( '@hasPetRequest' );
		cy.get( '.query-condition__property-lookup .wikit-OptionsMenu__item' ).click();

		cy.get( '.query-condition__value-input .wikit-Input' )
			.type( 'house cat' )
			.wait( '@houseCatRequest' );
		cy.get( '.query-condition__value-input .wikit-OptionsMenu__item' )
			.first()
			.click();

		// clear out values from specified input components
		cy.get( '.query-condition__property-lookup .wikit-Input' ).clear();
		cy.get( '.query-condition__value-input .wikit-Input' ).clear();

		// set value to 'not matching' from dropdown. NotMatching => 'without',
		cy.get( '.querybuilder-dropdown__select.wikit.wikit-Dropdown' ).first().click();
		cy.get( '.wikit-OptionsMenu__item.wikit-OptionsMenu__item' ).contains( 'without' ).click();

		cy.get( '.query-condition__property-lookup .wikit-Input' )
			.type( 'instance of' )
			.wait( '@hasInstanceRequest' );

		cy.get( '.query-condition__property-lookup .wikit-OptionsMenu__item' ).first().click();

		cy.get( '.query-condition__value-input .wikit-Input' )
			.type( 'house cat' )
			.wait( '@houseCatRequest' );

		cy.get( '.query-condition__value-input .wikit-OptionsMenu__item' )
			.first()
			.click();

		// negate relation
		cy.get( '.wikit.wikit-ToggleButton' ).not( '.wikit-ToggleButton--isActive' ).click();

		// click 'Add condition' button and expand to a second block
		cy.get( '.querybuilder__add-condition button' ).click();

		cy.get( '.query-condition__property-lookup .wikit-Input' )
			.eq( 1 )
			.type( 'IMDb ID' )
			.wait( '@hasImdbRequest' );
		cy.get( '.query-condition__property-lookup:nth(1) .wikit-OptionsMenu__item' ).click();

		// set value to 'regardless of value on the second query_condition block'.
		cy.get( '.querybuilder-dropdown__select.wikit.wikit-Dropdown' )
			.eq( 1 )
			.first()
			.click();
		cy.get( '.querybuilder-dropdown__select.wikit.wikit-Dropdown:nth(1) .wikit-OptionsMenu__item' )
			.contains( 'regardless of value' )
			.click();

		// connect the two relations with OR
		cy.get( '.wikit.wikit-ToggleButtonGroup.conditionRelationToggle.querybuilder__condition-relation-toggle' )
			.find( 'button' )
			.contains( 'or' )
			.click();

		cy.get( '.query-condition__property-lookup .wikit-Input' ).eq( 1 ).clear();

		cy.get( '.query-condition__property-lookup .wikit-Input' )
			.eq( 1 )
			.type( 'LilyPond notation' )
			.wait( '@hasLimitedSupportedRequest' );
		cy.get( '.query-condition__property-lookup:nth(1) .wikit-OptionsMenu__item' ).click();

		// Assert input value component is disabled when user selects 'regardless of value'
		cy.get( '.query-condition__value-input:nth(1) .wikit-Input' ).should( 'be.disabled' );

		// click 'Add condition' button and expand to a second block
		cy.get( '.querybuilder__add-condition button' ).click();
		cy.get( '.query-condition__property-lookup .wikit-Input' )
			.eq( 2 )
			.type( 'elevation above sea level' )
			.wait( '@hasQuantityRequest' );
		cy.get( '.query-condition__property-lookup:nth(2) .wikit-OptionsMenu__item' ).click();

		cy.get( '.wikit-QuantityInput__number-input' )
			.type( 12 );
		cy.get( '.wikit-QuantityInput__unit-lookup input' )
			.type( 'metre' )
			.wait( '@hasUnitRequest' );
		cy.get( '.wikit-QuantityInput__unit-lookup .wikit-OptionsMenu__item' ).eq( 0 ).click();

		// click 'Add condition' button and expand to a third block
		cy.get( '.querybuilder__add-condition button' ).click();
		cy.get( '.query-condition__property-lookup .wikit-Input' )
			.eq( 3 )
			.type( 'publication date' )
			.wait( '@hasPublicationDateRequest' );
		cy.get( '.query-condition__property-lookup:nth(3) .wikit-OptionsMenu__item' ).click();

		cy.get( '.wikit-InputWithExtender .wikit-Input' )
			.type( '31-12-2020' )
			.wait( '@hasParseValueRequest' )
			.wait( '@hasFormatvalueRequest' );
		cy.get( '.wikit-InputWithExtender__extension' ).click();

		// run query
		cy.get( '.querybuilder__run .wikit-Button--progressive' ).click();

		// assert the reslulting sparql query
		cy.get( '.querybuilder-result__iframe' ).then( ( element ) => {
			const url = element.attr( 'src' );
			const query = url.split( '#' )[ 1 ];

			const expected = `SELECT DISTINCT ?item ?itemLabel WHERE {
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". }
  {
    SELECT DISTINCT ?item WHERE {
      {
        MINUS {
          ?item p:P31 ?statement0.
          ?statement0 (ps:P31/(wdt:P279*)) ?instance.
        }
      }
      UNION
      { MINUS { ?item (p:P31/ps:P31) wd:Q146. } }
      UNION
      {
        ?item p:P6883 ?statement1.
        ?statement1 (ps:P6883) _:anyValueP6883.
      }
      BIND("12"^^xsd:decimal AS ?userQuantity)
      BIND(wd:Q11573 AS ?userUnit)
      ?userUnit (p:P2370/psv:P2370/wikibase:quantityAmount) ?conversionFactor;
        (p:P2370/psv:P2370/wikibase:quantityUnit) ?coherentUnit.
      BIND(?userQuantity * ?conversionFactor AS ?coherentUserQuantity)
      ?item p:P2044 ?statement2.
      ?statement2 (psn:P2044/wikibase:quantityAmount) ?statementQuantity;
        (psn:P2044/wikibase:quantityUnit) ?coherentUnit.
      FILTER(?statementQuantity = ?coherentUserQuantity)
      ?item p:P577 ?statement_3.
      ?statement_3 psv:P577 ?statementValue_3.
      ?statementValue_3 wikibase:timePrecision ?precision_3.
      FILTER(?precision_3 >= "11"^^xsd:decimal)
      ?statementValue_3 wikibase:timeValue ?P577_3.
      BIND("+2020-12-31T00:00:00Z"^^xsd:dateTime AS ?P577_3)
    }
    LIMIT 100
  }
}`;
			expect( decodeURI( query ) ).to.equal( expected );
		} );
	} );
} );
