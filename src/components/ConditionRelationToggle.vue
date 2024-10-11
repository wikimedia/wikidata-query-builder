<template>
	<CdxToggleButtonGroup
		class="conditionRelationToggle"
		:model-value="selectedValue"
		:buttons="buttons"
		@update:model-value="selectedValue = $event; emit( 'set-relation-toggle', $event )" />
</template>

<script setup lang="ts">
import { CdxToggleButtonGroup } from '@wikimedia/codex';
import { ref } from 'vue';
import { useI18n } from 'vue-banana-i18n';

const messages = useI18n();

interface Props {
	modelValue?: string;
}

const props = withDefaults( defineProps<Props>(), {
	modelValue: 'and',
} );

const buttons = [
	{ value: 'and', label: messages.i18n( 'query-builder-condition-relation-toggle-and' ) },
	{ value: 'or', label: messages.i18n( 'query-builder-condition-relation-toggle-or' ) },
];

const selectedValue = ref( props.modelValue );

const emit = defineEmits( [ 'set-relation-toggle' ] );

</script>
