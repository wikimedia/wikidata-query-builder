import { Checkbox } from '@wmde/wikit-vue-components';
import SubclassCheckbox from '@/components/SubclassCheckbox.vue';
import { shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-banana-i18n';
import { createTestingPinia } from '@pinia/testing';

const i18n = createI18n( {
	messages: {},
	locale: 'en',
	wikilinks: true,
} );

describe( 'SubclassCheckbox.vue', () => {
	it( 'updates the store when user checks include subclasses checkbox', async () => {
		const wrapper = shallowMount( SubclassCheckbox, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
			props: {
				'condition-index': 0,
				isChecked: false,
			},
		} );

		wrapper.findComponent( Checkbox ).vm.$emit( 'update:checked', true );

		expect( wrapper.emitted( 'subclass-check' ) ).toBeTruthy();
		expect( wrapper.emitted( 'subclass-check' ) ).toStrictEqual( [ [ true ] ] );
	} );
} );
