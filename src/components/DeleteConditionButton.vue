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
import Vue from 'vue';
export default Vue.extend( {
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
} );
</script>

<style lang="scss">
	.delete-condition__icon {
		vertical-align: top;
	}
</style>
