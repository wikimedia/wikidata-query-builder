<template>
	<div class="querybuilder">
		<main>
			<div class="querybuilder__heading">
				<a href="/">
					<div class="querybuilder__logo" />
					<h1 class="visually-hidden">
						<bdi id="directionSample" dir="auto">{{ $i18n( 'query-builder-heading' ) }}</bdi>
					</h1>
				</a>
				<div class="querybuilder__languageSelector">
					<Button
						type="neutral"
						:aria-label="$i18n( 'query-builder-toggle-language-selector-button' )"
						@click.native="onToggleLanguageSelector"
					>
						<template #prefix>
							<Icon type="language-selector" />
						</template>
						{{ lang }}
					</Button>
					<LanguageSelector
						v-show="showLanguageSelector"
						ref="languageSelector"
						@close="onCloseLanguageSelector"
						@select="onChangeLanguage"
					>
						<template #no-results>
							{{ $i18n( 'query-builder-language-selector-no-results' ) }}
						</template>
					</LanguageSelector>
				</div>
			</div>
			<h2
				class="querybuilder__description-heading"
				v-html="$i18n( 'query-builder-intro-heading' )" />
			<p
				class="querybuilder__description"
				v-html="$i18n(
					'query-builder-intro-text',
					'https://www.wikidata.org/wiki/Special:MyLanguage/Wikidata:SPARQL_tutorial',
					'https://www.wikidata.org/wiki/Wikidata_talk:Query_Builder'
				) " />
			<div role="form">
				<h2
					class="querybuilder__query-title"
					v-html="$i18n( 'query-builder-query-heading' )" />
				<p
					v-i18n="{ msg: 'query-builder-find-all-items' }"
					class="querybuilder__query-subtitle" />
				<div
					v-if="!conditionRows.length"
					v-i18n="{ msg: 'query-builder-condition-placeholder' }"
					class="querybuilder__condition-placeholder" />
				<div
					v-for="( condition, index ) in conditionRows"
					:key="condition.conditionId"
					class="querybuilder__condition-group"
					:class="[
						( isAboveOr( index ) ) ? 'querybuilder__condition-group--above' : ''
					]"
				>
					<div
						class="querybuilder__condition-wrapper"
						:class="[
							( index === 0 ) ? 'querybuilder__condition-wrapper--first' : '',
							( ( index + 1 ) === conditionRows.length ) ? 'querybuilder__condition-wrapper--last' : '',
							( isBelowOr( index ) ) ? 'querybuilder__condition-wrapper--below' : '',
							( isAboveOr( index ) ) ? 'querybuilder__condition-wrapper--above' : ''
						]"
					>
						<QueryCondition
							:condition-index="index"
						/>
					</div>
					<ConditionRelationToggle
						v-if="( index + 1 ) !== conditionRows.length"
						class="querybuilder__condition-relation-toggle"
						:class="[
							( isBelowOr( index + 1 ) ) ? 'querybuilder__condition-relation-toggle-or' : ''
						]"
						:value="conditionRows[index + 1].conditionRelation"
						@set-relation-toggle="setConditionRelation( $event, index )"
					/>
				</div>
				<AddCondition @add-condition="addCondition" />
				<h2
					class="querybuilder__setting-header"
					v-html="$i18n( 'query-builder-settings-heading' )" />
				<div class="querybuilder__settings">
					<Limit />
					<LabelOptout />
				</div>
				<div class="querybuilder__run">
					<Button
						v-i18n="{ msg: 'query-builder-run-query' }"
						type="progressive"
						variant="primary"
						@click.native="runQuery" />
					<SharableLink />
				</div>
			</div>
			<QueryResult
				:encoded-query="encodedQuery"
				:iframe-render-key="iframeRenderKey"
			/>
		</main>
		<div class="query-builder__footer">
			<Footer />
		</div>
	</div>
</template>

<script lang="ts">
import Footer from '@/components/Footer.vue';
import { ConditionRow } from '@/store/RootState';
import Vue from 'vue';
import { mapState } from 'vuex';
import { Button, Icon } from '@wmde/wikit-vue-components';

import ConditionRelationToggle from '@/components/ConditionRelationToggle.vue';
import QueryCondition from '@/components/QueryCondition.vue';
import QueryResult from '@/components/QueryResult.vue';
import buildQuery from '@/sparql/buildQuery';
import AddCondition from '@/components/AddCondition.vue';
import Limit from '@/components/Limit.vue';
import LabelOptout from '@/components/LabelOptout.vue';
import ConditionRelation from '@/data-model/ConditionRelation';
import SharableLink from '@/components/SharableLink.vue';
import LanguageSelector from '@/components/LanguageSelector.vue';

export default Vue.extend( {
	name: 'QueryBuilder',
	components: {
		Icon,
		Button,
		ConditionRelationToggle,
		QueryResult,
		QueryCondition,
		AddCondition,
		Limit,
		LabelOptout,
		Footer,
		SharableLink,
		LanguageSelector,
	},
	props: {
		lang: {
			type: String,
			default: '',
		},
	},
	data() {
		return {
			encodedQuery: '',
			iframeRenderKey: 0,
			showLanguageSelector: false,
		};
	},
	computed: {
		conditionRows(): ConditionRow[] {
			return this.$store.getters.conditionRows;
		},
		...mapState( {
			errors: 'errors',
		} ),
	},
	methods: {
		incrementMetric( metric: string ): void {
			this.$store.dispatch( 'incrementMetric', metric );
		},
		async runQuery(): Promise<void> {
			await this.$store.dispatch( 'validateForm' );
			this.incrementMetric( 'run-query-button' );
			// This rule is needed because the vue2-common config is not
			// recognizing the error property defined in computed: mapState
			// eslint-disable-next-line vue/no-undef-properties
			if ( this.errors.length ) {
				return;
			}
			this.encodedQuery = encodeURI( buildQuery( this.$store.getters.query ) );

			// force the iframe to rerender https://stackoverflow.com/a/48755228
			this.iframeRenderKey = Math.random();
		},
		async addCondition(): Promise<void> {
			await this.$store.dispatch( 'addCondition' );
			await this.$nextTick();
			document
				.getElementsByClassName( 'querybuilder__condition-wrapper--last' )[ 0 ]
				.scrollIntoView( { behavior: 'smooth' } );

			const toggle = document
				.querySelectorAll( '.querybuilder__condition-relation-toggle .wikit-ToggleButton' );

			( toggle[ toggle.length - 1 ] as HTMLElement ).focus();
		},
		setConditionRelation( value: ConditionRelation, index: number ): void {
			this.$store.dispatch( 'setConditionRelation', { value, conditionIndex: index + 1 } );
		},
		isAboveOr( index: number ): boolean {
			return ( index + 1 ) !== this.conditionRows.length &&
          this.conditionRows[ index + 1 ].conditionRelation === ConditionRelation.Or;
		},
		isBelowOr( index: number ): boolean {
			return index !== 0 && this.conditionRows[ index ].conditionRelation === ConditionRelation.Or;
		},
		onCloseLanguageSelector(): void {
			this.showLanguageSelector = false;
		},
		onToggleLanguageSelector(): void {
			this.showLanguageSelector = !this.showLanguageSelector;
			if ( this.showLanguageSelector === true ) {
				this.$nextTick( () => {
					this.$refs.languageSelector.focus();
				} );
			}
		},
		onChangeLanguage( newLanguage: string ): void {
			this.$emit( 'update:lang', newLanguage );
		},
	},
	created() {
		this.incrementMetric( 'main-page-loaded' );
	},
} );
</script>

<style lang="scss">
@use '../styles/links' as *;

@include links-without-underline;
// TODO replace with link component once available
a {
	font-family: $wikit-Link-font-family;
	font-weight: $wikit-Link-font-weight;
	font-size: $wikit-Link-font-size;
	line-height: $wikit-Link-line-height;
	color: $wikit-Link-font-color;
	transition: $transition-interaction-link-property $transition-interaction-link-duration;

	&:active {
		color: $font-color-progressive-active;
	}

	&:visited {
		color: $wikit-Link-visited-font-color;
	}
}

$tinyViewportWidth: 38em;

/*
 * This is a rough approximation. by using a screen size emulator,
 * we can see the width where all items are aligned.
 */
$largeViewportWidth: 90em; //~1438px

.querybuilder main {
	padding-block: $dimension-layout-small $dimension-layout-large;
	padding-inline: $dimension-layout-small;

	@media (max-width: $tinyViewportWidth) {
		padding-inline: $dimension-layout-xsmall;
	}

	@media (min-width: $largeViewportWidth) {
		// set maximum width of the page
		max-width: $largeViewportWidth;
		margin-inline: auto;
	}
}

.querybuilder__condition-wrapper {
	margin-block: $dimension-layout-xsmall;
	padding-block: $dimension-layout-xsmall;
	padding-inline: $dimension-layout-xsmall;
	background-color: $background-color-neutral-default;
	border: $border-width-thin $border-style-base $border-color-base-subtle;
	border-radius: $border-radius-base;

	@media (max-width: $tinyViewportWidth) {
		padding-block: $dimension-layout-xxsmall;
		padding-inline: $dimension-layout-xxsmall;
	}

	&.querybuilder__condition-wrapper--first {
		margin-block-start: 0;
	}
}

.querybuilder__condition-wrapper--below {
	margin-block-start: 0;
	border-block-start: none;
}

.querybuilder__condition-wrapper--above {
	margin-block-end: 0;
	border-inline: none;
	border-block-end: none;
}

.querybuilder__condition-group--above {
	border-inline: $border-width-thin $border-style-base $border-color-base-subtle;
	background-color: $background-color-neutral-default;
}

.querybuilder__condition-relation-toggle-or {
	padding-inline-start: $dimension-layout-xsmall;
}

.querybuilder__condition-relation-toggle {
	padding-block: $dimension-layout-xsmall;
}

.querybuilder__condition-placeholder {
	background-color: $background-color-neutral-default;
	margin-block: $dimension-layout-xsmall;
	padding-block: $dimension-layout-xsmall;
	text-align: center;
	border-radius: $border-radius-base;
	font-family: $font-family-style-description;
	font-weight: $font-weight-style-description;
	font-size: $font-size-style-description;
	line-height: $font-line-height-style-description;
}

.querybuilder__heading {
	padding-bottom: $dimension-layout-small;
	display: flex;
	justify-content: space-between;

	.querybuilder__logo {
		background-image: url( '/img/QB_Logo.svg' );
		width: 351px;
		height: 24px;

		@media (max-width: $tinyViewportWidth) {
			background-image: url( '/img/QB_Logo_Mobile.svg' );
			width: 239px;
			height: 24px;
		}
	}
}

.visually-hidden:not(:focus):not(:active) {
	clip: rect(0 0 0 0);
	clip-path: inset(100%);
	height: 1px;
	overflow: hidden;
	position: absolute;
	white-space: nowrap;
	width: 1px;
}

.querybuilder__description-heading {
  font-family: $font-family-style-heading-sans;
  font-size: $font-size-style-h4;
  font-weight: $font-weight-style-h4;
  line-height: $font-line-height-style-heading;
  color: $font-color-emphasized;
  margin: $dimension-layout-xsmall 0;
}

.querybuilder__description {
	font-family: $font-family-style-body;
	font-weight: $font-weight-style-body;
	font-size: $font-size-style-body;
	line-height: $font-line-height-style-body;
	color: $font-color-base;
	max-width: 672px; // TODO: replace with token

	@media (max-width: 671px) {
		width: 100%;
	}
}

.querybuilder__query-title {
	font-family: $font-family-style-heading-sans;
	font-weight: $font-weight-style-h4;
	font-size: $font-size-style-h4;
	line-height: $font-line-height-style-heading;
	color: $font-color-base;
	margin-block-start: $dimension-layout-large;
}

.querybuilder__query-subtitle {
	font-family: $font-family-style-description;
	font-weight: $font-weight-style-description;
	font-size: $font-size-style-description;
	line-height: $font-line-height-style-description;
	color: $font-color-base;
	margin-block-start: $dimension-layout-xsmall;
	margin-block-end: $dimension-layout-xxsmall;
}

.querybuilder__setting-header {
	font-family: $font-family-style-heading-sans;
	font-weight: $font-weight-style-h4;
	font-size: $font-size-style-h4;
	line-height: $font-line-height-style-heading;
	color: $font-color-base;
	margin-block-start: $dimension-layout-medium;
}

.querybuilder__settings {
	background-color: $background-color-neutral-default;
	border-radius: $border-radius-base;
	border-color: $border-color-base-transparent;
	margin-block-start: $dimension-layout-xxsmall;
	padding-block: $dimension-layout-xsmall;
	padding-inline: $dimension-layout-xsmall;
}

.querybuilder__run {
	font-family: $font-family-style-heading-sans;
	font-weight: $font-weight-style-h4;
	line-height: $font-line-height-style-heading;
	color: $font-color-base;
	margin-block-start: $dimension-layout-medium;

	& button {
		@media (max-width: $tinyViewportWidth) {
			width: 100%;
		}
	}
}

.query-builder__footer {
	background-color: $color-base-90;
}

.querybuilder__languageSelector {
	@media (min-width: $tinyViewportWidth) {
		position: relative;
	}
}
</style>
