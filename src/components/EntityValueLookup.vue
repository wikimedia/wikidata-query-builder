<template>
	<EntityLookup
		:value="value"
		:error="error"
		:search-for-menu-items="searchForMenuItems"
		:label="$i18n( 'query-builder-input-value-label' )"
		:tooltip="$i18n( 'query-builder-input-value-tooltip' )"
		:placeholder="$i18n( 'query-builder-input-value-placeholder' )"
		:no-match-found-message="$i18n( noMatchFoundMessageKey )"
		:disabled="disabled"
		@input="$emit( 'input', $event )"
	/>
</template>

<script lang="ts">
import EntityLookup from '@/components/EntityLookup.vue';
import SearchOptions from '@/data-access/SearchOptions';
import SearchResult from '@/data-access/SearchResult';
import { MenuItem } from '@wmde/wikit-vue-components/dist/components/MenuItem';
import Vue, { PropType } from 'vue';

const supportedEntityTypes = {
	item: [ 'searchItemValues', 'query-builder-item-value-lookup-no-match-found' ],
	lexeme: [ 'searchLexemeValues', 'query-builder-lexeme-value-lookup-no-match-found' ],
};

export default Vue.extend( {
	name: 'EntityValueLookup',
	components: {
		EntityLookup,
	},
	props: {
		entityType: {
			type: String as PropType<keyof typeof supportedEntityTypes>,
			default: 'item',
			validator: type => type in supportedEntityTypes,
		},
		value: {
			type: Object as PropType<MenuItem>,
			default: null,
		},
		error: {
			type: Object,
			default: null,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		storeAction(): string {
			return supportedEntityTypes[ this.entityType ][ 0 ];
		},
		noMatchFoundMessageKey(): string {
			return supportedEntityTypes[ this.entityType ][ 1 ];
		},
	},
	methods: {
		searchForMenuItems( options: SearchOptions ): Promise<SearchResult[]> {
			return this.$store.dispatch( this.storeAction, options );
		},
	},
} );
</script>
