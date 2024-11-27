<template>
	<div
		class="wikit wikit-LookupInput"
		@keydown="triggerKeyDown"
	>
		<WikitInput
			:value="searchInput"
			:feedback-type="feedbackType"
			:placeholder="placeholder"
			:disabled="disabled"
			autocomplete="off"
			:aria-activedescendant="keyboardHoverId"
			:aria-controls="optionsMenuId"
			:aria-owns="optionsMenuId"
			aria-autocomplete="list"
			aria-haspopup="listbox"
			:aria-expanded="showMenu || 'false'"
			:aria-required="ariaRequired ? 'true' : 'false'"
			role="combobox"
			@input="onInput"
			@focus.native="onFocus"
			@blur.native="showMenu = false"
		/>
		<WikitOptionsMenu
			v-show="showMenu"
			:id="optionsMenuId"
			ref="menu"
			class="wikit-LookupInput__menu"
			:menu-items="menuItems"
			:bold-labels="true"
			:selected-item-index="selectedItemIndex"
			:label="label"
			@select="onSelect"
			@scroll="onScroll"
			@esc="onEsc"
			@keyboard-hover-change="onKeyboardHoverChange"
		>
			<template #no-results>
				<slot name="no-results" />
			</template>
		</WikitOptionsMenu>
	</div>
</template>

<script lang="ts" setup>
import { ref, Ref, computed } from 'vue';
import isEqual from 'lodash.isequal';
import WikitOptionsMenu from './WikitOptionsMenu.vue';
import WikitInput from './WikitInput.vue';

import { generateUid } from '@/utils';

const menu = ref<InstanceType<typeof WikitOptionsMenu> | null>( null );

function triggerKeyDown( event: KeyboardEvent ): void {
	menu.value?.onKeyDown( event );
}

const showMenu: Ref<boolean> = ref( false );
const scrollIndexStart: Ref<number|null> = ref( null );
const scrollIndexEnd: Ref<number | null > = ref( null );
const keyboardHoverId: Ref< string | null> = ref( null );
const optionsMenuId: Ref<string> = ref( generateUid( 'wikit-OptionsMenu' ) );

interface Props {
	feedbackType?: null | 'warning' | 'error';
	menuItems?: unknown[];
	disabled?: boolean;
	ariaRequired?: boolean;
	placeholder?: string;
	value?: null | object;
	searchInput?: string;
	label?: string;
}

type MenuItem = {
	label: string;
	description: string;
	tag?: string; // for internal use
};

const props = withDefaults( defineProps<Props>(), {
	feedbackType: null,
	menuItems: () => [],
	disabled: false,
	ariaRequired: false,
	placeholder: '',
	value: null,
	searchInput: '',
	label: '',
} );

const emit = defineEmits( [ 'update:searchInput', 'input', 'scroll' ] );

function canShowMenu( currentSearchInput: string ): boolean {
	return currentSearchInput.length > 0;
}

function onInput( value: string ): void {
	showMenu.value = canShowMenu( value );

	// the following comment generates the event's description for the docs tab in storybook
	/**
	 * Enables the `searchInput` prop to be used with the `.sync` modifier. It's used to transport the value of
	 * the Lookup component's inner `<input>` element to the parent component.
	 */
	emit( 'update:searchInput', value );
	emit( 'input', null );
}

function onSelect( menuItem: MenuItem ): void {
	showMenu.value = false;

	// the following comment generates the event's description for the docs tab in storybook
	/**
	 * This event is emitted whenever an item is selected on the Lookup. The event payload contains the whole
	 * MenuItem object. The payload is null when no item is selected or the item is deselected.
	 */
	emit( 'input', menuItem );
	emit( 'update:searchInput', menuItem.label );
}

function onFocus(): void {
	if ( canShowMenu( props.searchInput ) ) {
		showMenu.value = true;
	}
}

function onEsc(): void {
	showMenu.value = false;
	keyboardHoverId.value = null;
}

function onScroll( firstIndex: number, lastIndex: number ): void {
	if ( firstIndex !== scrollIndexStart.value || lastIndex !== scrollIndexEnd.value ) {
		/**
		 * This event is emitted whenever the first or last index of the
		 * visible menuItems changes. If the user scrolls but the indexes remain
		 * unchanged the event won't fire.
		 *
		 */
		emit( 'scroll', firstIndex, lastIndex );
		scrollIndexStart.value = firstIndex;
		scrollIndexEnd.value = lastIndex;
	}
}

function onKeyboardHoverChange( menuItemId: string ): void {
	keyboardHoverId.value = menuItemId;
}

const selectedItemIndex = computed<number>( () => {
	if ( props.value === null || props.menuItems.length === 0 ) {
		return -1;
	}
	return props.menuItems.findIndex(
		( menuItem ) => {
			return isEqual( menuItem, props.value );
		},
		this,
	);
} );

</script>

<style lang="scss">
.wikit-LookupInput {
	position: relative;

	&__menu {
		position: absolute;
	}
}
</style>
