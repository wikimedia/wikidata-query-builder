<template>
	<div class="querybuilder__language-selector">
		<div class="languageSelector__mobile-header">
			<span>{{ $i18n( 'query-builder-language-selector-mobile-header' ) }}</span>
			<button @click="onCloseMenu">
				<img :src="closeUrl" :alt="$i18n( 'query-builder-language-selector-close-button-label' )">
			</button>
		</div>
		<LanguageSelectorInput
			ref="input"
			:value="searchInput"
			:placeholder="$i18n( 'query-builder-language-selector-input-placeholder' )"
			@input="onInput"
			@clear="onClearInputValue"
			@tab="onCloseMenu"
			@arrowDown="onArrowDown"
			@arrowUp="onArrowUp"
			@enter="onEnter"
			@escape="onCloseMenu"
		/>
		<LanguageSelectorOptionsMenu
			tabindex="-1"
			:languages="shownLanguages"
			:highlighted-index="highlightedIndex"
			@select="onSelect"
		>
			<template #no-results>
				<slot name="no-results" />
			</template>
		</LanguageSelectorOptionsMenu>
	</div>
</template>

<script lang="ts">
import LanguageSelectorInput from '@/components/LanguageSelectorInput.vue';
import LanguageSelectorOptionsMenu from '@/components/LanguageSelectorOptionsMenu.vue';
import Language from '@/data-model/Language';
import Vue from 'vue';
import axios from 'axios';
import debounce from 'lodash.debounce';
import languagedata from '@wikimedia/language-data';
import closeUrl from '/img/close.svg';

export default Vue.extend( {
	name: 'LanguageSelector',
	components: {
		LanguageSelectorInput,
		LanguageSelectorOptionsMenu,
	},
	data: () => ( {
		searchInput: '',
		highlightedIndex: -1,
		closeUrl,
		apiLanguageCodes: [ '' ],
	} ),
	computed: {
		languages(): Language[] {
			const autonyms = languagedata.getAutonyms();
			const languageCodes = Object.keys( autonyms );
			languageCodes.sort( languagedata.sortByAutonym );
			return languageCodes.map( ( code ) => ( {
				code,
				autonym: autonyms[ code ],
			} ) );
		},
		shownLanguages(): Language[] {
			return this.languages.filter( ( language ) =>
				language.code.startsWith( this.searchInput.toLowerCase() ) ||
				language.autonym.toLowerCase().includes( this.searchInput.toLowerCase() ) ||
				this.apiLanguageCodes.includes( language.code ),
			);
		},
	},
	methods: {
		async onInput( searchedLanguage: string ) {
			this.searchInput = searchedLanguage;
			if ( this.searchInput ) {
				this.debouncedApiLanguageSearch( this.searchInput );
			}
			this.highlightedIndex = 0;
		},
		onSelect( languageCode: string ): void {
			this.$emit( 'select', languageCode );
		},
		onClearInputValue(): void {
			this.searchInput = '';
		},
		onCloseMenu(): void {
			this.$emit( 'close' );
		},
		// eslint-disable-next-line vue/no-unused-properties -- exported method
		focus(): void {
			( this.$refs.input as InstanceType<typeof LanguageSelectorInput> ).focus();
		},
		onArrowDown(): void {
			this.highlightedIndex = ( this.highlightedIndex + 1 ) % this.shownLanguages.length;
		},
		onArrowUp(): void {
			const length = this.shownLanguages.length;
			this.highlightedIndex = ( this.highlightedIndex + length - 1 ) % length;
		},
		onEnter(): void {
			this.onSelect( this.shownLanguages[ this.highlightedIndex ].code );
		},
		debouncedApiLanguageSearch:
			debounce( async function ( this: { apiLanguageCodes: string[] }, debouncedInputValue: string ) {
				await axios.get(
					'https://www.wikidata.org/w/api.php?action=languagesearch&format=json&formatversion=2',
					{
						params: {
							search: debouncedInputValue,
							origin: '*', // avoid CORS console errors
						},
					} ).then( ( response ) => {
					this.apiLanguageCodes = Object.keys( response.data.languagesearch );
				} );
			}, 200 ),
	},
} );
</script>

<style lang="scss">
$tinyViewportWidth: 38em;

.querybuilder__language-selector {
	position: absolute;
	inset-inline-end: 0;
	inline-size: 384px;
	z-index: 1;

	@media (max-width: $tinyViewportWidth) {
		inline-size: 100%;
		position: fixed;
		inset-block-start: 0;
		display: flex;
		flex-direction: column;
		block-size: 100%;
	}

	.languageSelector__mobile-header {
		display: none;
		padding-block: 12px;
		padding-inline: 16px;
		justify-content: space-between;
		background-color: #fff;

		span {
			color: #202122;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Lato, Helvetica, Arial, sans-serif;
			font-size: 1em;
			font-weight: bold;
		}

		@media (max-width: $tinyViewportWidth) {
			display: flex;
		}
	}
}
</style>
