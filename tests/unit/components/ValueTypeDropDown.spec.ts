import { Dropdown } from '@wmde/wikit-vue-components';
import Vue from 'vue';
import ValueTypeDropDown from '@/components/ValueTypeDropDown.vue';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import { mount } from '@vue/test-utils';
import i18n from 'vue-banana-i18n';

const messages = {};

Vue.use( i18n, {
	locale: 'en',
	messages,
	wikilinks: true,
} );

describe( 'ValueTypeDropDown.vue', () => {
	it( 'emits an `input` event containing the selected option item upon selection', async () => {
		const optionItems = PropertyValueRelation;
		const wrapper = mount( ValueTypeDropDown, {
			propsData: {
				value: PropertyValueRelation.Matching,
			},
		} );

		await wrapper.findComponent( Dropdown ).vm.$emit( 'input', { value: optionItems.Regardless } );

		expect( wrapper.emitted( 'input' )![ 0 ][ 0 ] ).toEqual( optionItems.Regardless );
	} );

	it( 'passes the disabled prop down to the Dropdown', () => {
		const wrapper = mount( ValueTypeDropDown, {
			propsData: {
				value: PropertyValueRelation.Matching,
				disabled: true,
			},
		} );

		expect( wrapper.findComponent( Dropdown ).props( 'disabled' ) ).toBe( true );
	} );

	it( 'contains the base three options for datatype string', () => {
		const wrapper = mount( ValueTypeDropDown, {
			propsData: {
				value: PropertyValueRelation.Matching,
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
		const wrapper = mount( ValueTypeDropDown, {
			propsData: {
				value: PropertyValueRelation.Matching,
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
} );
