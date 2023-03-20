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
	it( 'Tests that autonym changes in language selector button', () => {
		cy.visit( '/' );
		cy.get( '.querybuilder__languageSelector .wikit-Button' )
			.click();
		cy.get( '.languageSelector__input' )
			.type( 'Bali' );
		cy.get( '.languageSelector__options-menu__languages-list__item' )
			.first()
			.click();
		cy.get( '.querybuilder__languageSelector .wikit-Button' ).contains( 'Bali' );
	} );
	it( '?uselang query parameter changes Language Selector button autonym and page language', () => {
		cy.visit( '/?uselang=de' );
		cy.get( '.querybuilder__languageSelector .wikit-Button' ).contains( 'Deutsch' );
		cy.get( '.querybuilder__description-heading' ).should( 'have.text', 'Über dieses Tool' );
	} );
} );
