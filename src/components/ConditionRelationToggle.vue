<template>
	<ToggleButtonGroup
		:value="value"
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
import Vue from 'vue';

export default Vue.extend( {
	name: 'ConditionRelationToggle',
	components: { ToggleButton, ToggleButtonGroup },
	props: {
		value: {
			type: String,
			default: 'add',
		},
	},
} );
</script>
