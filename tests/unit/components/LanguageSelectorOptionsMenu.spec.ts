import Vue from 'vue';
import LanguageSelectorOptionsMenu from '@/components/LanguageSelectorOptionsMenu.vue';
import { shallowMount } from '@vue/test-utils';
import i18n from 'vue-banana-i18n';

const messages = {};
Vue.use( i18n, {
	locale: 'en',
	messages,
	wikilinks: true,
} );

describe( 'LanguageSelectorOptionsMenu.vue', () => {
	it( 'renders options menu item from languages props', async () => {
		const wrapper = shallowMount( LanguageSelectorOptionsMenu,
			{ propsData: {
				languages: [
					{ code: 'en', autonym: 'English' },
					{ code: 'fr', autonym: 'français' },
				],
			} },
		);
		const renderedMenuItems = wrapper.findAll( '.languageSelector__options-menu__languages-list__item' );
		expect( renderedMenuItems.length ).toBe( 2 );
		expect( renderedMenuItems.at( 0 ).find( '.languageSelector__options-menu__languages-list__item' ).text() )
			.toBe( 'English' );
		expect( renderedMenuItems.at( 1 ).find( '.languageSelector__options-menu__languages-list__item' ).text() )
			.toBe( 'français' );
	} );

	it( 'shows the "language not available" text if no matches found', () => {
		const noResultsFoundText = 'language not available';
		const wrapper = shallowMount( LanguageSelectorOptionsMenu, {
			propsData: {
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
			propsData: {
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
