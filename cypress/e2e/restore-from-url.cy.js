// for some reason Cypress keeps quotes around env vars coming from docker through `.env`
const API_URL = Cypress.env( 'API_URL' ).replace( /(^')|('$)/g, '' );

function wikibaseApiRequest( query ) {
	return {
		url: API_URL + '*',
		query,
	};
}

describe( 'restore state from URL', () => {
	it( 'Tests whether the query can be restored from the URL while showing entity labels', () => {
		cy.intercept(
			wikibaseApiRequest( { action: 'wbsearchentities', search: 'Q146' } ),
			{ fixture: 'wbsearchentities-Q146.json' },
		).as( 'q146Request' );

		cy.intercept(
			wikibaseApiRequest( { action: 'wbsearchentities', search: 'instance of' } ),
			{ fixture: 'wbsearchentities-instance-of.json' },
		).as( 'instanceOfRequest' );
		cy.intercept(
			wikibaseApiRequest( { action: 'wbsearchentities', search: 'house cat' } ),
			{ fixture: 'wbsearchentities-house-cat.json' },
		).as( 'houseCatRequest' );
		cy.intercept(
			wikibaseApiRequest( { action: 'wbsearchentities', search: 'P31' } ),
			{ fixture: 'wbsearchentities-P31.json' },
		).as( 'p31Request' );

		const query = {
			conditions: [ {
				propertyId: 'P31',
				propertyDataType: 'wikibase-item',
				propertyValueRelation: 'matching',
				referenceRelation: 'regardless',
				value: 'Q146',
				subclasses: true,
				conditionRelation: null,
				negate: false,
			} ],
			limit: 10,
			useLimit: true,
			omitLabels: false,
		};

		cy.visit( `/?query=${encodeURIComponent( JSON.stringify( query ) )}` );

		cy.wait( '@p31Request' )
			.wait( '@q146Request' );

		cy.wait( '@instanceOfRequest' )
			.wait( '@houseCatRequest' );

		cy.get( '.query-condition__property-lookup .wikit-Input' )
			.then( ( element ) => {
				expect( element[ 0 ].value ).to.equal( 'instance of' );
			} );
		cy.get( '.query-condition__value-input input' )
			.then( ( element ) => {
				expect( element[ 0 ].value ).to.equal( 'house cat' );
			} );
	} );
} );
