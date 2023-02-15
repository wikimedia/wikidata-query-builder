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
import Vue, { PropType } from 'vue';

export default Vue.extend( {
	name: 'LanguageSelector',
	components: {
		LanguageSelectorInput,
		LanguageSelectorOptionsMenu,
	},
	props: {
		languages: {
			type: Array as PropType<string[]>,
			default: (): [] => [],
		},
	},
	data: () => ( {
		searchInput: '',
	} ),
	computed: {
		shownLanguages(): string[] {
			return this.languages.filter( ( language ) =>
				language.toLowerCase().includes( this.searchInput.toLowerCase() ),
			);
		},
	},
	methods: {
		onInput( searchedLanguage: string ): void {
			this.searchInput = searchedLanguage;
		},
		onSelect( language: string ): void {
			this.$emit( 'select', language );
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
