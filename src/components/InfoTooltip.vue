<template>
	<span class="querybuilder-tooltip">
		<WikitPopover
			:react-to-hover="true"
			:position="position"
		>
			<template #target>
				<CdxButton
					class="btn-11"
					weight="quiet"
					aria-label="open tooltip with more information">
					<CdxIcon :icon="cdxIconInfo" size="small" />
				</CdxButton>
			</template>
			<div v-html="message" />
		</WikitPopover>
	</span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import WikitPopover from './WikitPopover.vue';
import { CdxButton, CdxIcon } from '@wikimedia/codex';
import { cdxIconInfo } from '@wikimedia/codex-icons';

export default defineComponent( {
	name: 'InfoTooltip',
	components: {
		CdxIcon,
		CdxButton,
		WikitPopover,
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
@import '@wikimedia/codex-design-tokens/theme-wikimedia-ui';

.querybuilder-tooltip {
	// Fixes the vertical alignment of the button with the text
	vertical-align: top;

	& .wikit-Popover__target .cdx-button.cdx-button--action-default {
		padding-block: 0;
		padding-inline: 0;
		line-height: 0.7;

		&:active {
			background-color: $background-color-transparent;
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
