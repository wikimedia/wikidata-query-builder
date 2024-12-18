<template>
	<div class="wikit wikit-ValidationMessage" :class="[ `wikit-ValidationMessage--${type}` ]">
		<Icon
			class="wikit-ValidationMessage__icon"
			:type="type === 'error' ? 'error' : 'alert'"
			:color="type"
			size="medium"
		/>
		{{ message }}
	</div>
</template>

<script lang="ts" setup>
import Icon from './WikitIcon.vue';

interface Props {
	message: string;
	type: 'warning' | 'error';
}

defineProps<Props>();

</script>

<style lang="scss">
.wikit-ValidationMessage {
	font-family: $font-family-system-sans;
	font-size: $font-size-medium;
	font-weight: $font-weight-bold;
	line-height: $line-height-medium;
	padding-block-start: $spacing-50;
	display: inline-flex;
	align-items: flex-start;

	&--error {
		color: $color-error;
	}

	&--warning {
		color: $color-base;
	}

	&__icon {
		// TODO: only introducing the following variable to work around exceeding stylelint max-len.
		// `stylelint-disable` is also not working for some reason. Fixing this in a follow-up.
		$padding-top: math.div(( $line-height-medium - $font-size-medium ), 2);

		padding-block-start: $padding-top;
		margin-inline-end: $spacing-50;
	}
}
</style>
