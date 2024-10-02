<template>
	<div
		id="app"
		:key="refreshKey"
		:lang="lang"
		:dir="textDirection">
		<QueryBuilder v-if="isi18nLoaded" v-model:lang="lang" />
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import QueryBuilder from '@/components/QueryBuilder.vue';
import services from '@/ServicesFactory';
import { defineComponent } from '@/compat';
import { useStore } from '@/store/index';

if ( process.env.NODE_ENV === 'production' ) {
	// TODO: figure out how to disable the jest error that fails the unit tests if this is available during testing
	Vue.config.errorHandler = function () {
		services.get( 'metricsCollector' ).increment( 'errors' );
	};
}

const languageService = services.get( 'languageService' );

export default defineComponent( {
	name: 'App',
	components: {
		QueryBuilder,
	},
	inject: [ 'setLocale' ],
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

			this.$i18n.messages = messages;
			this.isi18nLoaded = true;
			this.setLocale( this.lang );
			this.setDocumentTitle( messages );
		},
		reconstructStateFromURL(): void {
			const urlParams = new URLSearchParams( window.location.search );
			if ( !urlParams.has( 'query' ) ) {
				return;
			}
			const store = useStore();
			store.parseState( urlParams.get( 'query' ) as string );
		},
		setDocumentTitle( messages: { [langCode: string]: { [msgKey: string]: string} } ): void {
			// eslint-disable-next-line dot-notation, max-len
			window.document.title = messages[ this.lang ][ 'query-builder-heading' ] || messages[ 'en' ][ 'query-builder-heading' ];
		},
	},
	watch: {
		lang: async function () {
			this.refreshKey += 1;
			const url = new URL( document.URL );
			url.searchParams.set( 'uselang', this.lang );
			document.location.assign( url.toString() );
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
@import 'ress';
@import '@wikimedia/codex/dist/codex.style-bidi.css';
@import './styles/custom-variables.css';
@import 'wikit-dist/wikit-vue-components-vue3compat.css';
@import './styles/typography';

body {
	@include body-m;
}

</style>
