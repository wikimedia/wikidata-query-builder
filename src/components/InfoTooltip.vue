<template>
	<span class="querybuilder-tooltip">
		<Popover
			:react-to-hover="true"
			:position="position"
		>
			<template #target>
				<Button
					variant="quiet"
					type="neutral"
					icon-only
					aria-label="open tooltip with more information">
					<Icon type="info-outlined" size="small" />
				</Button>
			</template>
			<div v-html="message" />
		</Popover>
	</span>
</template>

<script lang="ts">
import Vue from 'vue';
import { Icon, Button, Popover } from '@wmde/wikit-vue-components';

export default Vue.extend( {
	name: 'InfoTooltip',
	components: {
		Icon,
		Button,
		Popover,
	},
	props: {
		position: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
	},
} );
</script>

<style lang="scss">
.querybuilder-tooltip {
	& .wikit-Popover__target .wikit.wikit-Button--iconOnly.wikit-Button--neutral {
		padding-block: 0;
		padding-inline: 0;
		line-height: 0.7;

		&:active {
			background-color: $wikit-Button-quiet-background-color;
		}
	}

	& .wikit-Popover__content-wrapper {
		z-index: 5;
	}
}
</style>
