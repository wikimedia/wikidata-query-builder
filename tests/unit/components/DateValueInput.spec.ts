import WikitDateInput from '@/components/WikitDateInput.vue';
import { mount, shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-banana-i18n';
import DateValueInput from '@/components/DateValueInput.vue';
import { DateValue } from '@/store/RootState';

jest.mock( 'lodash/debounce', () => jest.fn( ( fn ) => fn ) );

const i18n = createI18n( {
	messages: {},
	locale: 'en',
	wikilinks: true,
} );

describe( 'DateValueInput.vue', () => {
	it( 'Emits an input event when user enters date', () => {
		const wrapper = mount( DateValueInput, {
			global: {
				plugins: [ i18n ],
			},
		} );
		const inputDate = '31-12-2020';
		wrapper.find( 'input' ).setValue( inputDate );
		expect( wrapper.emitted( 'update:modelValue' )![ 0 ][ 0 ] ).toBe( inputDate );
	} );

	it( 'does not error on value prop = null', () => {
		const wrapper = shallowMount( DateValueInput, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				value: null,
			},
		} );

		expect( wrapper.findComponent( WikitDateInput ).props( 'parsedValue' ) ).toBe( null );
	} );

	it( 'sets `parsedValue` prop based on the `value` prop', () => {
		const modelValue: DateValue = {
			parseResult: null,
			formattedValue: '31-20-20',
		};

		const wrapper = shallowMount( DateValueInput, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				modelValue,
			},
		} );

		expect( wrapper.findComponent( WikitDateInput ).props( 'parsedValue' ) ).toBe( modelValue.formattedValue );
	} );
} );
