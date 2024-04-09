import { Dropdown } from '@wmde/wikit-vue-components';
import ReferenceRelationDropDown from '@/components/ReferenceRelationDropDown.vue';
import ReferenceRelation from '@/data-model/ReferenceRelation';
import { shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-banana-i18n';

const i18n = createI18n( {
	messages: {},
	locale: 'en',
	wikilinks: true,
} );

describe( 'ReferenceRelationDropDown.vue', () => {
	it( 'emits an `input` event containing the selected option item upon selection', async () => {
		const optionItems = ReferenceRelation;
		const wrapper = shallowMount( ReferenceRelationDropDown, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				modelValue: ReferenceRelation.With,
			},
		} );

		await wrapper.findComponent( Dropdown ).vm.$emit( 'input', { value: optionItems.Without } );

		expect( wrapper.emitted( 'update:modelValue' )![ 0 ][ 0 ] ).toEqual( optionItems.Without );
	} );

	it( 'passes the disabled prop down to the Dropdown', () => {
		const wrapper = shallowMount( ReferenceRelationDropDown, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				modelValue: ReferenceRelation.With,
				disabled: true,
			},
		} );

		expect( wrapper.findComponent( Dropdown ).props( 'disabled' ) ).toBe( true );
	} );
} );
