import Vue from 'vue';
import { createApp } from 'vue';
import { createI18n } from 'vue-banana-i18n';

import App from './App.vue';
import { createStore } from './store';
import services from '@/ServicesFactory';

Vue.config.productionTip = false;

( async () => {
	const store = createStore( services );

	const languageService = services.get( 'languageService' );
	const locale = languageService.getAppLanguageCode();
	const messages: { [ key: string ]: { [ key: string ]: string } } = {
		en: await languageService.getMessagesForLangCode( 'en' ),
	};
	if ( locale !== 'en' ) {
		messages[ locale ] = await languageService.getMessagesForLangCode( locale );
	}
	const i18nPlugin = createI18n( {
		locale: locale,
		messages: messages,
	} );

	const app = createApp( {
		...App,
	} );

	app.use( store );
	app.use( i18nPlugin );
	app.mount( '#app' );
} )();
