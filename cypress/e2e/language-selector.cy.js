describe( 'Language selector component', () => {
	it( 'Tests if language selector switches site language', () => {
		cy.visit( '/' );
		cy.get( '.querybuilder__description-heading' ).should( 'have.text', 'About this tool' );
		cy.get( '.querybuilder__languageSelector .wikit-Button' )
			.click();
		cy.get( '.languageSelector__input' )
			.type( 'fran' );
		cy.get( '.languageSelector__options-menu__languages-list__item' )
			.first()
			.click();
		cy.get( '.querybuilder__description-heading' ).should( 'have.text', 'À propos de cet outil' );
	} );
	it( 'Tests that text changes in language selector button', () => {
		// TODO: replace language code with autonym
		cy.visit( '/' );
		cy.get( '.querybuilder__languageSelector .wikit-Button' )
			.click();
		cy.get( '.languageSelector__input' )
			.type( 'Bali' );
		cy.get( '.languageSelector__options-menu__languages-list__item' )
			.first()
			.click();
		cy.get( '.querybuilder__languageSelector .wikit-Button' ).contains( 'ban' );
	} );
} );
