import QuantityValueInput from '@/components/QuantityValueInput.vue';
import { ItemValue } from '@/store/RootState';
import { QuantityInput } from '@wmde/wikit-vue-components';
import { shallowMount, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createI18n } from 'vue-banana-i18n';
import SearchOptions from '@/data-access/SearchOptions';
import { useStore } from '@/store/index';
import { createTestingPinia } from '@pinia/testing';

jest.mock( 'lodash/debounce', () => jest.fn( ( fn ) => fn ) );

const i18n = createI18n( {
	messages: {},
	locale: 'en',
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
			global: {
				plugins: [ i18n ],
			},
			props: {
				...defaultProps,
				value: null,
			},
		} );

		await wrapper.findComponent( QuantityInput ).vm.$emit( 'update:numberInputValue', stringNumberValue );
		await nextTick();

		expect( wrapper.emitted( 'update:modelValue' )![ 0 ][ 0 ] ).toStrictEqual( {
			value: numberValue,
			unit: null,
			rawUnitInput: '',
		} );
	} );

	it( 'bubbles unitLookupValue event as input from the QuantityInput up', async () => {

		const unitValue = { label: 'Dogs', value: 'doggos' };

		const wrapper = shallowMount( QuantityValueInput, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				...defaultProps,
				modelValue: {
					value: 5,
					unit: null,
				},
			},
		} );

		await wrapper.findComponent( QuantityInput ).vm.$emit( 'update:unitLookupValue', unitValue );
		await nextTick();

		expect( wrapper.emitted( 'update:modelValue' )![ 0 ][ 0 ] ).toStrictEqual( {
			value: 5,
			unit: unitValue,
			rawUnitInput: '',
		} );
	} );

	it( 'pass number part of value prop down to QuantityInput', () => {
		const numberValue = 10;

		const wrapper = shallowMount( QuantityValueInput, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				...defaultProps,
				modelValue: {
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
			global: {
				plugins: [ i18n ],
			},
			props: {
				...defaultProps,
				numberValue,
			},
		} );

		expect( wrapper.findComponent( QuantityInput ).props( 'numberInputValue' ) ).toBe( numberValue );

	} );

	it( 'pass unit part of value prop down to QuantityInput', async () => {
		const unitValue: ItemValue = { label: 'Stars', id: 'lil stars' };

		const wrapper = shallowMount( QuantityValueInput, {
			global: {
				plugins: [ createTestingPinia( { stubActions: false } ), i18n ],
			},
			props: {
				...defaultProps,
				modelValue: {
					value: 10,
					unit: unitValue, // There is an issue with the unit that is making the test fails
				},
			},
		} );

		const store = useStore();
		store.searchItemValues = jest.fn().mockResolvedValue( [] );

		await nextTick();

		expect( wrapper.findComponent( QuantityInput ).props( 'unitLookupValue' ) ).toStrictEqual( unitValue );
		expect( wrapper.findComponent( QuantityInput ).props( 'unitLookupSearchInput' ) ).toBe( unitValue.id );
	} );

	it( 'passes error prop down to QuantityInput', async () => {
		const error = {
			type: 'error',
			message: 'some description',
			subproperty: 'number',
		};

		const wrapper = shallowMount( QuantityValueInput, {
			global: {
				plugins: [ i18n ],
			},
			props: {
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
		const wrapper = shallowMount( QuantityValueInput, {
			global: {
				plugins: [ createTestingPinia( { stubActions: false } ), i18n ],
			},
			props: {
				...defaultProps,
				modelValue: { value: 10, unit: null },
			},
		} );

		const store = useStore();
		store.searchItemValues = jest.fn().mockResolvedValue( [] );

		const searchOptions: SearchOptions = { search: 'meters', limit: 12 };

		await wrapper.findComponent( QuantityInput ).vm.$emit( 'update:unitLookupSearchInput', searchOptions.search );
		await nextTick();

		expect( wrapper.findComponent( QuantityInput ).props( 'unitLookupSearchInput' ) ).toBe( searchOptions.search );
		expect( wrapper.emitted( 'update:modelValue' )![ 0 ][ 0 ] ).toStrictEqual( {
			value: 10,
			unit: null,
			rawUnitInput: searchOptions.search,
		} );

	} );

	it( 'unit input: clears the search results on the search string being emptied', async () => {
		const wrapper = shallowMount( QuantityValueInput, {
			global: {
				plugins: [ i18n ],
			},
			props: {
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
		const wrapper = mount( QuantityValueInput, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				...defaultProps,
				modelValue: null,
			},
		} );

		await wrapper.findComponent( QuantityInput ).vm.$emit( 'update:numberInputValue', stringNumberValue );
		await nextTick();
		await nextTick(); // mysteries of Vue

		expect( wrapper.emitted( 'update:modelValue' )![ 0 ][ 0 ] ).toStrictEqual( {
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
