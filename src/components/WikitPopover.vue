<template>
	<div
		v-detect-click-outside="hideContent"
		class="wikit wikit-Popover"
		:class="[ `wikit-Popover--${adjustedPosition || position}`, { 'wikit-Popover--flush-edges': flushEdges } ]"
		@mouseenter="startHover"
		@mouseleave="endHover"
		@keydown="triggerKeyDown"
	>
		<span class="wikit-Popover__target" @click="onTargetClick">
			<!-- @slot Target should always be a button, as we will listen to its click and hover events -->
			<slot name="target" />
		</span>
		<div
			v-if="isContentShown"
			ref="wrapper"
			class="wikit-Popover__content-wrapper">
			<div class="wikit-Popover__pointer" />
			<div class="wikit-Popover__content">
				<!-- @slot The content of the Popover goes into the default slot. -->
				<slot />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { DirectiveBinding, Ref, ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';

let handleOutsideClick: ( event: MouseEvent | TouchEvent ) => void;
const vDetectClickOutside = {
	beforeMount( element: HTMLElement, binding: DirectiveBinding ): void {
		handleOutsideClick = ( event: MouseEvent | TouchEvent ): void => {
			const callback = binding.value;
			if ( !element.contains( event.target as Node ) ) {
				callback();
			}
		};

		document.addEventListener( 'click', handleOutsideClick );
		document.addEventListener( 'touchstart', handleOutsideClick );
	},
	unmounted(): void {
		document.removeEventListener( 'click', handleOutsideClick );
		document.removeEventListener( 'touchstart', handleOutsideClick );
	},
};

enum PopoverPositions {
	TOPSTART = 'top-start',
	TOP = 'top',
	TOPEND = 'top-end',
	ENDTOP = 'end-top',
	END = 'end',
	ENDBOTTOM = 'end-bottom',
	BOTTOMEND = 'bottom-end',
	BOTTOM = 'bottom',
	BOTTOMSTART = 'bottom-start',
	STARTBOTTOM = 'start-bottom',
	START = 'start',
	STARTTOP = 'start-top',
}

const HOVER_SHOW_HIDE_DELAY_IN_MS = 100;

const isContentShown: Ref<boolean> = ref( false );
const adjustedPosition: Ref<string | null> = ref( null as string | null );
const flushEdges: Ref<boolean> = ref( false );
const showContentTimeoutID: Ref<number | null> = ref( null as number | null );
const hideContentTimeoutID: Ref<number | null> = ref( null as number | null );
const windowResizeEventHandler: Ref<( () => void ) | null> = ref( null as ( () => void ) | null );
const wrapper: Ref<InstanceType<typeof HTMLElement> | null> = ref( null );

interface Props {
	isShown?: boolean;
	reactToHover?: boolean;
	position?:
	'top-start' | 'top' | 'top-end'
	| 'end-top' | 'end' | 'end-bottom'
	| 'bottom-end' | 'bottom' | 'bottom-start'
	| 'start-bottom' | 'start' | 'start-top';
	forcePosition?: boolean;
}

const props = withDefaults( defineProps<Props>(), {
	isShown: false,
	position: 'top',
	forcePosition: false,
} );

const emit = defineEmits( [ 'update:isShown' ] );

function changeContentVisibility( isVisible: boolean ): void {
	if ( isVisible === isContentShown.value ) {
		return;
	}
	isContentShown.value = isVisible;
	/**
	 * This can optionally be used with the `.sync` modifier on the `isShown` prop
	 */
	emit( 'update:isShown', isVisible );

	avoidOverflow();
}

function hideContent(): void {
	changeContentVisibility( false );
}

function onTargetClick(): void {
	changeContentVisibility( true );
}

function startHover(): void {
	if ( !props.reactToHover ) {
		return;
	}
	if ( isContentShown.value && hideContentTimeoutID.value !== null ) {
		clearTimeout( hideContentTimeoutID.value );
		hideContentTimeoutID.value = null;
		return;
	}
	showContentTimeoutID.value = setTimeout(
		changeContentVisibility,
		HOVER_SHOW_HIDE_DELAY_IN_MS,
		true,
	);
}

function endHover(): void {
	if ( !props.reactToHover ) {
		return;
	}
	if ( !isContentShown.value && showContentTimeoutID.value !== null ) {
		clearTimeout( showContentTimeoutID.value );
		showContentTimeoutID.value = null;
		return;
	}

	hideContentTimeoutID.value = setTimeout(
		changeContentVisibility,
		HOVER_SHOW_HIDE_DELAY_IN_MS,
		false,
	);
}

function triggerKeyDown( event: KeyboardEvent ): void {
	switch ( event.key ) {
		case 'Enter':
			if ( isContentShown.value ) {
				event.preventDefault();
				hideContent();
			}
			break;
		case ' ':
			if ( isContentShown.value ) {
				event.preventDefault();
				hideContent();
			}
			break;
		case 'Escape':
			event.preventDefault();
			hideContent();
			break;
		case 'Tab':
			hideContent();
			break;
	}
}

function getOverflow(): number {
	if ( !wrapper.value ) {
		return 0;
	}
	const wrapperRect = wrapper.value.getBoundingClientRect();
	const viewportWidth = document.documentElement.clientWidth;
	let overflow = 0;
	if ( wrapperRect.left < 0 ) {
		overflow += -wrapperRect.left;
	}
	if ( wrapperRect.right > viewportWidth ) {
		overflow += wrapperRect.right - viewportWidth;
	}
	return overflow;
}

async function avoidOverflowBySwappingAxes(): Promise<void> {
	if ( !getOverflow() ) {
		return;
	}

	const swappedPositions: Partial<Record<string, string>> = {
		[ PopoverPositions.START ]: PopoverPositions.TOPSTART,
		[ PopoverPositions.STARTTOP ]: PopoverPositions.TOPSTART,
		[ PopoverPositions.STARTBOTTOM ]: PopoverPositions.BOTTOMSTART,
		[ PopoverPositions.END ]: PopoverPositions.TOPEND,
		[ PopoverPositions.ENDTOP ]: PopoverPositions.TOPEND,
		[ PopoverPositions.ENDBOTTOM ]: PopoverPositions.BOTTOMEND,
	};
	adjustedPosition.value = swappedPositions[ props.position ] || null;

	await nextTick();
}

async function avoidOverflowByAdjustingHorizontalSubposition(): Promise<void> {
	const initialOverflow = getOverflow();
	if ( !initialOverflow ) {
		return;
	}

	let lowestOverflow = initialOverflow;
	let bestAdjustedPosition = adjustedPosition.value;
	const otherPositions: Partial<Record<string, string[]>> = {
		[ PopoverPositions.TOPSTART ]: [ PopoverPositions.TOP, PopoverPositions.TOPEND ],
		[ PopoverPositions.TOP ]: [ PopoverPositions.TOPSTART, PopoverPositions.TOPEND ],
		[ PopoverPositions.TOPEND ]: [ PopoverPositions.TOP, PopoverPositions.TOPSTART ],
		[ PopoverPositions.BOTTOMSTART ]: [ PopoverPositions.BOTTOM, PopoverPositions.BOTTOMEND ],
		[ PopoverPositions.BOTTOM ]: [ PopoverPositions.BOTTOMSTART, PopoverPositions.BOTTOMEND ],
		[ PopoverPositions.BOTTOMEND ]: [ PopoverPositions.BOTTOM, PopoverPositions.BOTTOMSTART ],
	};
	for ( const otherPosition of otherPositions[ adjustedPosition.value || props.position ] || [] ) {
		adjustedPosition.value = otherPosition;
		await nextTick();
		const overflowAfterAdjustment = getOverflow();
		if ( overflowAfterAdjustment < lowestOverflow ) {
			lowestOverflow = overflowAfterAdjustment;
			bestAdjustedPosition = otherPosition;
		}
	}

	if ( bestAdjustedPosition !== adjustedPosition.value ) {
		adjustedPosition.value = bestAdjustedPosition;
		await nextTick();
	}
}

async function avoidOverflowByMakingEdgesFlush(): Promise<void> {
	if ( !getOverflow() ) {
		return;
	}
	flushEdges.value = true;
}

async function avoidOverflowBySettingMaxWidth(): Promise<void> {
	if ( !getOverflow() ) {
		return;
	}
	const wrapperRect = wrapper.value.getBoundingClientRect();
	const dir = getComputedStyle( wrapper.value ).direction;
	if ( dir === 'ltr' ) {
		wrapper.value.style.maxWidth = `max( 256px, 95vw - max( 5vw, ${wrapperRect.left}px ) )`;
	} else {
		wrapper.value.style.maxWidth = `max( 256px, max( 95vw, ${wrapperRect.right}px ) - 5vw )`;
	}
}

async function avoidOverflow(): Promise<void> {
	if ( !isContentShown.value ) {
		return;
	}
	adjustedPosition.value = null;
	flushEdges.value = false;

	await nextTick();
	delete wrapper.value.style.maxWidth;

	if ( !props.forcePosition ) {
		await avoidOverflowBySwappingAxes();
		await avoidOverflowByAdjustingHorizontalSubposition();
	}
	await avoidOverflowByMakingEdgesFlush();
	await avoidOverflowBySettingMaxWidth();
	if ( !props.forcePosition ) {
		await avoidOverflowByAdjustingHorizontalSubposition();
		await avoidOverflowBySettingMaxWidth();
	}
}

onMounted( () => {
	isContentShown.value = props.isShown;
	avoidOverflow();
	windowResizeEventHandler.value = avoidOverflow.bind( this );
	window.addEventListener( 'resize', windowResizeEventHandler.value );
} );

onBeforeUnmount( () => {
	if ( windowResizeEventHandler.value ) {
		window.removeEventListener( 'resize', windowResizeEventHandler.value );
	}
} );

watch( () => props.isShown, ( newShowProp: boolean ): void => {
	isContentShown.value = newShowProp;
	avoidOverflow();
} );
watch( () => props.position, avoidOverflow );
watch( () => props.forcePosition, avoidOverflow );

</script>

<style lang="scss">
$base: '.wikit-Popover';
$pointer-edge-length: math.hypot($size-100 / 2, $size-50);

#{$base} {
	display: inline-block;
	position: relative;

	&__tartget {
		display: inline-block;
	}

	&__content-wrapper {
		border: $border-base;
		border-radius: $border-radius-base;
		inline-size: max-content;
		position: absolute;
		display: block;
		box-shadow: $box-shadow-drop-medium;
		background-color: $background-color-base;
		max-inline-size: $size-2400;
	}

	&__content {
		padding-inline: $spacing-75;
		padding-block: $spacing-75;
		line-height: $line-height-small;
		font-family: $font-family-system-sans;
		font-size: $font-size-small;
		font-weight: $font-weight-normal;
		color: $color-base;
	}

	[L362] &__pointer::before {
		content: '';
		position: absolute;
		inline-size: $pointer-edge-length;
		block-size: $pointer-edge-length;
		transform: rotate(45deg);
		transform-origin: center;
		border: $border-base;
		background-color: $background-color-base;
		box-sizing: border-box;
	}

	@mixin bottom {
		#{$base}__content-wrapper {
			inset-block-start: 100%;
			margin-block-start: $spacing-25 + $spacing-50;
		}

		#{$base}__pointer {
			inset-block-start: -$spacing-50;
		}

		#{$base}__pointer::before {
			inset-block-end: calc(-1 * #{$pointer-edge-length} / 2);
		}
	}

	@mixin top {
		#{$base}__content-wrapper {
			inset-block-end: 100%;
			margin-block-end: $spacing-25 + $spacing-50;
		}

		#{$base}__pointer {
			inline-size: $size-100;
			block-size: $size-50;
			inset-block-start: 100%;
		}

		#{$base}__pointer::before {
			inset-block-start: calc(-1 * #{$pointer-edge-length} / 2);
		}
	}

	@mixin end {
		#{$base}__content-wrapper {
			margin-inline-start: $spacing-25 + $spacing-50;
			inset-inline-start: 100%;
		}

		#{$base}__pointer {
			inline-size: $size-50;
			block-size: $size-100;
			inset-inline-start: -$spacing-50;
		}

		#{$base}__pointer::before {
			inset-inline-end: calc(-1 * #{$pointer-edge-length} / 2);
		}
	}

	@mixin start {
		#{$base}__content-wrapper {
			margin-inline-end: $spacing-75;
			inset-inline-end: 100%;
		}

		#{$base}__pointer {
			inline-size: $size-100;
			block-size: $size-100;
			inset-inline-start: 100%;
		}

		#{$base}__pointer::before {
			inset-inline-start: calc(-1 * #{$pointer-edge-length} / 2);
		}
	}

	@mixin horizontal( $subposition ) {
		@if $subposition == center {
			display: inline-flex;
			justify-content: center;
		}

		#{$base}__content-wrapper {
			@if $subposition == start {
				inset-inline-end: calc(50% - #{$spacing-100} / 2 - #{$spacing-75});
			}

			@if $subposition == end {
				inset-inline-start: calc(50% - #{$spacing-100} / 2 -#{$spacing-75});
			}
		}

		&#{$base}--flush-edges #{$base}__content-wrapper {
			@if $subposition == start {
				inset-inline-end: min(50% - #{$spacing-100} / 2 -#{$spacing-75}, 0px);
			}

			@if $subposition == end {
				inset-inline-start: min(50% - #{$spacing-100} / 2 -#{spacing-75}, 0px);
			}
		}

		#{$base}__pointer {
			inline-size: $size-100;
			block-size: $size-50;

			@if $subposition == center {
				inset-inline-start: calc(50% - #{$spacing-100} / 2);
			}

			@if $subposition == end {
				inset-inline-start: $spacing-75;
			}

			@if $subposition == start {
				inset-inline-end: $spacing-75;
			}
		}
	}

	@mixin vertical( $subposition ) {
		#{$base}__content-wrapper {
			@if $subposition == center {
				transform: translateY(-50%);
				inset-block-start: 50%;
			}

			@if $subposition == top {
				inset-block-end: calc(50% - #{$spacing-100} / 2 -#{$spacing-50});
			}

			@if $subposition == bottom {
				inset-block-start: calc(50% - #{$spacing-100} / 2 -#{$spacing-50});
			}
		}

		#{$base}__pointer {
			@if $subposition == center {
				transform: translate(0, -50%);
				inset-block-start: 50%;
			}

			@if $subposition == top {
				inset-block-end: 0;
				margin-block-end: $spacing-50;
			}

			@if $subposition == bottom {
				inset-block-start: $spacing-50;
			}
		}
	}

	&--bottom {
		@include bottom;
		@include horizontal(center);
	}

	&--bottom-end {
		@include bottom;
		@include horizontal(end);
	}

	&--bottom-start {
		@include bottom;
		@include horizontal(start);
	}

	&--top {
		@include top;
		@include horizontal(center);
	}

	&--top-end {
		@include top;
		@include horizontal(end);
	}

	&--top-start {
		@include top;
		@include horizontal(start);
	}

	&--end {
		@include end;
		@include vertical(center);
	}

	&--end-bottom {
		@include end;
		@include vertical(bottom);
	}

	&--end-top {
		@include end;
		@include vertical(top);
	}

	&--start {
		@include start;
		@include vertical(center);
	}

	&--start-bottom {
		@include start;
		@include vertical(bottom);
	}

	&--start-top {
		@include start;
		@include vertical(top);
	}
}
</style>
