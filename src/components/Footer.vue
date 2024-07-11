<template>
	<footer class="querybuilder-footer">
		<div class="querybuilder-footer__column">
			<h2 v-i18n="{ msg: 'query-builder-footer-about-query-builder' }" class="querybuilder-footer__title" />
			<p v-html="$i18n( 'query-builder-footer-licence', license )" />
			<p
				v-if="buildTime && commitLink"
				class="querybuilder-footer__build-info"
				v-html="$i18n( 'query-builder-footer-build-time', commitLink, buildTime )"
			/>
			<p>
				<WikitLink
					v-i18n="{ msg: 'query-builder-footer-view-source' }"
					href="https://gerrit.wikimedia.org/g/wikidata/query-builder"
				/>
			</p>
			<p class="querybuilder-footer__report-link">
				<WikitLink v-i18n="{ msg: 'query-builder-footer-report-link' }" :href="bugLink" />
			</p>
		</div>
		<div class="querybuilder-footer__column">
			<h2 v-i18n="{ msg: 'query-builder-footer-about-us' }" class="querybuilder-footer__title" />
			<p v-if="privacyPolicy" class="querybuilder-footer__privacy-policy">
				<WikitLink v-i18n="{ msg: 'query-builder-footer-privacy-policy' }" :href="privacyPolicy" />
			</p>
			<p>
				<WikitLink
					v-i18n="{ msg: 'query-builder-footer-wikimedia-deutchland' }"
					href="https://www.wikimedia.de/"
				/>
			</p>
			<p
				v-html="$i18n( 'query-builder-footer-team', teamLink )"
			/>
		</div>
		<div class="querybuilder-footer__column">
			<h2 v-i18n="{ msg: 'query-builder-footer-more-data-quality-tools' }" class="querybuilder-footer__title" />
			<p>
				<WikitLink
					v-i18n="{ msg: 'query-builder-footer-mismatch-finder' }"
					href="https://mismatch-finder.toolforge.org/"
				/>
			</p>
			<p>
				<WikitLink
					v-i18n="{ msg: 'query-builder-footer-item-quality-evaluator' }"
					href="https://item-quality-evaluator.toolforge.org/"
				/>
			</p>
			<p>
				<WikitLink
					v-i18n="{ msg: 'query-builder-footer-curious-facts' }"
					href="https://wikidata-analytics.wmcloud.org/app/CuriousFacts"
				/>
			</p>
			<p>
				<WikitLink
					v-i18n="{ msg: 'query-builder-footer-constraints-violation-checker' }"
					href="https://github.com/wmde/wikidata-constraints-violation-checker"
				/>
			</p>
		</div>
	</footer>
</template>

<script lang="ts">
import QuerySerializer from '@/serialization/QuerySerializer';
import { defineComponent } from '@/compat';
import { Link as WikitLink } from '@wmde/wikit-vue-components';
import { useStore } from '@/store';

export default defineComponent( {
	name: 'Footer',
	components: {
		WikitLink,
	},
	data() {
		return {
			// eslint-disable-next-line max-len
			license: 'https://gerrit.wikimedia.org/r/plugins/gitiles/wikidata/query-builder/+/refs/heads/master/LICENSE',
			teamLink: 'https://www.wikidata.org/wiki/Wikidata:Report_a_technical_problem',
		};
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
			const store = useStore();
			const querySerializer = new QuerySerializer();
			const serializedQuery = querySerializer.serialize( store );
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
@import "@wikimedia/codex-design-tokens/theme-wikimedia-ui";
@import '../styles/typography';

$tinyViewportWidth: $max-width-breakpoint-mobile;
$largeViewportWidth: $min-width-breakpoint-desktop;

.querybuilder-footer {
	padding-block: var(--dimension-layout-small);
	padding-inline: var(--dimension-layout-small);
	margin-inline: 0;

	@media (max-width: $tinyViewportWidth) {
		padding-block: var(--dimension-layout-xsmall);
		padding-inline: var(--dimension-layout-xsmall);
	}

	@media (min-width: $largeViewportWidth) {
		// set maximum width of the page
		max-inline-size: 90em;
		margin-block: auto;
		margin-inline: auto;
		padding-inline: var(--dimension-layout-medium);
	}

	display: flex;

	@media (max-width: $tinyViewportWidth) {
		flex-direction: column;
	}

	p {
		padding-block-end: var(--dimension-layout-xxsmall);
	}

	// More selective css to override the browser's default.
	h2 {
		font-size: $font-size-medium;
	}

	&__column {
		@include body-s;
	}

	&__column:not(:last-of-type) {
		padding-inline-end: 120px;

		@media (max-width: $tinyViewportWidth) {
			padding-block-end: var(--dimension-layout-medium);
			padding-inline-end: 0;
		}
	}

	&__title {
		font-weight: $font-weight-bold;
		padding-block-end: var(--dimension-layout-xsmall);
		color: $color-emphasized;
	}
}
</style>
