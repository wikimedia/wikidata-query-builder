<template>
	<div class="querybuilder__language-selector">
		<div class="languageSelector__mobile-header">
			<span>{{ $i18n( 'query-builder-language-selector-mobile-header' ) }}</span>
			<button @click="onCloseMenu">
				<img src="/img/close.svg" :alt="$i18n( 'query-builder-language-selector-close-button-label' )">
			</button>
		</div>
		<LanguageSelectorInput
			ref="input"
			:value="searchInput"
			:placeholder="$i18n( 'query-builder-language-selector-input-placeholder' )"
			@input="onInput"
			@clear="onClearInputValue"
			@blur="$emit( 'close' )"
		/>
		<LanguageSelectorOptionsMenu
			:languages="shownLanguages"
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
import languagedata from '@wikimedia/language-data';

export default Vue.extend( {
	name: 'LanguageSelector',
	components: {
		LanguageSelectorInput,
		LanguageSelectorOptionsMenu,
	},
	data: () => ( {
		searchInput: '',
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
				language.autonym.toLowerCase().includes( this.searchInput.toLowerCase() ),
			);
		},
	},
	methods: {
		onInput( searchedLanguage: string ): void {
			this.searchInput = searchedLanguage;
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
	},
} );
</script>

<style lang="scss">
$tinyViewportWidth: 38em;

.querybuilder__language-selector {
	position: absolute;
	right: 0;
	width: 384px;
	z-index: 1;

	@media (max-width: $tinyViewportWidth) {
		width: 100%;
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
