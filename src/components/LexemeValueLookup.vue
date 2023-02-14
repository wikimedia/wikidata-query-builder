<template>
	<EntityLookup
		:value="value"
		:error="error"
		:search-for-menu-items="searchForLexemes"
		:label="$i18n( 'query-builder-input-value-label' )"
		:tooltip="$i18n( 'query-builder-input-value-tooltip' )"
		:placeholder="$i18n( 'query-builder-input-value-placeholder' )"
		:no-match-found-message="$i18n( 'query-builder-lexeme-value-lookup-no-match-found' )"
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

export default Vue.extend( {
	name: 'LexemeValueLookup',
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
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	methods: {
		searchForLexemes( options: SearchOptions ): Promise<SearchResult[]> {
			return this.$store.dispatch( 'searchLexemeValues', options );
		},
	},
} );
</script>
