<template>
	<CdxField
		:status="error ? error.type : null"
		:messages="error ? { [error.type]: $i18n( error.message ) } : {}"
	>
		<template #label>
			{{ label }}
			<InfoTooltip
				v-if="tooltip"
				position="end"
				:message="tooltip"
			/>
		</template>
		<CdxLookup
			v-model:selected="selectedValue"
			v-model:input-value="search"
			:menu-items="searchResults"
			:menu-config="menuConfig"
			:disabled="disabled"
			:status="error ? error.type : null"
			:placeholder="placeholder"
			@update:selected="onSelect( $event )"
			@input="onInput"
			@load-more="handleScroll"
		>
			<template
				#no-results
			>
				{{ noMatchFoundMessage }}
			</template>
		</CdxLookup>
	</CdxField>
</template>

<script setup lang="ts">
import InfoTooltip from '@/components/InfoTooltip.vue';
import SearchOptions from '@/data-access/SearchOptions';
import SearchResult from '@/data-access/SearchResult';
import { CdxField, CdxLookup, MenuItemData, MenuItemDataWithId, MenuItemValue } from '@wikimedia/codex';

import debounce from 'lodash/debounce';
import { Ref, ref, watch, onMounted } from 'vue';

import { useI18n } from 'vue-banana-i18n';
const messages = useI18n();

const NUMBER_OF_SEARCH_RESULTS = 12;

interface Props {
	modelValue?: MenuItemDataWithId | null;
	error?: object | null;
	disabled?: boolean;
	label: string;
	noMatchFoundMessage: string;
	placeholder?: string;
	tooltip?: string;
	searchForMenuItems: ( searchOptions: SearchOptions ) => Promise<( MenuItemData & SearchResult )[]>;
}

const props = withDefaults( defineProps<Props>(), {
	modelValue: null,
	error: null,
	disabled: false,
	placeholder: '',
	tooltip: '',
} );

const selectedValue = ref( props.modelValue?.value ?? null );
const menuConfig = {
	boldLabel: true,
};

const emit = defineEmits( [ 'update:modelValue' ] );

const search = ref( '' );
const searchResults: Ref<( MenuItemData & SearchResult )[]> = ref( [] );
const topItemIndex = ref( 1 );

let debouncedUpdateMenuItems = null as ( ( arg0: SearchOptions ) => void ) | null;

async function handleScroll( event: number ): Promise<void> {
	if ( topItemIndex.value <= event ) {
		topItemIndex.value += NUMBER_OF_SEARCH_RESULTS;

		const searchOptions: SearchOptions = {
			search: search.value,
			offset: topItemIndex.value,
			limit: NUMBER_OF_SEARCH_RESULTS,
		};

		searchResults.value = searchResults.value.concat(
			await searchEntities( searchOptions ),
		);
	}
}

async function searchEntities( searchOptions: SearchOptions ): Promise<( MenuItemData & SearchResult )[]> {
	const searchResult = await props.searchForMenuItems( searchOptions );
	return searchResult.map(
		( item: MenuItemData & SearchResult ) => {
			item.supportingText = item.supportingText && messages.i18n( item.supportingText );
			if ( item.supportingText ) {
				item.supportingText = `(${item.supportingText})`;
			}
			item.value = item.id;
			delete item.match;
			delete item.url;
			return item;
		},
	);
}

function updateMenuItems( searchOptions: SearchOptions ): void {
	if ( debouncedUpdateMenuItems === null ) {
		debouncedUpdateMenuItems = debounce(
			async ( debouncedSearchOptions: SearchOptions ) => {
				searchResults.value = ( await props.searchForMenuItems( debouncedSearchOptions ) ).map(
					( item: MenuItemData & SearchResult ) => {
						item.value = item.id;
						delete item.match;
						delete item.url;
						return item;
					},
				);
			},
			150,
		);
	}
	debouncedUpdateMenuItems( searchOptions );
}

function onInput( newSearchString: string ): void {
	search.value = newSearchString;
	topItemIndex.value = 0;
	if ( !newSearchString ) {
		searchResults.value = [];
		return;
	}

	const searchOptions: SearchOptions = {
		search: newSearchString,
		limit: NUMBER_OF_SEARCH_RESULTS,
	};
	updateMenuItems( searchOptions );
}

function onSelect( newSelectedValue: MenuItemValue ): void {
	selectedValue.value = newSelectedValue;
	if ( newSelectedValue ) {
		const selectedElement: ( MenuItemData & SearchResult ) | null =
		searchResults.value.filter( s => s.value === newSelectedValue )[ 0 ];
		emit( 'update:modelValue', selectedElement );
	} else {
		emit( 'update:modelValue', null );
	}
}

watch( () => props.disabled, ( isDisabled: boolean ) => {
	if ( isDisabled ) {
		search.value = '';
	}
} );

watch( () => props.modelValue, ( newValue: MenuItemDataWithId | null ) => {
	if ( newValue && newValue.id === props.modelValue?.id ) {
		search.value = newValue.label ?? newValue.description ?? ( newValue.value as string );
		onInput( search.value );
	}
} );

onMounted( () => {
	if ( props.modelValue && props.modelValue.label && !search.value ) {
		search.value = props.modelValue.label;
	}
} );
</script>
