// for some reason Cypress keeps quotes around env vars coming from docker through `.env`
const API_URL = Cypress.env( 'API_URL' ).replace( /(^')|('$)/g, '' );

// TODO: Rewrite these tests to use messages instead of class name selectors

// Ignore no-missing-require, as this is properly loads during tests
// eslint-disable-next-line n/no-missing-require
const messages = require( 'public/i18n/en.json' );

function wikibaseApiRequest( query ) {
	return {
		url: API_URL + '*',
		query,
	};
}

describe( 'Test error handling of the Query Builder', () => {
	it( 'Tests whether the Query builder handles user input error correctly.', () => {
		cy.visit( '/' );
		const runQueryButtonSelector = '.querybuilder__run-button.cdx-button--action-progressive';

		// Run query without any input and assert if any error message is displayed
		cy.get( runQueryButtonSelector ).click();
		cy.get( '.querybuilder-result__errors' ).should( 'be.visible' );

		// more generic intercepts must come first because they are evaluated in reverse order
		cy.intercept(
			wikibaseApiRequest( { action: 'wbsearchentities' } ),
			{ fixture: 'wbsearchentities-empty.json' },
		);
		cy.intercept(
			wikibaseApiRequest( { action: 'wbsearchentities', search: 'has pet' } ),
			{ fixture: 'wbsearchentities-has-pet.json' },
		).as( 'hasPetRequest' );
		cy.intercept(
			wikibaseApiRequest( { action: 'wbsearchentities', search: 'house cat' } ),
			{ fixture: 'wbsearchentities-house-cat.json' },
		).as( 'houseCatRequest' );

		cy.get( '.query-condition__property-lookup input' )
			.type( 'has pet' );
		cy.wait( '@hasPetRequest' );
		cy.get( '.query-condition__property-lookup li' ).click();

		/**
		 * Run the query only with a property and no value. And assert whether
		 * an error message is displayed on the value input.
		 */
		cy.get( runQueryButtonSelector ).click();
		cy.get( '.cdx-field__validation-message .cdx-message--error' ).should( 'be.visible' );

		// Add some value to the value input component
		cy.get( '.query-condition__value-input input' )
			.type( 'house cat' );
		cy.wait( '@houseCatRequest' );

		cy.get( '.query-condition__value-input li' )
			.first()
			.click();

		// Expand the query by clicking 'add condition' and run the query as is.
		cy.get( '.querybuilder__add-condition button' ).click();
		cy.get( runQueryButtonSelector ).click();

		/**
		 * there shouldn't be an error on the first block.
		 * However, we assert here that there are two errors displayed in the second block
		 */
		cy.get( '.query-condition:nth(0) .cdx-field__validation-message' )
			.should( 'not.exist' );

		cy.get( '.query-condition:nth(1)' )
			.contains( messages[ 'query-builder-result-error-missing-property' ] )
			.should( 'have.length', 1 )
			.should( 'be.visible' );

		cy.get( '.query-condition:nth(1)' )
			.contains( messages[ 'query-builder-result-error-missing-value' ] )
			.should( 'have.length', 1 )
			.should( 'be.visible' );

		// Delete the second query condition
		cy.get( '.query-condition:nth(1) .delete-condition' ).click();

		// Run query
		cy.get( runQueryButtonSelector ).click();

		// Assert the resulting sparql query and make sure there are no errors generated.
		cy.get( '.querybuilder-result__iframe' ).then( ( element ) => {
			const url = element.attr( 'src' );
			const query = url.split( '#' )[ 1 ];

			const expected = `SELECT DISTINCT ?item ?itemLabel WHERE {
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". }
  {
    SELECT DISTINCT ?item WHERE {
      ?item p:P1429 ?statement0.
      ?statement0 (ps:P1429/(wdt:P279*)) wd:Q146.
    }
    LIMIT 100
  }
}`;
			expect( decodeURI( query ) ).to.equal( expected );
		} );
	} );
} );
