import ConditionRelationToggle from '@/components/ConditionRelationToggle.vue';
import { mount, shallowMount } from '@vue/test-utils';
import { CdxToggleButton, CdxToggleButtonGroup } from '@wikimedia/codex';

import { createI18n } from 'vue-banana-i18n';

const i18n = createI18n( {
	messages: {},
	locale: 'en',
	wikilinks: true,
} );

describe( 'ConditionRelationToggle', () => {
	it( 'passes the value down to the CdxToggleButtonGroup', () => {
		const value = 'or';
		const wrapper = mount( ConditionRelationToggle, {
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
		const wrapper = mount( ConditionRelationToggle, {
			global: {
				plugins: [ i18n ],
			},
		} );
		const toggleButtons = wrapper.findAllComponents( CdxToggleButton );
		expect( toggleButtons.length ).toBe( 2 );
	} );

	it( 'bubbles up the input event from the CdxToggleButtonGroup', () => {
		const wrapper = shallowMount( ConditionRelationToggle, {
			global: {
				plugins: [ i18n ],
			},
		} );

		wrapper.findComponent( CdxToggleButtonGroup ).vm.$emit( 'update:modelValue', 'and' );

		expect( wrapper.emitted( 'set-relation-toggle' ) ).toStrictEqual( [ [ 'and' ] ] );
	} );
} );
