<template>
	<component
		:is="dispatchComponent"
		v-bind="extraProps"
		:value="value"
		:disabled="disabled"
		:error="error"
		@input="$emit( 'input', $event )"
	/>
</template>

<script lang="ts">
import EntityValueLookup from '@/components/EntityValueLookup.vue';
import StringValueInput from '@/components/StringValueInput.vue';
import QuantityValueInput from '@/components/QuantityValueInput.vue';
import DateValueInput from '@/components/DateValueInput.vue';

import Vue from 'vue';

export default Vue.extend( {
	name: 'ValueInput',
	components: {
		StringValueInput,
		EntityValueLookup,
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
			type: [ String, Object ],
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
				case 'wikibase-lexeme':
				case 'wikibase-sense':
				case 'wikibase-form':
				case 'wikibase-property':
					// further distinguished via extraProps below
					return 'EntityValueLookup';
				case 'quantity':
					return 'QuantityValueInput';
				case 'time':
					return 'DateValueInput';
				case 'string':
				case 'external-id':
				case 'url':
				default:
					return 'StringValueInput';
			}
		},
		extraProps(): object {
			switch ( this.datatype ) {
				case 'wikibase-item':
					return { entityType: 'item' };
				case 'wikibase-lexeme':
					return { entityType: 'lexeme' };
				case 'wikibase-sense':
					return { entityType: 'sense' };
				case 'wikibase-form':
					return { entityType: 'form' };
				case 'wikibase-property':
					return { entityType: 'property' };
				default:
					return {};
			}
		},
	},
} );
</script>
