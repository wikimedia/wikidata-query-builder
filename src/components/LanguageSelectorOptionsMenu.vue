<template>
	<div
		class="languageSelector__options-menu"
		role="listbox"
		:aria-label="$i18n( 'query-builder-language-selector-options-menu-aria-label' )"
	>
		<div class="languageSelector__options-menu__languages-list">
			<div
				v-for="language in languages"
				:key="language"
				:aria-selected="language === selectedLanguage || null"
				class="languageSelector__options-menu__languages-list__item"
				:class="language === selectedLanguage ? 'language--selected' : ''"
				role="option"
				@click="onSelect( language )"
			>
				{{ language }}
			</div>
		</div>
		<div
			v-if="languages.length === 0"
			class="languageSelector__options-menu__no-results"
			role="option">
			<slot name="no-results" />
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend( {
	name: 'LanguageSelectorOptionsMenu',
	props: {
		languages: {
			type: Array,
			default: (): [] => [],
		},
	},
	data: () => ( {
		selectedLanguage: '',
	} ),
	methods: {
		onSelect( selectedLanguage: string ): void {
			this.selectedLanguage = selectedLanguage;
			this.$emit( 'select', selectedLanguage );
		},
	},
} );
</script>

<style lang="scss">
$base: '.languageSelector__options-menu';

#{$base} {
	background-color: #ffffff;
	border-radius: 1px;
	border: 1px solid #a2a9b1;
	box-shadow: $wikit-OptionsMenu-box-shadow;
	overflow-y: auto;
	box-sizing: border-box;
	z-index: 1;
	padding-block: 8px;
	padding-inline: 12px;
	max-height: 35vh;
	overflow: scroll;

	&__languages-list {

		list-style-type: none;

		&__item {
			position: relative;
			padding-block: 8px;
			padding-inline: 32px 0;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Lato, Helvetica, Arial, sans-serif;
			transition-property: background-color;
			transition-duration: 100ms;
			transition-timing-function: ease;

			&:hover, &:active{
				background-color: #EAECF0;
				cursor: pointer;
			}

			&--selected, &--selected:hover {
				background-color: #EAECF0;
			}
		}
	}

	&__no-results {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Lato, Helvetica, Arial, sans-serif;
		font-size: 1em;
		font-weight: normal;
		color: #202122;
		line-height: 1.25;
		padding-block: 8px;
		padding-inline: 8px;
	}
}
</style>
