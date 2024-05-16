import App from '@/App.vue';
import LanguageService from '@/data-access/LanguageService';
import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createI18n } from 'vue-banana-i18n';
import { createTestingPinia } from '@pinia/testing';
import { useStore } from '@/store';

jest.mock( '@/ServicesFactory', () => {
	return {
		get: jest.fn().mockImplementation( ( name ): LanguageService | undefined => {
			if ( name === 'languageService' ) {
				return {
					getAppLanguageCode: jest.fn(),
					getMessagesForLangCode: jest.fn().mockReturnValue(
						{ 'query-builder-heading': 'Assistant de requêtes Wikidata' },
					),
				};
			}
		} ),
	};
} );

describe( 'App.vue', () => {
	const location = global.window.location;

	afterEach( () => {
		Object.defineProperty( global.window, 'location', {
			value: location,
			writable: true,
		} );
	} );

	it( 'sets the window heading based on a localized string', async () => {
		const i18n = createI18n( {
			messages: {
				fr: {
					'query-builder-heading': 'Assistant de requêtes Wikidata',
				},
			},
			locale: 'fr',
			wikilinks: true,
		} );

		Object.defineProperty( global.window, 'location', {
			value: {
				search: '?uselang=fr',
			},
			writable: true,
		} );

		shallowMount( App, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
		} );

		await nextTick();

		expect( global.window.document.title ).toBe( 'Assistant de requêtes Wikidata' );
	} );

	it( 'reconstructs QB state if URL has a query parameter', async () => {
		// TODO: Pinia. Fix function store.parseState. It's not passing the state properly
		const i18n = createI18n( {
			messages: {},
			locale: 'en',
			wikilinks: true,
		} );
		const unencodedQuery = JSON.stringify( {
			foo: 'bar',
		} );

		Object.defineProperty( global.window, 'location', {
			value: {
				search: `?query=${encodeURIComponent( unencodedQuery )}`,
			},
			writable: true,
		} );

		shallowMount( App, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
		} );
		const store = useStore();
		expect( store.parseState ).toHaveBeenCalledWith( unencodedQuery );
	} );

	it( 'doesn\'t try to reconstruct state if there is no query parameter', () => {
		const store = useStore();
		store.$patch = jest.fn();
		const i18n = createI18n( {
			messages: {},
			locale: 'en',
			wikilinks: true,
		} );
		shallowMount( App, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
		} );

		expect( store.$patch ).not.toHaveBeenCalled();
	} );
} );
