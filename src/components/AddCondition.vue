<template>
	<div class="querybuilder__add-condition">
		<CdxButton
			v-i18n="{ msg: 'query-builder-add-condition' }"
			@click="$emit( 'add-condition', $event )"
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent } from '@/compat';
import { CdxButton } from '@wikimedia/codex';

export default defineComponent( {
	name: 'AddCondition',
	components: {
		CdxButton,
	},
	emits: [ 'add-condition' ],
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
