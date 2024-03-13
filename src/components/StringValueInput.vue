<template>
	<TextInput
		:label="$i18n( 'query-builder-input-value-label' )"
		:value="modelValue"
		:error="error ? { message: $i18n( error.message ), type: error.type } : null"
		:placeholder="$i18n( 'query-builder-input-value-placeholder' )"
		:disabled="disabled"
		@update:model-value="$emit( 'update:modelValue', $event )"
	>
		<template #suffix>
			<InfoTooltip
				position="end"
				:message="$i18n( 'query-builder-input-value-tooltip' )"
			/>
		</template>
	</TextInput>
</template>

<script lang="ts">

import { TextInput } from '@wmde/wikit-vue-components';
import { defineComponent } from '@/compat';
import InfoTooltip from '@/components/InfoTooltip.vue';

export default defineComponent( {
	name: 'StringValueInput',
	components: {
		TextInput,
		InfoTooltip,
	},
	props: {
		modelValue: {
			type: String,
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
} );
</script>
