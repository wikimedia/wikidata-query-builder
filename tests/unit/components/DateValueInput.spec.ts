import DateValueInput from '@/components/DateValueInput.vue';
import { DateInput } from '@wmde/wikit-vue-components';
import { createLocalVue, mount, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import Vue from 'vue';
import i18n from 'vue-banana-i18n';
import { DateValue } from '@/store/RootState';

jest.mock( 'lodash/debounce', () => jest.fn( ( fn ) => fn ) );

const localVue = createLocalVue();
const messages = {};
localVue.use( Vuex );

Vue.use( i18n, {
	locale: 'en',
	messages,
	wikilinks: true,
} );

describe( 'DateValueInput.vue', () => {
	it( 'Emits an input event when user enters date', () => {
		const wrapper = mount( DateValueInput );
		const inputDate = '31-12-2020';

		wrapper.find( 'input' ).setValue( inputDate );

		expect( wrapper.emitted( 'input' )![ 0 ][ 0 ] ).toBe( inputDate );
	} );

	it( 'does not error on value prop = null', () => {
		const wrapper = shallowMount( DateValueInput, {
			propsData: {
				value: null,
			},
		} );

		expect( wrapper.findComponent( DateInput ).props( 'parsedValue' ) ).toBe( null );
	} );

	it( 'sets `parsedValue` prop based on the `value` prop', () => {
		const value: DateValue = {
			parseResult: null,
			formattedValue: '31-20-20',
		};

		const wrapper = shallowMount( DateValueInput, {
			propsData: {
				value,
			},
		} );

		expect( wrapper.findComponent( DateInput ).props( 'parsedValue' ) ).toBe( value.formattedValue );
	} );
} );
