import EntityLookup from '@/components/EntityLookup.vue';
import { shallowMount } from '@vue/test-utils';
import { CdxLookup } from '@wikimedia/codex';
import { createI18n } from 'vue-banana-i18n';
import SearchOptions from '@/data-access/SearchOptions';
import { nextTick } from 'vue';

jest.mock( 'lodash/debounce', () => jest.fn( ( fn ) => fn ) );

const messages = { en: {
	'some-error-message-key': 'some-error-copy',
} };

const i18n = createI18n( {
	messages: messages,
	locale: 'en',
	wikilinks: true,
} );

const defaultProps = {
	label: 'some label copy',
	noMatchFoundMessage: 'some error copy',
	searchForMenuItems: jest.fn(),
};

describe( 'EntityLookup.vue', () => {
	it( 'bubbles input events from the Lookup up', () => {
		const wrapper = shallowMount( EntityLookup, {
			global: {
				plugins: [ i18n ],
			},
			props: defaultProps,
		} );
		const someEventContent = null;

		wrapper.findComponent( CdxLookup ).vm.$emit( 'update:selected', someEventContent );

		expect( wrapper.emitted( 'update:modelValue' )![ 0 ][ 0 ] ).toBe( someEventContent );
	} );

	it( 'uses prop method to search for Entities on new search string', async () => {
		const searchResults = [ { label: 'abc', description: 'def', id: 'P123', value: 'P123' } ];
		const searchForMenuItems = jest.fn().mockResolvedValue( searchResults );
		const wrapper = shallowMount( EntityLookup, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				...defaultProps,
				searchForMenuItems,
			},
		} );

		const searchOptions: SearchOptions = { search: 'postal', limit: 12 };

		await wrapper.findComponent( CdxLookup ).vm.$emit( 'input', searchOptions.search );
		expect( searchForMenuItems ).toHaveBeenCalledWith( searchOptions );
		expect( wrapper.findComponent( CdxLookup ).props( 'inputValue' ) ).toBe( searchOptions.search );

		// it really needs two ticks ¯\_(ツ)_/¯
		await nextTick();
		expect( wrapper.findComponent( CdxLookup ).props( 'menuItems' ) ).toStrictEqual( searchResults );
	} );

	it( 'clears the search results on the search string being emptied', async () => {
		const searchForMenuItems = jest.fn();
		const wrapper = shallowMount( EntityLookup, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				...defaultProps,
				searchForMenuItems,
			},
			data() {
				return {
					searchResults: [
						{ label: 'abc', description: 'def', id: 'P123' },
						{ label: 'ghi', description: 'def', id: 'P1234' },
						{ label: 'jkl', description: 'def', id: 'P12345' },
					],
					search: 'def',
				};
			},
		} );

		await wrapper.findComponent( CdxLookup ).vm.$emit( 'input', '' );
		expect( searchForMenuItems ).not.toHaveBeenCalled();
		expect( wrapper.findComponent( CdxLookup ).props( 'inputValue' ) ).toBe( '' );
		expect( wrapper.findComponent( CdxLookup ).props( 'menuItems' ) ).toStrictEqual( [] );
	} );

	it( 'passes error prop down to Lookup', () => {
		const error = {
			type: 'error',
			message: 'some-error-message-key',
		};

		const wrapper = shallowMount( EntityLookup, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				...defaultProps,
				error,
			},
		} );

		expect( wrapper.findComponent( CdxLookup ).props( 'status' ) ).toStrictEqual( 'error' );
	} );
} );
