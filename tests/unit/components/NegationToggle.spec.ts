import NegationToggle from '@/components/NegationToggle.vue';
import { shallowMount } from '@vue/test-utils';
import { ToggleButton, ToggleButtonGroup } from '@wmde/wikit-vue-components';
import { createI18n } from 'vue-banana-i18n';

const i18n = createI18n( {
	messages: {},
	locale: 'en',
	wikilinks: true,
} );

describe( 'NegationToggle', () => {
	it( 'passes the value down to the ToggleButtonGroup', () => {
		const value = 'without';
		const wrapper = shallowMount( NegationToggle, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				modelValue: value,
			},
		} );

		expect( wrapper.findComponent( ToggleButtonGroup ).props() ).toStrictEqual( { value } );
	} );

	it( 'creates a ToggleButton for each option', () => {
		const wrapper = shallowMount( NegationToggle, {
			global: {
				plugins: [ i18n ],
			},
		} );

		const toggleButtons = wrapper.findAllComponents( ToggleButton );
		expect( toggleButtons.length ).toBe( 2 );
		expect( toggleButtons[ 0 ].props( 'value' ) ).toBe( 'with' );
		expect( toggleButtons[ 1 ].props( 'value' ) ).toBe( 'without' );
	} );

	it( 'bubbles up the input event from the ToggleButtonGroup', () => {
		const wrapper = shallowMount( NegationToggle, {
			global: {
				plugins: [ i18n ],
			},
		} );

		wrapper.findComponent( ToggleButtonGroup ).vm.$emit( 'input', 'without' );

		expect( wrapper.emitted( 'update:modelValue' ) ).toStrictEqual( [ [ 'without' ] ] );
	} );
} );
