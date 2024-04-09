<template>
	<span class="querybuilder-tooltip">
		<Popover
			:react-to-hover="true"
			:position="position"
		>
			<template #target>
				<CdxButton
					class="btn-11"
					variant="quiet"
					type="neutral"
					aria-label="open tooltip with more information">
					<CdxIcon :icon="cdxIconInfo" size="small" />
				</CdxButton>
			</template>
			<div v-html="message" />
		</Popover>
	</span>
</template>

<script lang="ts">
import { defineComponent } from '@/compat';
import { Popover } from '@wmde/wikit-vue-components';
import { CdxButton, CdxIcon } from '@wikimedia/codex';
import { cdxIconInfo } from '@wikimedia/codex-icons';

export default defineComponent( {
	name: 'InfoTooltip',
	components: {
		CdxIcon,
		CdxButton,
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
	data() {
		return {
			cdxIconInfo,
		};
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

.btn-11 {
	max-inline-size: 1em !important;
	max-block-size: 1em !important;
	min-inline-size: 1em !important;
	min-block-size: 1em !important;
}
</style>
