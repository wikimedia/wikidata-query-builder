<template>
	<div class="querybuilder-label-optout">
		<CdxCheckbox
			id="label-optout"
			:model-value="checked"
			@update:model-value="onUpdate"
		>
			{{ $i18n( 'query-builder-label-opt-out' ) }}
		</CdxCheckbox>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { CdxCheckbox } from '@wikimedia/codex';
import { useStore } from '@/store';

export default defineComponent( {
	name: 'LabelOptout',
	components: {
		CdxCheckbox,
	},
	setup() {
		function onUpdate( value: boolean ): void {
			const store = useStore();
			store.setOmitLabels( value );
		}
		return {
			onUpdate,
		};
	},
	computed: {
		checked: {
			get(): boolean {
				const store = useStore();
				return store.omitLabels;
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
