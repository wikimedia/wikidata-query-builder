import { Dropdown } from '@wmde/wikit-vue-components';
import ValueTypeDropDown from '@/components/ValueTypeDropDown.vue';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import { shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-banana-i18n';

const i18n = createI18n( {
	messages: {},
	locale: 'en',
	wikilinks: true,
} );

describe( 'ValueTypeDropDown.vue', () => {
	it( 'emits an `input` event containing the selected option item upon selection', async () => {
		const optionItems = PropertyValueRelation;
		const wrapper = shallowMount( ValueTypeDropDown, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				modelValue: PropertyValueRelation.Matching,
			},
		} );

		await wrapper.findComponent( Dropdown ).vm.$emit( 'input', { value: optionItems.Regardless } );

		expect( wrapper.emitted( 'update:modelValue' )![ 0 ][ 0 ] ).toEqual( optionItems.Regardless );
	} );

	it( 'passes the disabled prop down to the Dropdown', () => {
		const wrapper = shallowMount( ValueTypeDropDown, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				modelValue: PropertyValueRelation.Matching,
				disabled: true,
			},
		} );

		expect( wrapper.findComponent( Dropdown ).props( 'disabled' ) ).toBe( true );
	} );

	it( 'contains the base three options for datatype string', () => {
		const wrapper = shallowMount( ValueTypeDropDown, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				modelValue: PropertyValueRelation.Matching,
				datatype: 'string',
				disabled: true,
			},
		} );

		const optionValues = wrapper.findComponent( Dropdown ).props( 'menuItems' ).map(
			( option: { value: string } ) => option.value,
		);

		expect( optionValues ).toStrictEqual( [ 'matching', 'without', 'regardless-of-value' ] );
	} );

	it( 'contains the base three and two range options for datatype quantity', () => {
		const wrapper = shallowMount( ValueTypeDropDown, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				modelValue: PropertyValueRelation.Matching,
				datatype: 'quantity',
				disabled: true,
			},
		} );

		const optionValues = wrapper.findComponent( Dropdown ).props( 'menuItems' ).map(
			( option: { value: string } ) => option.value,
		);

		expect( optionValues ).toStrictEqual( [
			'matching',
			'without',
			'regardless-of-value',
			'less-than',
			'more-than',
		] );
	} );

	it( 'contains the base three and two range options for datatype time', () => {
		const wrapper = shallowMount( ValueTypeDropDown, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				modelValue: PropertyValueRelation.Matching,
				datatype: 'time',
				disabled: true,
			},
		} );

		const optionValues = wrapper.findComponent( Dropdown ).props( 'menuItems' ).map(
			( option: { value: string } ) => option.value,
		);

		expect( optionValues ).toStrictEqual( [
			'matching',
			'without',
			'regardless-of-value',
			'less-than',
			'more-than',
		] );
	} );
} );
