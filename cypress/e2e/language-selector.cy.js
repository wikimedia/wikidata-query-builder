describe( 'Language selector component', () => {
	it( 'Tests if language selector switches site language', () => {
		cy.visit( '/' );
		cy.get( '.querybuilder__description-heading' ).should( 'have.text', 'About this tool' );
		cy.get( '.querybuilder__languageSelector .cdx-button' )
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
		cy.get( '.querybuilder__languageSelector .cdx-button' )
			.click();
		cy.get( '.languageSelector__input' )
			.type( 'Bali' );
		cy.get( '.languageSelector__options-menu__languages-list__item' )
			.first()
			.click();
		cy.get( '.querybuilder__languageSelector .cdx-button' ).contains( 'Bali' );
	} );
	it( '?uselang query parameter changes Language Selector button autonym and page language', () => {
		cy.visit( '/?uselang=de' );
		cy.get( '.querybuilder__languageSelector .cdx-button' ).contains( 'Deutsch' );
		cy.get( '.querybuilder__description-heading' ).should( 'have.text', 'Über dieses Tool' );
	} );
	it( 'Language selector menu closes on blur', () => {
		cy.visit( '/' );
		cy.get( '.querybuilder__languageSelector .cdx-button' )
			.click();
		cy.get( '.querybuilder__language-selector' ).should( 'be.visible' );
		cy.get( 'body' ).click( 0, 0 );
		cy.get( '.querybuilder__language-selector' ).should( 'not.be.visible' );
	} );

	describe( 'Keyboard navigation', () => {
		it( 'Language options are highlighted sequentially when arrowdown is pressed', () => {
			cy.visit( '/' );
			cy.get( '.querybuilder__languageSelector .cdx-button' )
				.click();
			cy.get( '.languageSelector__input' ).type( '{downArrow}' );
			cy.get( '.languageSelector__options-menu__languages-list__item' )
				.eq( 0 ).should( 'have.class', 'highlight' );
			cy.get( '.languageSelector__input' ).type( '{downArrow}' );
			cy.get( '.languageSelector__options-menu__languages-list__item' )
				.eq( 1 ).should( 'have.class', 'highlight' );
		} );
		it( 'Highlighted language loops from first to last if arrowup pressed', () => {
			cy.visit( '/' );
			cy.get( '.querybuilder__languageSelector .cdx-button' )
				.click();
			cy.get( '.languageSelector__input' ).type( '{downArrow}' );
			cy.get( '.languageSelector__options-menu__languages-list__item' ).its( 'length' )
				.then( ( length ) => {
					cy.get( '.languageSelector__input' ).type( '{upArrow}' );
					cy.get( '.languageSelector__options-menu__languages-list__item' )
						.eq( length - 1 ).should( 'have.class', 'highlight' );
				} );
		} );
	} );
} );
