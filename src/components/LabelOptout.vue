<template>
	<div class="querybuilder-label-optout">
		<Checkbox
			id="label-optout"
			:checked.sync="checked"
			:label="$i18n( 'query-builder-label-opt-out' )"
		/>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Checkbox } from '@wmde/wikit-vue-components';

export default Vue.extend( {
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
