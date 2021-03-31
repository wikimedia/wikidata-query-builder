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
	it( 'bubbles numberInputValue event as input from the QuantityInput up', async () => {

		const numberValue = 10;
		const stringNumberValue = numberValue.toString();
		const wrapper = shallowMount( QuantityValueInput, {
			propsData: {
				...defaultProps,
				value: null,
			},
		} );

		await wrapper.findComponent( QuantityInput ).vm.$emit( 'update:numberInputValue', stringNumberValue );
		await localVue.nextTick();

		expect( wrapper.emitted( 'input' )![ 0 ][ 0 ] ).toStrictEqual( {
			value: numberValue,
			unit: null,
			rawUnitInput: '',
		} );
	} );

	it( 'bubbles unitLookupValue event as input from the QuantityInput up', async () => {

		const unitValue = { label: 'Dogs', value: 'doggos' };

		const wrapper = shallowMount( QuantityValueInput, {
			propsData: {
				...defaultProps,
				value: {
					value: 5,
					unit: null,
				},
			},
		} );

		await wrapper.findComponent( QuantityInput ).vm.$emit( 'update:unitLookupValue', unitValue );
		await localVue.nextTick();

		expect( wrapper.emitted( 'input' )![ 0 ][ 0 ] ).toStrictEqual( {
			value: 5,
			unit: unitValue,
			rawUnitInput: '',
		} );
	} );

	it( 'pass number part of value prop down to QuantityInput', () => {
		const numberValue = 10;

		const wrapper = shallowMount( QuantityValueInput, {
			propsData: {
				...defaultProps,
				value: {
					value: numberValue,
					unit: null,
				},
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

	it( 'pass unit part of value prop down to QuantityInput', () => {
		const unitValue = { label: 'Stars', value: 'lil stars' };

		const wrapper = shallowMount( QuantityValueInput, {
			propsData: {
				...defaultProps,
				value: {
					value: 10,
					unit: unitValue,
				},
			},
		} );

		expect( wrapper.findComponent( QuantityInput ).props( 'unitLookupValue' ) ).toBe( unitValue );
	} );

	it( 'passes error prop down to QuantityInput', async () => {
		const error = {
			type: 'error',
			message: 'some description',
			subproperty: 'number',
		};

		const wrapper = shallowMount( QuantityValueInput, {
			propsData: {
				...defaultProps,
				error,
				numberValue: 10,
			},
		} );

		expect( wrapper.findComponent( QuantityInput ).props( 'error' ) )
			.toStrictEqual( { type: error.type, message: error.message } );
		expect( wrapper.findComponent( QuantityInput ).props( 'errorCause' ) ).toBe( error.subproperty );
	} );

	it( 'unit input: unitLookupSearchInput prop for unit item changes on update search string', async () => {
		const store = new Vuex.Store( {} );
		store.dispatch = jest.fn().mockResolvedValue( [] );
		const wrapper = shallowMount( QuantityValueInput, {
			store,
			localVue,
			propsData: {
				...defaultProps,
				value: { value: 10, unit: null },
			},
		} );

		const searchOptions: SearchOptions = { search: 'meters', limit: 12 };

		await wrapper.findComponent( QuantityInput ).vm.$emit( 'update:unitLookupSearchInput', searchOptions.search );
		await localVue.nextTick();

		expect( wrapper.findComponent( QuantityInput ).props( 'unitLookupSearchInput' ) ).toBe( searchOptions.search );
		expect( wrapper.emitted( 'input' )![ 0 ][ 0 ] ).toStrictEqual( {
			value: 10,
			unit: null,
			rawUnitInput: searchOptions.search,
		} );

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

	it( 'sets an error itself if the numberInputValue does not contain a valid number', async () => {
		const stringNumberValue = 'Not a number';
		const wrapper = shallowMount( QuantityValueInput, {
			propsData: {
				...defaultProps,
				value: null,
			},
		} );

		await wrapper.findComponent( QuantityInput ).vm.$emit( 'update:numberInputValue', stringNumberValue );
		await localVue.nextTick();

		expect( wrapper.emitted( 'input' )![ 0 ][ 0 ] ).toStrictEqual( {
			value: NaN,
			unit: null,
			rawUnitInput: '',
		} );
		expect( wrapper.findComponent( QuantityInput ).props( 'errorCause' ) ).toBe( 'number' );
		expect( wrapper.findComponent( QuantityInput ).props( 'error' ) ).toStrictEqual( {
			message: 'query-builder-quantity-value-error-number',
			type: 'error',
		} );
	} );
} );
