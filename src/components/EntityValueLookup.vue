<template>
	<EntityLookup
		:model-value="modelValue"
		:error="error"
		:search-for-menu-items="searchForMenuItems"
		:label="$i18n( 'query-builder-input-value-label' )"
		:tooltip="$i18n( 'query-builder-input-value-tooltip' )"
		:placeholder="$i18n( 'query-builder-input-value-placeholder' )"
		:no-match-found-message="$i18n( noMatchFoundMessageKey )"
		:disabled="disabled"
		@update:model-value="$emit( 'update:modelValue', $event )"
	/>
</template>

<script lang="ts">
import EntityLookup from '@/components/EntityLookup.vue';
import SearchOptions from '@/data-access/SearchOptions';
import SearchResult from '@/data-access/SearchResult';
import { MenuItem } from '@wmde/wikit-vue-components/dist/components/MenuItem';
import { PropType } from 'vue';
import { defineComponent } from '@/compat';
import { useStore } from '@/store';

const supportedEntityTypes = {
	item: [ 'searchItemValues', 'query-builder-item-value-lookup-no-match-found' ],
	lexeme: [ 'searchLexemeValues', 'query-builder-lexeme-value-lookup-no-match-found' ],
	sense: [ 'searchSenseValues', 'query-builder-sense-value-lookup-no-match-found' ],
	form: [ 'searchFormValues', 'query-builder-form-value-lookup-no-match-found' ],
	property: [ 'searchProperties', 'query-builder-property-lookup-no-match-found' ],
};

export default defineComponent( {
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
		modelValue: {
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
	emits: [ 'update:modelValue' ],
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
			const store = useStore();
			return store[ this.storeAction ]( options );
		},
	},
} );
</script>
