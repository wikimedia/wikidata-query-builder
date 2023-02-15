import Vue from 'vue';
import LanguageSelectorInput from '@/components/LanguageSelectorInput.vue';
import { shallowMount } from '@vue/test-utils';
import i18n from 'vue-banana-i18n';

const messages = {};
Vue.use( i18n, {
	locale: 'en',
	messages,
	wikilinks: true,
} );

describe( 'LanguageSelectorInput.vue', () => {
	it( 'emits an `input` event when text is added to the input field', async () => {
		const wrapper = shallowMount( LanguageSelectorInput );
		await wrapper.find( 'input' ).setValue( 'a language' );
		expect( wrapper.emitted( 'input' ) ).toBeTruthy();
	} );
} );
