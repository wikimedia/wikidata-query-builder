<template>
	<CdxField
		:status="error ? error.type : null"
		:messages="error ? { [error.type]: $i18n( error.message ) } : {}"
	>
		<template #label>
			{{ $i18n( 'query-builder-input-value-label' ) }}
			<InfoTooltip
				position="end"
				:message="$i18n( 'query-builder-input-value-tooltip' )"
			/>
		</template>

		<CdxTextInput
			input-type="text"
			:model-value="modelValue"
			:placeholder="$i18n( 'query-builder-input-value-placeholder' )"
			:disabled="disabled"
			@update:model-value="$emit( 'update:modelValue', $event )"
		/>
	</CdxField>
</template>

<script setup lang="ts">
import { CdxTextInput, CdxField } from '@wikimedia/codex';
import InfoTooltip from '@/components/InfoTooltip.vue';
import QueryBuilderError from '@/data-model/QueryBuilderError';

interface Props {
	modelValue?: string | null;
	error?: QueryBuilderError | null;
	disabled?: boolean;
}

withDefaults( defineProps<Props>(), {
	modelValue: null,
	error: null,
	disabled: false,
} );

defineEmits( [ 'update:modelValue' ] );
</script>
