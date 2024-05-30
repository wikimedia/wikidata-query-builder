<template>
	<div class="querybuilder-include-subclasses">
		<Checkbox
			:id="id"
			class="querybuilder-include-subclasses__checkbox"
			:checked="isChecked"
			:disabled="disabled"
			:label="$i18n( 'query-builder-include-subclasses' )"
			@update:checked="$emit( 'subclass-check', $event )"
		>
			<template #suffix>
				<InfoTooltip
					position="end"
					:message="$i18n( 'query-builder-include-subclasses-tooltip' )"
				/>
			</template>
		</Checkbox>
	</div>
</template>

<script lang="ts">
import { defineComponent } from '@/compat';
import { Checkbox } from '@wmde/wikit-vue-components';
import InfoTooltip from '@/components/InfoTooltip.vue';
export default defineComponent( {
	name: 'SubclassCheckbox',
	components: {
		Checkbox,
		InfoTooltip,
	},
	props: {
		isChecked: {
			type: Boolean,
			required: true,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	emits: [ 'subclass-check' ],
	data() {
		return {
			id: `include-subclasses-${Math.random()}`,
		};
	},
} );
</script>

<style lang="scss">
.querybuilder-include-subclasses {
	display: flex;
	align-items: flex-start;
	margin-block-start: var(--dimension-layout-xxsmall);

	&__checkbox {
		// TODO: change to real ones
		margin-inline-end: var(--dimension-layout-xxsmall);
	}
}
</style>
