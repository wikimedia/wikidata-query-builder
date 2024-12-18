import { createApp } from 'vue';
import { createI18n } from 'vue-banana-i18n';
import { createPinia } from 'pinia';

import App from './App.vue';
import services from '@/ServicesFactory';

( async () => {
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
		wikilinks: true,
	} );

	const pinia = createPinia();
	const app = createApp( {
		...App,
	} );

	if ( process.env.NODE_ENV === 'production' ) {
		// TODO: figure out how to disable the jest error that fails the unit tests if this is available during testing
		app.config.errorHandler = function () {
			services.get( 'metricsCollector' ).increment( 'errors' );
		};
	}

	app.use( pinia );
	app.use( i18nPlugin );
	app.mount( '#app' );
} )();
