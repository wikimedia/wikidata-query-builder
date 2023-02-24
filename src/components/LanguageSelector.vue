<template>
	<div class="querybuilder__language-selector">
		<LanguageSelectorInput
			:value="searchInput"
			:placeholder="$i18n( 'query-builder-language-selector-input-placeholder' )"
			@input="onInput"
			@clear="onClearInputValue"
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
	},
} );
</script>

<style lang="scss">
.querybuilder__language-selector {
	position: absolute;
	width: 384px;
	z-index: 1;
}
</style>
