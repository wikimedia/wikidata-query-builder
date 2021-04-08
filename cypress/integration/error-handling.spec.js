// for some reason Cypress keeps quotes around env vars coming from docker through `.env`
const API_URL = Cypress.env( 'API_URL' ).replace( /(^')|('$)/g, '' );

function wikibaseApiRequest( query ) {
	return {
		url: API_URL,
		query,
	};
}

describe( 'Test error handling of the Query Building', () => {
	it( 'Tests whether the Query builder handles user input error correctly.', () => {
		cy.visit( '/' );
		const runQueryButtonSelector = '.querybuilder__run .wikit-Button--progressive';

		// Run query without any input and assert if any error message is displayed
		cy.get( runQueryButtonSelector ).click();
		cy.get( '.querybuilder-result__errors' ).should( 'be.visible' );

		cy.intercept(
			wikibaseApiRequest( { action: 'wbsearchentities', search: 'has pet' } ),
			{ fixture: 'wbsearchentities-has-pet.json' },
		).as( 'hasPetRequest' );
		cy.intercept(
			wikibaseApiRequest( { action: 'wbsearchentities', search: 'house cat' } ),
			{ fixture: 'wbsearchentities-house-cat.json' },
		).as( 'houseCatRequest' );
		cy.intercept(
			wikibaseApiRequest( { action: 'wbsearchentities' } ),
			{ fixture: 'wbsearchentities-empty.json' },
		);

		cy.get( '.query-condition__property-lookup .wikit-Input' )
			.type( 'has pet' )
			.wait( '@hasPetRequest' );
		cy.get( '.query-condition__property-lookup .wikit-OptionsMenu__item' ).click();

		/**
		 * Run the query only with a property and no value. And assert wheather
		 * an error message is displayed on the value input.
		 */
		cy.get( runQueryButtonSelector ).click();
		cy.get( '.wikit.wikit-ValidationMessage.wikit-ValidationMessage--error' ).should( 'be.visible' );

		// Add some value to the value input component
		cy.get( '.query-condition__value-input .wikit-Input' )
			.type( 'house cat' )
			.wait( '@houseCatRequest' );

		cy.get( '.query-condition__value-input .wikit-OptionsMenu__item' )
			.first()
			.click();

		// Expand the query by clicking 'add condition' and run the query as is.
		cy.get( '.querybuilder__add-condition button' ).click();
		cy.get( runQueryButtonSelector ).click();

		/**
		 * there shouldn't be an error on the first block.
		 * However, we assert here that there are two errors displyed in the second block
		 */
		cy.get( '.query-condition:nth(0) .wikit.wikit-ValidationMessage' )
			.should( 'not.exist' );

		cy.get( '.query-condition:nth(1) .wikit.wikit-ValidationMessage' )
			.should( 'have.length', 2 )
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
