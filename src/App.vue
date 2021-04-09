<template>
	<div id="app" :lang="lang" :dir="textDirection">
		<QueryBuilder v-if="isi18nLoaded" />
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
	data() {
		return {
			isi18nLoaded: false as boolean,
			lang: languageService.getAppLanguageCode(),
			textDirection: '',
		};
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
	methods: {
		async fetchi18n(): Promise<void> {
			const messages: { [ key: string ]: { [ key: string ]: string } } = {
				en: await languageService.getMessagesForLangCode( 'en' ),
			};

			if ( this.lang !== 'en' ) {
				messages[ this.lang ] = await languageService.getMessagesForLangCode( this.lang );
			}

			Vue.use( i18n, {
				locale: this.lang,
				messages,
				wikilinks: true,
			} );
			this.isi18nLoaded = true;
		},
		reconstructStateFromURL(): void {
			const urlParams = new URLSearchParams( window.location.search );
			if ( !urlParams.has( 'query' ) ) {
				return;
			}
			this.$store.dispatch( 'parseState', urlParams.get( 'query' ) );
		},
	},
	name: 'App',
	components: {
		QueryBuilder,
	},
} );
</script>
