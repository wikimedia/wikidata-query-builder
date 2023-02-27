import Vue from 'vue';
import LanguageSelector from '@/components/LanguageSelector.vue';
import LanguageSelectorInput from '@/components/LanguageSelectorInput.vue';
import LanguageSelectorOptionsMenu from '@/components/LanguageSelectorOptionsMenu.vue';
import { mount } from '@vue/test-utils';
import i18n from 'vue-banana-i18n';

const messages = {};
Vue.use( i18n, {
	locale: 'en',
	messages,
	wikilinks: true,
} );

describe( 'LanguageSelector.vue', () => {
	it( 'clear button clears text', async () => {
		const wrapper = mount( LanguageSelector, { propsData: { languages: [ 'Cebuano', 'Javanese' ] } } );
		await wrapper.find( 'input' ).setValue( 'whatever' );
		await wrapper.find( '.languageSelector__input__clear-button' ).trigger( 'click' );
		expect( wrapper.findComponent( LanguageSelectorInput ).props( 'value' ) ).toEqual( '' );
	} );

	it( 'LanguageSelectorOptionsMenu shows a filtered lowercase list after input is given', async () => {
		const wrapper = mount( LanguageSelector, { propsData: { languages: [ 'Cebuano', 'Javanese' ] } } );
		await wrapper.find( 'input' ).setValue( 'ceb' );
		expect( wrapper.findComponent( LanguageSelectorOptionsMenu ).props( 'languages' ).length ).toEqual( 1 );
	} );
} );
