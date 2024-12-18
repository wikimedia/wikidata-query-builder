<template>
	<div class="querybuilder-include-subclasses">
		<CdxCheckbox
			:id="id"
			class="querybuilder-include-subclasses__checkbox"
			:model-value="isChecked"
			:disabled="disabled"
			@update:model-value="$emit( 'subclass-check', $event )"
		>
			{{ $i18n( 'query-builder-include-subclasses' ) }}
		</CdxCheckbox>
		<InfoTooltip
			position="end"
			:message="$i18n( 'query-builder-include-subclasses-tooltip' )"
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { CdxCheckbox } from '@wikimedia/codex';
import InfoTooltip from '@/components/InfoTooltip.vue';
export default defineComponent( {
	name: 'SubclassCheckbox',
	components: {
		CdxCheckbox,
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
