<template>
	<div
		class="wikit wikit-bouncingdots wikit-bouncingdots"
		:class="[ `wikit-bouncingdots--${size}` ]"
	>
		<div class="bounce" />
	</div>
</template>

<script lang="ts" setup>
interface Props {
	size?: 'small' | 'medium';
}

withDefaults( defineProps<Props>(), {
	size: 'small',
} );

</script>

<style lang="scss">
.wikit-bouncingdots {
	white-space: nowrap;

	.bounce,
	&::before,
	&::after {
		content: '';
		display: inline-block;
		background-color: $color-placeholder;
		border-radius: $border-radius-circle;
		animation: bounce-delay $animation-duration-medium infinite ease-in-out both;
		animation-delay: $animation-delay-medium;
	}

	&::before {
		margin-inline-end: $spacing-25;
		animation-delay: $animation-delay-slow;
	}

	&::after {
		margin-inline-start: $spacing-25;
		animation-delay: $animation-delay-none;
	}

	&--small .bounce,
	&--small::before,
	&--small::after {
		inline-size: $size-75;
		block-size: $size-75;
	}

	&--medium .bounce,
	&--medium::before,
	&--medium::after {
		inline-size: $size-100;
		block-size: $size-100;
	}
}

@keyframes bounce-delay {
	0%,
	50%,
	100% {
		transform: scale(0.625);
	}

	20% {
		opacity: 0.87;
		transform: scale(1);
	}
}
</style>
