<template>
	<ToggleButtonGroup
		:value="modelValue"
		class="conditionRelationToggle"
		@input="$emit( 'set-relation-toggle', $event )"
	>
		<template #default>
			<ToggleButton
				value="and"
			>
				{{ $i18n( 'query-builder-condition-relation-toggle-and' ) }}
			</ToggleButton>
			<ToggleButton
				value="or"
			>
				{{ $i18n( 'query-builder-condition-relation-toggle-or' ) }}
			</ToggleButton>
		</template>
	</ToggleButtonGroup>
</template>

<script lang="ts">
import { ToggleButton, ToggleButtonGroup } from '@wmde/wikit-vue-components';
import { defineComponent } from '@/compat';

export default defineComponent( {
	name: 'ConditionRelationToggle',
	components: { ToggleButton, ToggleButtonGroup },
	props: {
		modelValue: {
			type: String,
			default: 'add',
		},
	},
	emits: [ 'set-relation-toggle' ],
} );
</script>
