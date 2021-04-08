<template>
	<div class="querybuilder-include-subclasses">
		<Checkbox
			class="querybuilder-include-subclasses__checkbox"
			:id="id"
			:checked="isChecked"
			:disabled="disabled"
			@update:checked="$emit( 'subclass-check', $event )"
			:label="$i18n('query-builder-include-subclasses' )"
		>
			<template v-slot:suffix>
				<InfoTooltip
					position="end"
					:message="$i18n('query-builder-include-subclasses-tooltip')"
				/></template>
		</Checkbox>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Checkbox } from '@wmde/wikit-vue-components';
import InfoTooltip from '@/components/InfoTooltip.vue';
export default Vue.extend( {
	name: 'SubclassCheckbox',
	data() {
		return {
			id: `include-subclasses-${Math.random()}`,
		};
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
	components: {
		Checkbox,
		InfoTooltip,
	},
} );
</script>

<style lang="scss">
.querybuilder-include-subclasses {
	display: flex;
	align-items: flex-start;
	margin-block-start: $dimension-layout-xxsmall;

	&__checkbox {
		// TODO: change to real ones
		margin-inline-end: $dimension-layout-xxsmall;
	}
}
</style>
