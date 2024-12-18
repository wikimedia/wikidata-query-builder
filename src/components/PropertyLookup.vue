<template>
	<EntityLookup
		:model-value="modelValue"
		:error="error"
		:search-for-menu-items="searchForProperties"
		:tooltip="$i18n( 'query-builder-property-lookup-tooltip' )"
		:label="$i18n( 'query-builder-property-lookup-label' )"
		:placeholder="$i18n( 'query-builder-property-lookup-placeholder' )"
		:no-match-found-message="$i18n( 'query-builder-property-lookup-no-match-found' )"
		@update:model-value="$emit( 'update:modelValue', $event )"
	/>
</template>

<script lang="ts">
import EntityLookup from '@/components/EntityLookup.vue';
import SearchOptions from '@/data-access/SearchOptions';
import SearchResult from '@/data-access/SearchResult';
import { MenuItemData } from '@wikimedia/codex';
import { PropType } from 'vue';
import { defineComponent } from 'vue';
import { useStore } from '@/store/index';

export default defineComponent( {
	name: 'PropertyLookup',
	components: {
		EntityLookup,
	},
	props: {
		modelValue: {
			type: Object as PropType<MenuItemData>,
			default: null,
		},
		error: {
			type: Object,
			default: null,
		},
	},
	emits: [ 'update:modelValue' ],
	methods: {
		setTagForSearchResults( searchResults: SearchResult[] ): SearchResult[] {
			return searchResults.map(
				( item: MenuItemData & SearchResult ) => {
					if ( item.supportingText ) {
						item.supportingText = this.$i18n( item.supportingText );
						if ( item.supportingText ) {
							item.supportingText = `(${item.supportingText})`;
						}
					}
					return item;
				},
			);
		},
		async searchForProperties( options: SearchOptions ): Promise<SearchResult[]> {
			const store = useStore();
			return this.setTagForSearchResults(
				await store.searchProperties( options ),
			);
		},
	},
} );
</script>
