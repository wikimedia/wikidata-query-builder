<template>
	<div class="querybuilder-label-optout">
		<Checkbox
			id="label-optout"
			v-model:checked="checked"
			:label="$i18n( 'query-builder-label-opt-out' )"
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent } from '@/compat';
import { Checkbox } from '@wmde/wikit-vue-components';

export default defineComponent( {
	name: 'LabelOptout',
	components: {
		Checkbox,
	},
	computed: {
		checked: {
			get(): boolean {
				return this.$store.getters.omitLabels;
			},
			set( value: boolean ): void {
				this.$store.dispatch( 'setOmitLabels', value );
			},
		},
	},
} );
</script>

<style lang="scss">
.querybuilder-label-optout {
	display: flex;
	align-items: flex-end;
	margin-block-start: $dimension-layout-xsmall;
}
</style>
