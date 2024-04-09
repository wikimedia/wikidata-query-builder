import LanguageSelectorOptionsMenu from '@/components/LanguageSelectorOptionsMenu.vue';
import { mount, shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-banana-i18n';

const i18n = createI18n( {
	messages: {},
	locale: 'en',
	wikilinks: true,
} );

describe( 'LanguageSelectorOptionsMenu.vue', () => {
	it( 'renders options menu item from languages props', async () => {
		const wrapper = mount( LanguageSelectorOptionsMenu, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				languages: [
					{ code: 'en', autonym: 'English' },
					{ code: 'fr', autonym: 'français' },
				],
			},
		},
		);
		const renderedMenuItems = wrapper.findAll( '.languageSelector__options-menu__languages-list__item' );
		expect( renderedMenuItems.length ).toBe( 2 );
		expect( renderedMenuItems[ 0 ].text() ).toBe( 'English' );
		expect( renderedMenuItems[ 1 ].text() ).toBe( 'français' );
	} );

	it( 'shows the "language not available" text if no matches found', () => {
		const noResultsFoundText = 'language not available';
		const wrapper = shallowMount( LanguageSelectorOptionsMenu, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				menuItems: [],
			},
			slots: {
				'no-results': noResultsFoundText,
			},
		} );

		expect( wrapper.text() ).toBe( noResultsFoundText );
	} );

	it( 'emits a `select` event when a language is selected ', async () => {
		const wrapper = shallowMount( LanguageSelectorOptionsMenu, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				languages: [
					{ code: 'en', autonym: 'English' },
					{ code: 'de', autonym: 'Deutsch' },
				],
			},
		} );
		const firstLanguageInList = await wrapper.find( '.languageSelector__options-menu__languages-list__item' );
		await firstLanguageInList.trigger( 'click' );
		expect( ( wrapper.emitted().select as any )[ 0 ][ 0 ] ).toEqual( 'en' );
	} );
} );
