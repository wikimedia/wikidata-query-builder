<template>
	<component
		:is="dispatchComponent"
		:value="value"
		@input="$emit('input', $event)"
		:disabled="disabled"
		:error="error"
	/>
</template>

<script lang="ts">
import ItemValueLookup from '@/components/ItemValueLookup.vue';
import StringValueInput from '@/components/StringValueInput.vue';
import Vue from 'vue';

export default Vue.extend( {
	name: 'ValueInput',
	components: {
		StringValueInput,
		ItemValueLookup,
	},
	computed: {
		dispatchComponent(): string {
			switch ( this.datatype ) {
				case 'wikibase-item':
					return 'ItemValueLookup';
				case 'string':
				case 'external-id':
				default:
					return 'StringValueInput';
			}
		},
	},
	props: {
		datatype: {
			required: true,
		},
		value: {
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
} );
</script>