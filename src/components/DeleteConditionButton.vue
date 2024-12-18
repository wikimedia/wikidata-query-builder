<template>
	<CdxButton
		class="delete-condition"
		weight="quiet"
		:aria-label="$i18n( 'query-builder-delete-condition' )"
		:disabled="disabled"
		size="medium"
		@click="$emit( 'click' )"
	>
		<CdxIcon
			:icon="cdxIconTrash"
			size="medium"
			class="delete-condition__icon" />
	</CdxButton>
</template>

<script lang="ts">
import { CdxButton, CdxIcon } from '@wikimedia/codex';
import { cdxIconTrash } from '@wikimedia/codex-icons';
import { defineComponent } from 'vue';
export default defineComponent( {
	name: 'DeleteConditionButton',
	components: {
		CdxButton,
		CdxIcon,
	},
	props: {
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	emits: [ 'click' ],
	setup() {
		return {
			cdxIconTrash,
		};
	},
} );
</script>
