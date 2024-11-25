<template>
	<div
		ref="lookupMenuRef"
		class="wikit wikit-OptionsMenu"
		role="listbox"
		:style="{ maxHeight: maxHeight ? maxHeight + 'px' : null }"
		:aria-label="label"
		@scroll.passive="onScroll">
		<div
			v-for="( menuItem, index ) in menuItems"
			:id="`${menuItemId}-${index}`"
			:key="index"
			ref="menuItemsRef"
			class="wikit-OptionsMenu__item"
			:class="{
				'wikit-OptionsMenu__item--hovered': index === keyboardHoveredItemIndex,
				'wikit-OptionsMenu__item--active': index === activeItemIndex,
				'wikit-OptionsMenu__item--selected': index === selectedItemIndex
			}"
			role="option"
			:aria-label="menuItem.label"
			:aria-describedby="`${menuItemId}__description-${index} ${menuItemId}__tag-${index}`"
			:aria-selected="index === selectedItemIndex || 'false'"
			@click="$emit( 'select', menuItem )"
			@mousedown.prevent="activeItemIndex = index"
			@mouseup="activeItemIndex = -1"
		>
			<div class="wikit-OptionsMenu__item__label-wrapper">
				<div
					class="wikit-OptionsMenu__item__label"
					:class="{
						'wikit-OptionsMenu__item__label--bold': boldLabels
					}"
				>
					{{ menuItem.label }}
				</div>
				<div
					v-if="menuItem.tag"
					:id="`${menuItemId}__tag-${index}`"
					class="wikit-OptionsMenu__item__tag">
					{{ menuItem.tag }}
				</div>
			</div>
			<div :id="`${menuItemId}__description-${index}`" class="wikit-OptionsMenu__item__description">
				{{ menuItem.description }}
			</div>
		</div>
		<div
			v-if="menuItems.length === 0"
			class="wikit-OptionsMenu__no-results"
			role="option">
			<slot name="no-results" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import debounce from 'lodash/debounce';
import { ref, Ref, onMounted, watch, nextTick } from 'vue';

interface Props {
	menuItems?: unknown[];
	boldLabels?: boolean;
	selectedItemIndex?: number;
	allowLooping?: boolean;
	label?: string;
}

const props = withDefaults( defineProps<Props>(), {
	menuItems: () => [],
	boldLabels: false,
	selectedItemIndex: -1,
	allowLooping: false,
	label: '',
} );

import { generateUid } from '@/utils';

const maxHeight: Ref<null | number> = ref( null );
const activeItemIndex: Ref<number> = ref( -1 );
const keyboardHoveredItemIndex: Ref<number> = ref( -1 );
const menuItemId: Ref<string> = ref( generateUid( 'wikit-OptionsMenu__item__id' ) );

const menuItemsRef = ref<HTMLElement[]|null>( null );
const lookupMenuRef = ref<HTMLElement|null>( null );

const emit = defineEmits( [ 'select', 'esc', 'scroll', 'keyboard-hover-change' ] );

function onKeyDown( event: KeyboardEvent ): void {
	switch ( event.key ) {
		case 'Enter':
			if ( keyboardHoveredItemIndex.value !== -1 ) {
				emit( 'select', props.menuItems[ keyboardHoveredItemIndex.value ] );
			}
			break;
		case 'Escape':
			keyboardHoveredItemIndex.value = -1;
			emit( 'esc' );
			break;
		case 'ArrowUp':
			event.preventDefault();
			if ( props.allowLooping && keyboardHoveredItemIndex.value === 0 ) {
				// loop to the bottom of the menu
				keyboardHoveredItemIndex.value = props.menuItems.length - 1;
			} else {
				keyboardHoveredItemIndex.value = Math.max( 0, keyboardHoveredItemIndex.value - 1 );
			}
			keyboardScroll();
			break;
		case 'ArrowDown':
			event.preventDefault();
			if ( props.allowLooping && keyboardHoveredItemIndex.value === props.menuItems.length - 1 ) {
				// go back to the top of the menu
				keyboardHoveredItemIndex.value = 0;
			} else {
				keyboardHoveredItemIndex.value = Math.min(
					props.menuItems.length - 1,
					keyboardHoveredItemIndex.value + 1,
				);
			}
			keyboardScroll();
			break;
		case 'Tab':
			if ( keyboardHoveredItemIndex.value !== -1 ) {
				emit( 'select', props.menuItems[ keyboardHoveredItemIndex.value ] );
			}
			break;
	}
}

defineExpose( {
	onKeyDown,
} );

function keyboardScroll(): void {
	const element = menuItemsRef.value as HTMLElement[];

	if ( keyboardHoveredItemIndex.value !== -1 ) {
		/**
		 * This setTimeout shouldn't be needed, but it is a workaround to make scrollIntoView with options
		 * work in Chrome 88, but that problem likely existed on older Chrome versions as well.
		 *
		 * TODO: With newer versions of Chrome, try removing the setTimeout and see if it works.
		 */
		setTimeout( () => {
			element[ keyboardHoveredItemIndex.value ].scrollIntoView( { behavior: 'smooth', block: 'nearest' } );
		} );
	}
}

function resizeMenu(): void {
	const menuItems = menuItemsRef.value as HTMLElement[];
	// the height automatically adjusts for up to 6 elements, then shows a scrollbar
	const maxNumberOfElementsDisplayed = 6;
	if ( menuItems && menuItems.length > maxNumberOfElementsDisplayed ) {
		const menuHeight = menuItems[ maxNumberOfElementsDisplayed ].offsetTop - menuItems[ 0 ].offsetTop;
		// See: https://phabricator.wikimedia.org/T325822#9078296
		if ( menuHeight > 0 ) {
			maxHeight.value = menuHeight;
		}
	} else {
		maxHeight.value = null;
	}
}

const onScroll = debounce( function () {
	const rootElem = lookupMenuRef.value as HTMLElement;
	const menuItems = menuItemsRef.value as HTMLElement[];
	const menuTop = rootElem.scrollTop;
	const menuBottom = menuTop + rootElem.offsetHeight;

	const visibleElems = [];
	for ( let i = 0; i < menuItems.length; i++ ) {
		const elementTop = menuItems[ i ].offsetTop;
		const elementBottom = menuItems[ i ].offsetTop + menuItems[ i ].offsetHeight;

		if ( elementTop <= menuBottom && elementBottom >= menuTop ) {
			visibleElems.push( i );
		}
	}
	emit( 'scroll',
		visibleElems[ 0 ],
		visibleElems[ visibleElems.length - 1 ] );
}, 300 );

onMounted( () => {
	resizeMenu();
} );

watch( props.menuItems, async () => {
	await nextTick();
	if ( props.selectedItemIndex > -1 ) {
		keyboardHoveredItemIndex.value = props.selectedItemIndex;
	}
	resizeMenu();
} );

watch( keyboardHoveredItemIndex, ( hoveredIndex: number ) => {
	if ( hoveredIndex > -1 ) {
		emit( 'keyboard-hover-change', `${menuItemId.value}-${hoveredIndex}` );
	} else {
		emit( 'keyboard-hover-change', null );
	}
} );

</script>

<style lang="scss">
$base: '.wikit-OptionsMenu';

#{$base} {
	min-inline-size: $size-full;

	/* Uses CSS min, Falls back on 95vw when max-width > viewport width */
	max-inline-size: #{min}($size-double, 95vw);
	inline-size: max-content;
	background-color: $background-color-base;
	border-radius: $border-radius-sharp $border-radius-sharp $border-radius-base $border-radius-base;
	border: $border-base;
	box-shadow: $box-shadow-drop-medium;
	overflow-y: auto;
	box-sizing: $box-sizing-base;
	z-index: $z-index-dropdown;

	&__item {
		position: relative;
		padding: $spacing-50 $spacing-75;
		transition-property: $transition-property-base;
		transition-duration: $transition-duration-base;

		&:hover,
		&--hovered {
			background-color: $background-color-interactive;
			cursor: $cursor-base--hover;
		}

		&--active,
		&--active:hover,
		&:active {
			background-color: $background-color-progressive-subtle;

			#{$base}__item__label, #{$base}__item__description {
				color: $color-progressive;
			}
		}

		&--selected {
			#{$base}__item__label, #{$base}__item__description {
				color: $color-base;
			}
		}

		&--selected,
		&--selected:hover,
		&--selected#{$base}__item--hovered, {
			background-color: $background-color-progressive-subtle;
		}

		&--selected:hover,
		&--selected#{$base}__item--hovered, {
			#{$base}__item__label, #{$base}__item__description {
				color: $color-progressive;
			}
		}

		&__label {
			font-family: $font-family-system-sans;
			font-size: $font-size-medium;
			font-weight: $font-weight-normal;
			color: $color-base;
			line-height: $line-height-xx-small;

			&--bold {
				font-weight: $font-weight-bold;
			}

			&-wrapper {
				display: flex;
			}
		}

		&__description {
			font-family: $font-family-system-sans;
			font-size: $font-size-medium;
			font-weight: $font-weight-normal;
			color: $color-subtle;
			line-height: $line-height-xx-small;
		}

		&__tag {
			font-family: $font-family-system-sans;
			font-size: $font-size-medium;
			font-weight: $font-weight-normal;
			color: $color-subtle;
			line-height: $line-height-xx-small;
			padding-inline-start: $spacing-25;
			display: inline;
			white-space: nowrap;
		}
	}

	&__no-results {
		font-family: $font-family-system-sans;
		font-size: $font-size-medium;
		font-weight: $font-weight-normal;
		color: $color-base;
		line-height: $line-height-medium;
		padding: $spacing-50 $spacing-75;
	}
}
</style>
