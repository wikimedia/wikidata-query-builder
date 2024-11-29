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
		background-color: $wikit-BouncingDots-background-color;
		border-radius: $wikit-BouncingDots-border-radius;
		animation: bounce-delay $wikit-BouncingDots-animation-duration infinite ease-in-out both;
		animation-delay: $wikit-BouncingDots-animation-delay-default;
	}

	&::before {
		margin-inline-end: $wikit-BouncingDots-margin-right;
		animation-delay: $wikit-BouncingDots-animation-delay-before;
	}

	&::after {
		margin-inline-start: $wikit-BouncingDots-margin-left;
		animation-delay: $wikit-BouncingDots-animation-delay-after;
	}

	&--small .bounce,
	&--small::before,
	&--small::after {
		inline-size: $wikit-BouncingDots-width-small;
		block-size: $wikit-BouncingDots-width-small;
	}

	&--medium .bounce,
	&--medium::before,
	&--medium::after {
		inline-size: $wikit-BouncingDots-width-medium;
		block-size: $wikit-BouncingDots-width-medium;
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
