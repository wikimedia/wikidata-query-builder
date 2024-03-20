<template>
	<div class="querybuilder__add-condition">
		<Button
			v-i18n="{ msg: 'query-builder-add-condition' }"
			type="neutral"
			@click.native="$emit( 'add-condition', $event )"
		/>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Button } from '@wmde/wikit-vue-components';

export default Vue.extend( {
	name: 'AddCondition',
	components: {
		Button,
	},
} );
</script>

<style scoped lang="scss">
$tiny-viewport-width: 38em;

.querybuilder__add-condition {
	display: flex;
	justify-content: flex-start;

	& button {
		@media (max-width: $tiny-viewport-width) {
			inline-size: 100%;
		}
	}
}
</style>
