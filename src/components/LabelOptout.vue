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
import { useStore } from '@/store';

export default defineComponent( {
	name: 'LabelOptout',
	components: {
		Checkbox,
	},
	computed: {
		checked: {
			get(): boolean {
				const store = useStore();
				return store.omitLabels;
			},
			set( value: boolean ): void {
				const store = useStore();
				store.setOmitLabels( value );
			},
		},
	},
} );
</script>

<style lang="scss">
.querybuilder-label-optout {
	display: flex;
	align-items: flex-end;
	margin-block-start: var(--dimension-layout-xsmall);
}
</style>
