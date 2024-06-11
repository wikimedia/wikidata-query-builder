import { CdxCheckbox } from '@wikimedia/codex';
import SubclassCheckbox from '@/components/SubclassCheckbox.vue';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-banana-i18n';
import { createTestingPinia } from '@pinia/testing';

const i18n = createI18n( {
	messages: {},
	locale: 'en',
	wikilinks: true,
} );

describe( 'SubclassCheckbox.vue', () => {
	it( 'emits the event "subclass-check" when user checks include subclasses checkbox', async () => {
		const wrapper = mount( SubclassCheckbox, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
			props: {
				'condition-index': 0,
				isChecked: false,
			},
		} );

		wrapper.findComponent( CdxCheckbox ).vm.$emit( 'update:modelValue', true );

		expect( wrapper.emitted( 'subclass-check' ) ).toBeTruthy();
		expect( wrapper.emitted( 'subclass-check' ) ).toStrictEqual( [ [ true ] ] );
	} );
} );
