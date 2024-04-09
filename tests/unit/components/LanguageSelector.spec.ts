import LanguageSelector from '@/components/LanguageSelector.vue';
import LanguageSelectorInput from '@/components/LanguageSelectorInput.vue';
import LanguageSelectorOptionsMenu from '@/components/LanguageSelectorOptionsMenu.vue';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-banana-i18n';

const i18n = createI18n( {
	messages: {},
	locale: 'en',
	wikilinks: true,
} );
describe( 'LanguageSelector.vue', () => {
	it( 'clear button clears text', async () => {
		const wrapper = mount( LanguageSelector, {
			global: {
				plugins: [ i18n ],
			},
		} );
		await wrapper.find( 'input' ).setValue( 'whatever' );
		await wrapper.find( '.languageSelector__input__clear-button' ).trigger( 'click' );
		expect( wrapper.findComponent( LanguageSelectorInput ).props( 'modelValue' ) ).toEqual( '' );
	} );

	it( 'LanguageSelectorOptionsMenu shows a filtered lowercase list after input is given', async () => {
		const wrapper = mount( LanguageSelector, {
			global: {
				plugins: [ i18n ],
			},
		} );
		await wrapper.find( 'input' ).setValue( 'cebua' ); // Cebuano
		expect( wrapper.findComponent( LanguageSelectorOptionsMenu ).props( 'languages' ).length ).toEqual( 1 );
	} );
} );
