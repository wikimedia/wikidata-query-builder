<template>
	<Button
		icon-only
		class="delete-condition"
		type="neutral"
		variant="quiet"
		:aria-label="$i18n( 'query-builder-delete-condition' )"
		:disabled="disabled"
		@click.native="$emit( 'click' )"
	>
		<Icon
			type="trash"
			size="large"
			color="inherit"
			class="delete-condition__icon" />
	</Button>
</template>

<script lang="ts">
import { Button, Icon } from '@wmde/wikit-vue-components';
import { defineComponent } from '@/compat';
export default defineComponent( {
	name: 'DeleteConditionButton',
	components: {
		Button,
		Icon,
	},
	props: {
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	emits: [ 'click' ],
} );
</script>

<style lang="scss">
@import "@wikimedia/codex-design-tokens/theme-wikimedia-ui";

.delete-condition__icon {
	vertical-align: top;
}
</style>
