<template>
	<footer class="querybuilder-footer">
		<div class="querybuilder-footer__column">
			<h2 class="querybuilder-footer__title" v-i18n="{msg: 'query-builder-footer-about-query-builder'}" />
			<p v-html="$i18n('query-builder-footer-licence', license)" />
			<p
				class="querybuilder-footer__build-info"
				v-if="buildTime && commitLink"
				v-html="$i18n('query-builder-footer-build-time', commitLink, buildTime)"
			/>
			<p>
				<WikitLink
					href="https://gerrit.wikimedia.org/g/wikidata/query-builder"
					v-i18n="{msg: 'query-builder-footer-view-source'}"
				/>
			</p>
			<p class="querybuilder-footer__report-link">
				<WikitLink :href="bugLink" v-i18n="{msg: 'query-builder-footer-report-link'}" />
			</p>
		</div>
		<div class="querybuilder-footer__column">
			<h2 class="querybuilder-footer__title" v-i18n="{msg: 'query-builder-footer-about-us'}" />
			<p v-if="privacyPolicy" class="querybuilder-footer__privacy-policy">
				<WikitLink :href="privacyPolicy" v-i18n="{msg: 'query-builder-footer-privacy-policy'}" />
			</p>
			<p>
				<WikitLink
					href="https://www.wikimedia.de/"
					v-i18n="{msg: 'query-builder-footer-wikimedia-deutchland'}"
				/>
			</p>
			<p
				v-html="$i18n('query-builder-footer-team', teamLink)"
			/>
		</div>
		<div class="querybuilder-footer__column">
			<h2 class="querybuilder-footer__title" v-i18n="{msg: 'query-builder-footer-more-data-quality-tools'}" />
			<p>
				<WikitLink
					href="https://mismatch-finder.toolforge.org/"
					v-i18n="{msg: 'query-builder-footer-mismatch-finder'}"
				/>
			</p>
			<p>
				<WikitLink
					href="https://item-quality-evaluator.toolforge.org/"
					v-i18n="{msg: 'query-builder-footer-item-quality-evaluator'}"
				/>
			</p>
			<p>
				<WikitLink
					href="https://wikidata-analytics.wmcloud.org/app/CuriousFacts"
					v-i18n="{msg: 'query-builder-footer-curious-facts'}"
				/>
			</p>
			<p>
				<WikitLink
					href="https://github.com/wmde/wikidata-constraints-violation-checker"
					v-i18n="{msg: 'query-builder-footer-constraints-violation-checker'}"
				/>
			</p>
		</div>
	</footer>
</template>

<script lang="ts">
import QuerySerializer from '@/serialization/QuerySerializer';
import Vue from 'vue';
import { Link as WikitLink } from '@wmde/wikit-vue-components';

export default Vue.extend( {
	name: 'Footer',
	data() {
		return {
			// eslint-disable-next-line max-len
			license: 'https://gerrit.wikimedia.org/r/plugins/gitiles/wikidata/query-builder/+/refs/heads/master/LICENSE',
			teamLink: 'https://www.wikidata.org/wiki/Wikidata:Report_a_technical_problem',
		};
	},
	components: {
		WikitLink,
	},
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
			return `https://gerrit.wikimedia.org/g/wikidata/query-builder/+/${commitHash}`;
		},
		bugLink(): string {
			const querySerializer = new QuerySerializer();
			const serializedQuery = querySerializer.serialize( this.$store.state );
			const current = new URL( window.location.href );
			current.searchParams.set( 'query', serializedQuery );
			const title = 'Wikidata%20Query%20Builder+Ticket+Template';
			const desc = '**Problem:**\n\n**Example:**\n\n**Screenshots:**\n\n**Link+to+query:**\n';
			const phabricatorLink = 'https://phabricator.wikimedia.org/maniphest/task/edit/form/1/?title=';
			return phabricatorLink + title + '&description=' + encodeURI( desc + current.href ) +
          '&projects=Wikidata_Query_Builder';
		},
		privacyPolicy(): string | undefined {
			return process.env.VUE_APP_PRIVACY_POLICY_URL;
		},
	},
} );
</script>

<style lang="scss">
@use '../styles/links' as *;

$tinyViewportWidth: 38em;
$largeViewportWidth: 90em;

.querybuilder-footer {
	@include links-without-underline;

	padding-block: $dimension-layout-small;
	padding-inline: $dimension-layout-small;
	margin-inline: 0;

	@media (max-width: $tinyViewportWidth) {
		padding-block: $dimension-layout-xsmall;
		padding-inline: $dimension-layout-xsmall;
	}

	@media (min-width: $largeViewportWidth) {
		// set maximum width of the page
		max-width: $largeViewportWidth;
		margin-block: auto;
		margin-inline: auto;
	}

	display: flex;

	@media (max-width: $tinyViewportWidth) {
		flex-direction: column;
	}

	p {
		padding-block-end: $dimension-layout-xxsmall;
	}

	// More selective css to override the browser's default.
	h2 {
		font-size: $font-size-style-body;
	}

	&__column {
		font-family: $font-family-style-description;
		font-weight: $font-weight-style-description;
		font-size: $font-size-style-description;
		line-height: $font-line-height-style-description;
		color: $font-color-base;
	}

	&__column:not(:last-of-type) {
		padding-inline-end: 120px;

		@media (max-width: $tinyViewportWidth) {
			padding-block-end: $dimension-layout-medium;
			padding-inline-end: 0;
		}
	}

	&__title {
		font-weight: $font-weight-bold;
		padding-block-end: $dimension-layout-xsmall;
	}
}
</style>
