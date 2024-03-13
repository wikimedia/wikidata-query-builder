import ConditionRelationToggle from '@/components/ConditionRelationToggle.vue';
import { mount, shallowMount } from '@vue/test-utils';
import { ToggleButton, ToggleButtonGroup } from '@wmde/wikit-vue-components';
import { createI18n } from 'vue-banana-i18n';

const i18n = createI18n( {
	messages: {},
	locale: 'en',
	wikilinks: true,
} );

describe( 'ConditionRelationToggle', () => {
	it( 'passes the value down to the ToggleButtonGroup', () => {
		const value = 'or';
		const wrapper = mount( ConditionRelationToggle, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				value,
			},
		} );

		expect( wrapper.findComponent( ToggleButtonGroup ).props() ).toStrictEqual( { value } );
	} );

	it( 'creates a ToggleButton for each option', () => {
		const wrapper = shallowMount( ConditionRelationToggle, {
			global: {
				plugins: [ i18n ],
			},
		} );
		const toggleButtons = wrapper.findAllComponents( ToggleButton );
		expect( toggleButtons.length ).toBe( 2 );
		expect( toggleButtons[ 0 ].props( 'value' ) ).toBe( 'and' );
		expect( toggleButtons[ 1 ].props( 'value' ) ).toBe( 'or' );
	} );

	it( 'bubbles up the input event from the ToggleButtonGroup', () => {
		const wrapper = shallowMount( ConditionRelationToggle, {
			global: {
				plugins: [ i18n ],
			},
		} );

		wrapper.findComponent( ToggleButtonGroup ).vm.$emit( 'input', 'and' );

		expect( wrapper.emitted( 'set-relation-toggle' ) ).toStrictEqual( [ [ 'and' ] ] );
	} );
} );
