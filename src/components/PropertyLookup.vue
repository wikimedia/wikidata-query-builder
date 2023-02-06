<template>
	<EntityLookup
		:value="value"
		:error="error"
		:search-for-menu-items="searchForProperties"
		:tooltip="$i18n( 'query-builder-property-lookup-tooltip' )"
		:label="$i18n( 'query-builder-property-lookup-label' )"
		:placeholder="$i18n( 'query-builder-property-lookup-placeholder' )"
		:no-match-found-message="$i18n( 'query-builder-property-lookup-no-match-found' )"
		@input="$emit( 'input', $event )"
	/>
</template>

<script lang="ts">
import EntityLookup from '@/components/EntityLookup.vue';
import SearchOptions from '@/data-access/SearchOptions';
import SearchResult from '@/data-access/SearchResult';
import { MenuItem } from '@wmde/wikit-vue-components/dist/components/MenuItem';
import Vue, { PropType } from 'vue';

export default Vue.extend( {
	name: 'PropertyLookup',
	components: {
		EntityLookup,
	},
	props: {
		value: {
			type: Object as PropType<MenuItem>,
			default: null,
		},
		error: {
			type: Object,
			default: null,
		},
	},
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
			return this.setTagForSearchResults(
				await this.$store.dispatch( 'searchProperties', options ),
			);
		},
	},
} );
</script>
