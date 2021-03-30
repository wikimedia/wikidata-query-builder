<template>
	<footer class="querybuilder-footer">
		<p>
			Made by the Wikimedia Deutschland Wikidata team.
			Licensed under <a href="https://w.wiki/39Gy">BSD 3-Clause License</a>.
			<a href="https://gerrit.wikimedia.org/g/wikidata/query-builder">View Source</a>.
		</p>
		<p class="querybuilder-footer__build-info" v-if="buildTime && commitLink">
			Last build at {{ buildTime }} from <span v-html="commitLink" />.
		</p>
		<p>
			<a :href="permaLinkHref">Permalink to current Wikidata Query Builder</a>
		</p>
	</footer>
</template>

<script lang="ts">
import QuerySerializer from '@/serialization/QuerySerializer';
import Vue from 'vue';

export default Vue.extend( {
	name: 'Footer',
	computed: {
		buildTime(): string | false {
			const buildDate = new Date();
			if ( !process.env.VUE_APP_BUILD_TIME ) {
				return false;
			}
			buildDate.setTime( parseInt( process.env.VUE_APP_BUILD_TIME ) );
			return buildDate.toUTCString();
		},
		commitLink(): string | false {
			const commitHash = process.env.VUE_APP_GIT_COMMIT;
			if ( !commitHash ) {
				return false;
			}
			return `<a href="https://gerrit.wikimedia.org/g/wikidata/query-builder/+/${commitHash}">${commitHash}</a>`;
		},
		permaLinkHref(): string {
			const querySerializer = new QuerySerializer();
			const serializedQuery = querySerializer.serialize( this.$store.state );
			const current = new URL( window.location.href );
			current.searchParams.set( 'query', serializedQuery );
			return current.href;
		},
	},
} );
</script>

<style lang="scss">
.querybuilder-footer {
	font-family: $font-family-style-description;
	font-weight: $font-weight-style-description;
	font-size: $font-size-style-description;
	line-height: $font-line-height-style-description;
	color: $font-color-base;
}
</style>
