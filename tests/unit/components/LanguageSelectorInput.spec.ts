import LanguageSelectorInput from '@/components/LanguageSelectorInput.vue';
import { shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-banana-i18n';

const i18n = createI18n( {
	messages: {},
	locale: 'en',
	wikilinks: true,
} );

describe( 'LanguageSelectorInput.vue', () => {
	it( 'emits an `input` event when text is added to the input field', async () => {
		const wrapper = shallowMount( LanguageSelectorInput, {
			global: {
				plugins: [ i18n ],
			},
		} );
		await wrapper.find( 'input' ).setValue( 'a language' );
		expect( wrapper.emitted( 'update:modelValue' ) ).toBeTruthy();
	} );
} );
