import QuantityValueInput from '@/components/QuantityValueInput.vue';
import { QuantityInput } from '@wmde/wikit-vue-components';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import Vue from 'vue';
import i18n from 'vue-banana-i18n';
import SearchOptions from '@/data-access/SearchOptions';

jest.mock( 'lodash/debounce', () => jest.fn( ( fn ) => fn ) );

const localVue = createLocalVue();
const messages = {};
localVue.use( Vuex );

Vue.use( i18n, {
	locale: 'en',
	messages,
	wikilinks: true,
} );

const defaultProps = {
	searchForMenuItems: jest.fn(),
};

describe( 'QuantityValueInput.vue', () => {
	it( 'bubbles numberInputValue event from the QuantityInput up', () => {

		const numberValue = 10;
		const stringNumberValue = numberValue.toString();
		const wrapper = shallowMount( QuantityValueInput, {
			propsData: {
				...defaultProps,
				numberValue,
			} } );

		wrapper.findComponent( QuantityInput ).vm.$emit( 'update:numberInputValue', stringNumberValue );

		expect( wrapper.emitted( 'numberInputValue' )![ 0 ][ 0 ] ).toBe( stringNumberValue );
	} );

	it( 'bubbles unitLookupValue event from the QuantityInput up', () => {

		const unitValue = { label: 'Dogs', value: 'doggos' };

		const wrapper = shallowMount( QuantityValueInput, {
			propsData: {
				...defaultProps,
				numberValue: 5,
				unitValue,
			} } );

		wrapper.findComponent( QuantityInput ).vm.$emit( 'update:unitLookupValue', unitValue );

		expect( wrapper.emitted( 'unitLookupValue' )![ 0 ][ 0 ] ).toBe( unitValue );
	} );

	it( 'pass numberValue prop down to QuantityInput', () => {
		const numberValue = 10;

		const wrapper = shallowMount( QuantityValueInput, {
			propsData: {
				...defaultProps,
				numberValue,
			},
		} );

		expect( wrapper.findComponent( QuantityInput ).props( 'numberInputValue' ) ).toBe( numberValue.toString() );

	} );

	it( 'does not error on numberValue field = null', () => {
		const numberValue = null;

		const wrapper = shallowMount( QuantityValueInput, {
			propsData: {
				...defaultProps,
				numberValue,
			},
		} );

		expect( wrapper.findComponent( QuantityInput ).props( 'numberInputValue' ) ).toBe( numberValue );

	} );

	it( 'pass unitValue prop down to QuantityInput', () => {
		const unitValue = { label: 'Stars', value: 'lil stars' };

		const wrapper = shallowMount( QuantityValueInput, {
			propsData: {
				...defaultProps,
				numberValue: 10,
				unitValue,
			},
		} );

		expect( wrapper.findComponent( QuantityInput ).props( 'unitLookupValue' ) ).toBe( unitValue );
	} );

	it( 'passes error prop down to QuantityInput', () => {
		const error = {
			type: 'error',
			message: 'some description',
		};

		const wrapper = shallowMount( QuantityValueInput, {
			propsData: {
				...defaultProps,
				error,
				numberValue: 10,
			},
		} );

		expect( wrapper.findComponent( QuantityInput ).props( 'error' ) ).toStrictEqual( error );
	} );

	it( 'unit input: unitLookupSearchInput prop for unit item changes on update search string', async () => {
		const store = new Vuex.Store( {} );
		store.dispatch = jest.fn().mockResolvedValue( [] );
		const wrapper = shallowMount( QuantityValueInput, {
			store,
			localVue,
			propsData: {
				...defaultProps,
				numberValue: 10,
			},
		} );

		const searchOptions: SearchOptions = { search: 'meters', limit: 12 };

		await wrapper.findComponent( QuantityInput ).vm.$emit( 'update:unitLookupSearchInput', searchOptions.search );

		expect( wrapper.findComponent( QuantityInput ).props( 'unitLookupSearchInput' ) ).toBe( searchOptions.search );

	} );

	it( 'unit input: clears the search results on the search string being emptied', async () => {
		const wrapper = shallowMount( QuantityValueInput, {
			localVue,
			propsData: {
				...defaultProps,
				numberValue: 10,
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

		await wrapper.findComponent( QuantityInput ).vm.$emit( 'update:unitLookupSearchInput', '' );
		expect( wrapper.findComponent( QuantityInput ).props( 'unitLookupSearchInput' ) ).toBe( '' );
		expect( wrapper.findComponent( QuantityInput ).props( 'unitLookupMenuItems' ) ).toStrictEqual( [] );
	} );

} );
