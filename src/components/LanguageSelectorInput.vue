<template>
	<div class="languageSelector__input__wrapper">
		<div class="languageSelector__input-left-side">
			<div class="languageSelector__input__search-icon">
				<img src="/img/search.svg" alt="">
			</div>
			<input
				type="text"
				class="languageSelector__input"
				:value="value"
				:placeholder="placeholder"
				@input="$emit( 'input', $event.target.value )"
			>
		</div>
		<button
			class="languageSelector__input__clear-button"
			:class="clearBtnVisible ? 'languageSelector__input__clear-button--visible' : ''"
			@click="onClearInputValue"
		>
			<img src="/img/clear.svg" :alt="$i18n( 'query-builder-language-selector-clear-button-label' )">
		</button>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend( {
	name: 'LanguageSelectorInput',
	props: {
		value: {
			type: String,
			default: '',
		},
		placeholder: {
			type: String,
			default: '',
		},
	},
	computed: {
		clearBtnVisible(): boolean {
			return this.value.length > 0;
		},
	},
	methods: {
		onClearInputValue(): void {
			this.$emit( 'clear' );
		},
	},
} );
</script>

<style lang="scss">
.languageSelector__input {
	color: #202122;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Lato, Helvetica, Arial, sans-serif;
	font-size: 1em;
	font-weight: 400;
	box-sizing: border-box;
	flex-grow: 1;
	border-color: #3366cc;
	height: 20px;

	&:focus {
		outline: none;
	}

	&::placeholder {
		color: #72777d;
	}

	&__wrapper {
		background-color: #ffffff;
		border-color: #a2a9b1;
		border-style: solid;
		border-width: 1px;
		border-radius: 2px 2px 0px 0px;
		padding-inline: 16px;
		padding-block: 16px;
		width: 100%;
		display: flex;
		justify-content: space-between;
		box-shadow: 0 1px 2px #00000040, inset 0 0 0 1px #36c;
		border-color: #3366cc;
	}

	&-left-side {
		display:flex;
		flex-grow:1;
	}

	&__search-icon {
		display: flex;
		padding-right: 8px;
		height: fit-content;
	}

	&__clear-button {

		visibility: hidden;
		display: flex;

		&--visible {
			visibility: visible;
		}
	}

}
</style>