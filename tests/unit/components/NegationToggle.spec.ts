import NegationToggle from '@/components/NegationToggle.vue';
import { shallowMount, mount } from '@vue/test-utils';

import { createI18n } from 'vue-banana-i18n';
import { CdxToggleButton, CdxToggleButtonGroup } from '@wikimedia/codex';

const i18n = createI18n( {
	messages: {},
	locale: 'en',
	wikilinks: true,
} );

describe( 'NegationToggle', () => {
	it( 'passes the value down to the CdxToggleButtonGroup', () => {
		const value = 'without';
		const wrapper = shallowMount( NegationToggle, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				modelValue: value,
			},
		} );

		expect( wrapper.findComponent( CdxToggleButtonGroup ).props() ).toMatchObject( { modelValue: value } );
	} );

	it( 'creates a ToggleButton for each option', () => {
		const wrapper = mount( NegationToggle, {
			global: {
				plugins: [ i18n ],
			},
		} );

		const toggleButtons = wrapper.findAllComponents( CdxToggleButton );
		expect( toggleButtons.length ).toBe( 2 );
	} );

	it( 'bubbles up the input event from the ToggleButtonGroup', () => {
		const wrapper = shallowMount( NegationToggle, {
			global: {
				plugins: [ i18n ],
			},
		} );

		wrapper.findComponent( CdxToggleButtonGroup ).vm.$emit( 'update:modelValue', 'without' );

		expect( wrapper.emitted( 'update:modelValue' ) ).toStrictEqual( [ [ 'without' ] ] );
	} );
} );
