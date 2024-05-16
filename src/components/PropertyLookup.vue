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
import { MenuItem } from '@wmde/wikit-vue-components/dist/components/MenuItem';
import { PropType } from 'vue';
import { defineComponent } from 'vue';
import { useStore } from '@/store/index';

export default defineComponent( {
	compatConfig: {
		MODE: 3,
	},
	name: 'PropertyLookup',
	components: {
		EntityLookup,
	},
	props: {
		modelValue: {
			type: Object as PropType<MenuItem>,
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
				( item: MenuItem & SearchResult ) => {
					if ( item.tag ) {
						item.tag = this.$i18n( item.tag );
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
