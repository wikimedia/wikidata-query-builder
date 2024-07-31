<template>
	<div class="querybuilder">
		<main ref="contentWrap">
			<div ref="header" class="querybuilder__heading">
				<a :href="queryBuilderBasePath">
					<div class="querybuilder__logo" />
					<h1 class="visually-hidden">
						<bdi id="directionSample" dir="auto">{{ $i18n( 'query-builder-heading' ) }}</bdi>
					</h1>
				</a>
				<div
					ref="languageSelectorSection"
					v-detect-click-outside="onClickOutsideLanguageSelector"
					class="querybuilder__languageSelector">
					<CdxButton
						:aria-label="$i18n( 'query-builder-toggle-language-selector-button' )"
						@click.native="onToggleLanguageSelector"
					>
						<CdxIcon
							class="languageSelector-button__icon"
							:icon="cdxIconLanguage" />
						{{ currentLanguageAutonym }}
					</CdxButton>
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
					<CdxButton
						v-i18n="{ msg: 'query-builder-run-query' }"
						action="progressive"
						weight="primary"
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
import { defineComponent } from '@/compat';
import { DirectiveBinding } from 'vue';
import { CdxButton, CdxIcon } from '@wikimedia/codex';
import { cdxIconLanguage } from '@wikimedia/codex-icons';

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
import languagedata from '@wikimedia/language-data';
import { useStore } from '@/store/index';

let handleOutsideClick: ( event: MouseEvent | TouchEvent ) => void;

export default defineComponent( {
	name: 'QueryBuilder',
	components: {
		CdxIcon,
		CdxButton,
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
	directives: {
		detectClickOutside: {
			mounted( element: HTMLElement, binding: DirectiveBinding ): void {
				handleOutsideClick = ( event: MouseEvent | TouchEvent ): void => {
					const callback = binding.value;
					if ( !element.contains( event.target as Node ) ) {
						callback();
					}
				};

				document.addEventListener( 'click', handleOutsideClick );
				document.addEventListener( 'touchstart', handleOutsideClick );
			},
			unmounted(): void {
				document.removeEventListener( 'click', handleOutsideClick );
				document.removeEventListener( 'touchstart', handleOutsideClick );
			},
		},
	},
	props: {
		lang: {
			type: String,
			default: '',
		},
	},
	emits: [ 'update:lang' ],
	setup() {
		return {
			cdxIconLanguage,
		};
	},
	data() {
		const store = useStore();
		return {
			store,
			encodedQuery: '',
			iframeRenderKey: 0,
			showLanguageSelector: false,
			resizeObserver: null as unknown as ResizeObserver,
		};
	},
	computed: {
		queryBuilderBasePath(): string {
			return window.location.pathname;
		},
		conditionRows(): ConditionRow[] {
			const store = useStore();
			return store.getConditionRows;
		},
		currentLanguageAutonym(): string {
			return languagedata.getAutonym( this.lang );
		},
	},
	methods: {
		incrementMetric( metric: string ): void {
			const store = useStore();
			store.incrementMetric( metric );
		},
		async runQuery(): Promise<void> {
			const store = useStore();
			await store.validateForm();
			this.incrementMetric( 'run-query-button' );
			// This rule is needed because the vue2-common config is not
			// recognizing the error property defined in computed: mapState

			if ( store.errors.length ) {
				return;
			}
			this.encodedQuery = encodeURI( buildQuery( store.query ) );

			// force the iframe to rerender https://stackoverflow.com/a/48755228
			this.iframeRenderKey = Math.random();
		},
		async addCondition(): Promise<void> {
			// const store = useStore();
			await this.store.addCondition();
			await this.$nextTick();
			document
				.getElementsByClassName( 'querybuilder__condition-wrapper--last' )[ 0 ]
				.scrollIntoView( { behavior: 'smooth' } );

			const toggle = document
				.querySelectorAll( '.querybuilder__condition-relation-toggle .wikit-ToggleButton' );

			( toggle[ toggle.length - 1 ] as HTMLElement ).focus();
		},
		setConditionRelation( value: ConditionRelation, index: number ): void {
			// const store = useStore();
			this.store.setConditionRelation( { value, conditionIndex: index + 1 } );
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
		onClickOutsideLanguageSelector(): void {
			this.showLanguageSelector = false;
		},
		changeLanguageSelectorMenuDirection(): void {
			if ( !( this.$refs.header && this.$refs.languageSelectorSection && this.$refs.languageSelector ) ) {
				return;
			}
			const headerTop = ( this.$refs.header as HTMLElement ).getBoundingClientRect().top;
			const languageSelectorSectionTop =
			( this.$refs.languageSelectorSection as HTMLElement ).getBoundingClientRect().top;
			if ( languageSelectorSectionTop > headerTop ) {
				( ( this.$refs.languageSelector as Vue ).$el as HTMLElement ).style.insetInlineEnd = 'unset';
				( ( this.$refs.languageSelector as Vue ).$el as HTMLElement ).style.insetInlineStart = '0';
			} else {
				( ( this.$refs.languageSelector as Vue ).$el as HTMLElement ).style.insetInlineEnd = '0';
				( ( this.$refs.languageSelector as Vue ).$el as HTMLElement ).style.insetInlineStart = 'unset';
			}
		},
		onWindowResize(): void {
			this.changeLanguageSelectorMenuDirection();
		},
	},
	watch: {
		showLanguageSelector: {
			handler( newShowLanguageSelector: boolean ): void {
				if ( newShowLanguageSelector === true ) {
					document.body.classList.add( 'overflow-hidden-on-mobile' );
				} else {
					document.body.classList.remove( 'overflow-hidden-on-mobile' );
				}
			},
			immediate: true,
		},
	},
	created() {
		this.incrementMetric( 'main-page-loaded' );
	},
	mounted() {
		this.resizeObserver = new ResizeObserver( this.onWindowResize );
		this.resizeObserver.observe( this.$refs.contentWrap as Element );
	},
	beforeUnmount() {
		this.resizeObserver.unobserve( this.$refs.contentWrap as Element );
	},
} );
</script>

<style lang="scss">
@import '../styles/links';
@import '../styles/typography';
@include links-without-underline;

$tinyViewportWidth: $max-width-breakpoint-mobile;

/*
 * This is a rough approximation. by using a screen size emulator,
 * we can see the width where all items are aligned.
 */
$largeViewportWidth: $min-width-breakpoint-desktop; // ~1438px

body.overflow-hidden-on-mobile {
	@media (max-width: $tinyViewportWidth) {
		overflow: hidden;
	}
}

// TODO replace with link component once available
a {
	font-family: $font-family-system-sans;
	font-weight: $font-weight-normal;
	font-size: $font-size-medium;
	line-height: $line-height-small;
	color: $color-progressive;
	transition: $transition-property-base $transition-duration-base;

	&:active {
		color: $color-progressive--active;
	}

	&:visited {
		color: $color-visited;
	}
}

.querybuilder main {
	padding-block: var(--dimension-layout-small) var(--dimension-layout-large);
	padding-inline: var(--dimension-layout-small);

	@media (max-width: $tinyViewportWidth) {
		padding-inline: var(--dimension-layout-xsmall);
	}

	@media (min-width: $largeViewportWidth) {
		// set maximum width of the page
		max-inline-size: 90em;
		margin-inline: auto;
		padding-inline: var(--dimension-layout-medium);
		padding-block: var(--dimension-layout-medium);
	}
}

.querybuilder__condition-wrapper {
	margin-block: var(--dimension-layout-xsmall);
	padding-block: var(--dimension-layout-xsmall);
	padding-inline: var(--dimension-layout-xsmall);
	background-color: $background-color-neutral-subtle;
	border: $border-width-base $border-style-base $border-color-subtle;
	border-radius: $border-radius-base;

	@media (max-width: $tinyViewportWidth) {
		padding-block: var(--dimension-layout-xxsmall);
		padding-inline: var(--dimension-layout-xxsmall);
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
	border-inline: $border-width-base $border-style-base $border-color-subtle;
	background-color: $background-color-neutral-subtle;
}

.querybuilder__condition-relation-toggle-or {
	padding-inline-start: var(--dimension-layout-xsmall);
}

.querybuilder__condition-relation-toggle {
	padding-block: var(--dimension-layout-xsmall);
}

.querybuilder__condition-placeholder {
	@include body-s;

	background-color: $background-color-neutral-subtle;
	margin-block: var(--dimension-layout-xsmall);
	padding-block: var(--dimension-layout-xsmall);
	text-align: center;
	border-radius: $border-radius-base;
}

.querybuilder__heading {
	padding-block-end: var(--dimension-layout-small);
	display: flex;
	flex-wrap: wrap;
	gap: 1.5rem;
	justify-content: space-between;

	.querybuilder__logo {
		background-image: url('/img/QB_Logo.svg');
		inline-size: 360px;
		block-size: 24px;

		@media (max-width: $tinyViewportWidth) {
			background-image: url('/img/QB_Logo_Mobile.svg');
			inline-size: 239px;
			block-size: 24px;
		}
	}

	.languageSelector-button__icon {
		vertical-align: top;
	}
}

.visually-hidden:not(:focus, :active) {
	clip: rect(0 0 0 0);
	clip-path: inset(100%);
	block-size: 1px;
	overflow: hidden;
	position: absolute;
	white-space: nowrap;
	inline-size: 1px;
}

.querybuilder__description-heading {
	@include heading-4;

	color: $color-emphasized;
	margin: var(--dimension-layout-xsmall) 0;
}

.querybuilder__description {
	@include body-m;

	max-inline-size: 676px; // TODO: replace with token

	@media (width < 676px) {
		inline-size: 100%;
	}
}

.querybuilder__query-title {
	@include heading-4;

	margin-block-start: var(--dimension-layout-large);
}

.querybuilder__query-subtitle {
	@include body-s;

	margin-block: var(--dimension-layout-xsmall) var(--dimension-layout-xxsmall);
}

.querybuilder__setting-header {
	@include heading-4;

	margin-block-start: var(--dimension-layout-medium);
}

.querybuilder__settings {
	background-color: $background-color-neutral-subtle;
	border-radius: $border-radius-base;
	border-color: $border-color-transparent;
	margin-block-start: var(--dimension-layout-xxsmall);
	padding-block: var(--dimension-layout-xsmall);
	padding-inline: var(--dimension-layout-xsmall);
}

.querybuilder__run {
	@include heading-5;

	margin-block-start: var(--dimension-layout-medium);

	& button {
		@media (max-width: $tinyViewportWidth) {
			inline-size: 100%;
		}
	}
}

.query-builder__footer {
	background-color: $background-color-neutral-subtle;
}

.querybuilder__languageSelector {
	> button {
		margin-block-end: 2px;
	}

	@media (min-width: $tinyViewportWidth) {
		position: relative;
	}
}
</style>
