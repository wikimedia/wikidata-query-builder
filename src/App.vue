<template>
	<div
		id="app"
		:key="refreshKey"
		:lang="lang"
		:dir="textDirection">
		<QueryBuilder v-if="isi18nLoaded" :lang.sync="lang" />
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import QueryBuilder from '@/components/QueryBuilder.vue';
import i18n from 'vue-banana-i18n';
import services from '@/ServicesFactory';

if ( process.env.NODE_ENV === 'production' ) {
	// TODO: figure out how to disable the jest error that fails the unit tests if this is available during testing
	Vue.config.errorHandler = function () {
		services.get( 'metricsCollector' ).increment( 'errors' );
	};
}

const languageService = services.get( 'languageService' );

export default Vue.extend( {
	name: 'App',
	components: {
		QueryBuilder,
	},
	data() {
		return {
			isi18nLoaded: false as boolean,
			lang: languageService.getAppLanguageCode(),
			textDirection: '',
			i18nOptions: {
				wikilinks: true,
			} as Partial<{ locale: string; messages: Record<string, Record<string, string>>; wikilinks: true }>,
			refreshKey: 0,
		};
	},
	methods: {
		async fetchi18n(): Promise<void> {
			const messages: { [ key: string ]: { [ key: string ]: string } } = {
				en: await languageService.getMessagesForLangCode( 'en' ),
			};

			if ( this.lang !== 'en' ) {
				messages[ this.lang ] = await languageService.getMessagesForLangCode( this.lang );
			}

			this.i18nOptions.locale = this.lang;
			this.i18nOptions.messages = messages;
			Vue.use( i18n, this.i18nOptions );
			this.isi18nLoaded = true;
			this.setDocumentTitle( messages );

		},
		reconstructStateFromURL(): void {
			const urlParams = new URLSearchParams( window.location.search );
			if ( !urlParams.has( 'query' ) ) {
				return;
			}
			this.$store.dispatch( 'parseState', urlParams.get( 'query' ) );
		},
		setDocumentTitle( messages: { [langCode: string]: { [msgKey: string]: string} } ): void {
			// eslint-disable-next-line dot-notation, max-len
			window.document.title = messages[ this.lang ][ 'query-builder-heading' ] || messages[ 'en' ][ 'query-builder-heading' ];
		},
	},
	watch: {
		lang: async function () {
			await this.fetchi18n();
			this.refreshKey += 1;
		},
	},
	created(): void {
		this.fetchi18n();
		this.reconstructStateFromURL();
	},
	updated() {
		const sampleElement = document.getElementById( 'directionSample' );
		if ( !sampleElement ) {
			return;
		}
		this.textDirection = getComputedStyle( sampleElement as Element ).direction;
	},
} );
</script>

<style lang="scss">
@use 'ress';
@import '@wmde/wikit-vue-components/dist/wikit-vue-components.css';
</style>
