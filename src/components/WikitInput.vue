<template>
	<!-- re-emits the input event so that parent components can use `@input` instead of `@input.native` -->
	<input
		type="text"
		class="wikit wikit-Input"
		:class="[ { [ `wikit-Input--${feedbackType}` ]: feedbackType !== null } ]"
		:value="value"
		@input="$emit( 'update:modelValue', $event.target.value )"
	>
</template>

<script setup lang="ts">

interface Props {
	feedbackType?: 'warning'|'error'|null;
	value: string | null;
}

withDefaults( defineProps<Props>(), {
	feedbackType: null,
	value: '',
} );

defineEmits( [ 'update:modelValue' ] );
</script>

<style lang="scss">
.wikit-Input {
	color: $color-base;
	background-color: $background-color-base;
	border: $border-base;
	border-radius: $border-radius-base;
	font-family: $font-family-system-sans;
	font-size: $font-size-medium;
	font-weight: $font-weight-normal;
	line-height: $line-height-xx-small;
	inline-size: $size-full;
	box-sizing: $box-sizing-base;
	padding-inline: $spacing-25 $spacing-50;
	transition-duration: $transition-duration-medium;
	transition-property: $transition-property-base;
	box-shadow: $box-shadow-inset-small $box-shadow-color-transparent;

	&:disabled {
		color: $color-disabled;
		border-color: $border-color-disabled;
		background-color: $background-color-disabled-subtle;
	}

	// should ideally be taken care of by the globally applied style reset (ress)
	// https://github.com/filipelinhares/ress/pull/24
	&:focus {
		outline: none;
	}

	&::placeholder {
		color: $color-placeholder;
		opacity: $opacity-base;
	}

	&:not(&--error, &--warning) {
		&:not(:disabled) {
			&:hover {
				border-color: $border-color-input--hover;
			}

			&:focus,
			&:active {
				border-color: $border-color-progressive--focus;
				box-shadow: $box-shadow-inset-small $box-shadow-color-progressive--focus;
			}
		}
	}

	&--error {
		border-color: $border-color-error;

		&:hover {
			border-color: $border-color-error--hover;
		}

		&:focus,
		&:active {
			box-shadow: $box-shadow-inset-small $box-shadow-color-progressive--focus;
			border-color: $border-color-progressive--focus;
		}
	}
}
</style>
