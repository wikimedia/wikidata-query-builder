import EntityValueLookup from '@/components/EntityValueLookup.vue';
import EntityLookup from '@/components/EntityLookup.vue';
import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { createI18n } from 'vue-banana-i18n';
import SearchOptions from '@/data-access/SearchOptions';

const i18n = createI18n( {
	messages: {},
	locale: 'en',
	wikilinks: true,
} );

describe( 'EntityValueLookup.vue', () => {
	it( 'bubbles input events from the Lookup up', () => {
		const wrapper = shallowMount( EntityValueLookup, {
			global: {
				plugins: [ i18n ],
			},
		} );
		const someEventContent = {};

		wrapper.findComponent( EntityLookup ).vm.$emit( 'update:modelValue', someEventContent );

		expect( wrapper.emitted( 'update:modelValue' )![ 0 ][ 0 ] ).toBe( someEventContent );
	} );

	it( 'pass value prop down to Lookup', () => {
		const item = {
			label: 'some label',
			description: 'some description',
		};

		const wrapper = shallowMount( EntityValueLookup, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				modelValue: item,
			},
		} );

		expect( wrapper.findComponent( EntityLookup ).props( 'modelValue' ) ).toStrictEqual( item );
	} );

	it( 'passes search function down and dispatches action when it is called', async () => {
		const store = createStore( {} );
		const searchResults = [
			{ label: 'abc', description: 'def', id: 'Q123' },
			{ label: 'date of birth', description: '', id: 'Q345' },
		];
		store.dispatch = jest.fn().mockResolvedValue( searchResults );
		const expectedSearchResults = JSON.parse( JSON.stringify( searchResults ) );
		const wrapper = shallowMount( EntityValueLookup, {
			global: {
				plugins: [ store, i18n ],
			},
		} );

		expect( wrapper.findComponent( EntityLookup ).props( 'searchForMenuItems' ) )
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.toBe( wrapper.vm.searchForMenuItems );

		const searchOptions: SearchOptions = { search: 'postal', limit: 12 };
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const actualSearchOptions = await wrapper.vm.searchForMenuItems( searchOptions );

		expect( store.dispatch ).toHaveBeenCalledWith( 'searchItemValues', searchOptions );
		expect( actualSearchOptions ).toStrictEqual( expectedSearchResults );
	} );

	it( 'passes error prop down to Lookup', () => {
		const error = {
			type: 'error',
			message: 'some description',
		};

		const wrapper = shallowMount( EntityValueLookup, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				error,
			},
		} );

		expect( wrapper.findComponent( EntityLookup ).props( 'error' ) ).toStrictEqual( error );
	} );
} );
