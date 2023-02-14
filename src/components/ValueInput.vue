<template>
	<component
		:is="dispatchComponent"
		:value="value"
		:disabled="disabled"
		:error="error"
		@input="$emit( 'input', $event )"
	/>
</template>

<script lang="ts">
import ItemValueLookup from '@/components/ItemValueLookup.vue';
import LexemeValueLookup from '@/components/LexemeValueLookup.vue';
import StringValueInput from '@/components/StringValueInput.vue';
import QuantityValueInput from '@/components/QuantityValueInput.vue';
import DateValueInput from '@/components/DateValueInput.vue';

import Vue from 'vue';

export default Vue.extend( {
	name: 'ValueInput',
	components: {
		StringValueInput,
		ItemValueLookup,
		LexemeValueLookup,
		QuantityValueInput,
		DateValueInput,
	},
	props: {
		datatype: {
			required: true,
			default: null,
			validator: prop => typeof prop === 'string' || prop === null,
		},
		value: {
			default: null,
			type: String,
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
		dispatchComponent(): string {
			switch ( this.datatype ) {
				case 'wikibase-item':
					return 'ItemValueLookup';
				case 'wikibase-lexeme':
					return 'LexemeValueLookup';
				case 'quantity':
					return 'QuantityValueInput';
				case 'time':
					return 'DateValueInput';
				case 'string':
				case 'external-id':
				default:
					return 'StringValueInput';
			}
		},
	},
} );
</script>
