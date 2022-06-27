import PropertyLookup from '@/components/PropertyLookup.vue';
import EntityLookup from '@/components/EntityLookup.vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import Vue from 'vue';
import i18n from 'vue-banana-i18n';
import SearchOptions from '@/data-access/SearchOptions';

const localVue = createLocalVue();
const messages = { en: {
	'some-tag-message-key': 'some-tag-copy',
} };
localVue.use( Vuex );

Vue.use( i18n, {
	locale: 'en',
	messages,
	wikilinks: true,
} );

describe( 'PropertyLookup.vue', () => {
	it( 'bubbles input events from the Lookup up', () => {
		const wrapper = shallowMount( PropertyLookup );
		const someEventContent = {};

		wrapper.findComponent( EntityLookup ).vm.$emit( 'input', someEventContent );

		expect( wrapper.emitted( 'input' )![ 0 ][ 0 ] ).toBe( someEventContent );
	} );

	it( 'pass value prop down to Lookup', () => {
		const property = {
			label: 'some label',
			description: 'some description',
		};

		const wrapper = shallowMount( PropertyLookup, {
			propsData: {
				value: property,
			},
		} );

		expect( wrapper.findComponent( EntityLookup ).props( 'value' ) ).toBe( property );
	} );

	it( 'passes search function down and dispatches action when it is called', async () => {
		const store = new Vuex.Store( {} );
		const searchResults = [
			{ label: 'abc', description: 'def', id: 'P123' },
			{ label: 'date of birth', description: '', id: 'P345', tag: 'some-tag-message-key' },
		];
		store.dispatch = jest.fn().mockResolvedValue( searchResults );
		const expectedSearchResults = JSON.parse( JSON.stringify( searchResults ) );
		expectedSearchResults[ 1 ].tag = 'some-tag-copy';
		const wrapper = shallowMount( PropertyLookup, { store, localVue } );

		expect( wrapper.findComponent( EntityLookup ).props( 'searchForMenuItems' ) )
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.toBe( wrapper.vm.searchForProperties );

		const searchOptions: SearchOptions = { search: 'postal', limit: 12 };
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const actualSearchOptions = await wrapper.vm.searchForProperties( searchOptions );

		expect( store.dispatch ).toHaveBeenCalledWith( 'searchProperties', searchOptions );
		expect( actualSearchOptions ).toStrictEqual( expectedSearchResults );
	} );

	it( 'passes error prop down to EntityLookup', () => {
		const error = {
			type: 'error',
			message: 'some description',
		};

		const wrapper = shallowMount( PropertyLookup, {
			propsData: {
				error,
			},
		} );

		expect( wrapper.findComponent( EntityLookup ).props( 'error' ) ).toStrictEqual( error );
	} );
} );
