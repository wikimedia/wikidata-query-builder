<template>
	<ToggleButtonGroup
		:value="modelValue"
		class="negationToggle"
		@input="$emit( 'update:modelValue', $event )"
	>
		<template #default>
			<ToggleButton
				value="with"
			>
				{{ $i18n( 'query-builder-negation-option-label-with' ) }}
			</ToggleButton>
			<ToggleButton
				value="without"
			>
				{{ $i18n( 'query-builder-negation-option-label-without' ) }}
			</ToggleButton>
		</template>
	</ToggleButtonGroup>
</template>

<script lang="ts">
import { ToggleButton, ToggleButtonGroup } from '@wmde/wikit-vue-components';
import { defineComponent } from '@/compat';

export default defineComponent( {
	name: 'NegationToggle',
	components: { ToggleButton, ToggleButtonGroup },
	props: {
		modelValue: {
			type: String,
			default: 'with',
		},
	},
	emits: [ 'update:modelValue' ],
} );
</script>
