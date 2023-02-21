import EntityValueLookup from '@/components/EntityValueLookup.vue';
import EntityLookup from '@/components/EntityLookup.vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import Vue from 'vue';
import i18n from 'vue-banana-i18n';
import SearchOptions from '@/data-access/SearchOptions';

const localVue = createLocalVue();
const messages = {};
localVue.use( Vuex );

Vue.use( i18n, {
	locale: 'en',
	messages,
	wikilinks: true,
} );

describe( 'EntityValueLookup.vue', () => {
	it( 'bubbles input events from the Lookup up', () => {
		const wrapper = shallowMount( EntityValueLookup );
		const someEventContent = {};

		wrapper.findComponent( EntityLookup ).vm.$emit( 'input', someEventContent );

		expect( wrapper.emitted( 'input' )![ 0 ][ 0 ] ).toBe( someEventContent );
	} );

	it( 'pass value prop down to Lookup', () => {
		const item = {
			label: 'some label',
			description: 'some description',
		};

		const wrapper = shallowMount( EntityValueLookup, {
			propsData: {
				value: item,
			},
		} );

		expect( wrapper.findComponent( EntityLookup ).props( 'value' ) ).toBe( item );
	} );

	it( 'passes search function down and dispatches action when it is called', async () => {
		const store = new Vuex.Store( {} );
		const searchResults = [
			{ label: 'abc', description: 'def', id: 'Q123' },
			{ label: 'date of birth', description: '', id: 'Q345' },
		];
		store.dispatch = jest.fn().mockResolvedValue( searchResults );
		const expectedSearchResults = JSON.parse( JSON.stringify( searchResults ) );
		const wrapper = shallowMount( EntityValueLookup, { store, localVue } );

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
			propsData: {
				error,
			},
		} );

		expect( wrapper.findComponent( EntityLookup ).props( 'error' ) ).toStrictEqual( error );
	} );
} );
