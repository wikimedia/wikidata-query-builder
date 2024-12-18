<template>
	<span class="querybuilder__sharable-link">

		<WikitPopover
			:react-to-hover="false"
			position="end"
		>
			<template #target>
				<CdxButton
					action="progressive"
					aria-label="Sharable link"
					@click="copyTextToClipboard">
					<CdxIcon
						:icon="cdxIconLink"
						size="medium"
					/>
					{{ $i18n( 'query-builder-sharable-link-text' ) }}
				</CdxButton>
			</template>
			<template #default>
				{{ $i18n( 'query-builder-sharable-link-message' ) }}
			</template>
		</WikitPopover>
	</span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { CdxButton, CdxIcon } from '@wikimedia/codex';
import { cdxIconLink } from '@wikimedia/codex-icons';
import WikitPopover from './WikitPopover.vue';
import QuerySerializer from '@/serialization/QuerySerializer';
import services from '@/ServicesFactory';
import { useStore } from '@/store/index';

export default defineComponent( {
	name: 'SharableLink',
	components: {
		CdxIcon,
		CdxButton,
		WikitPopover,
	},
	setup() {
		return {
			cdxIconLink,
		};
	},
	data: function () {
		return {
			href: '' as string,
		};
	},
	methods: {
		async copyTextToClipboard(): Promise<void> {
			const querySerializer = new QuerySerializer();
			const store = useStore();
			const serializedQuery = querySerializer.serialize( store.$state );
			const current = new URL( window.location.href );
			current.searchParams.set( 'query', serializedQuery );
			this.href = current.href;
			const urlShortener = services.get( 'urlShortenerRepository' );
			try {
				this.href = await urlShortener.shortenUrl( current.href );
			} catch ( err ) {
				// nothing happens here. the long url is not shortned.
			}
			try {
				await navigator.clipboard.writeText( this.href );
			} catch ( err ) {
				// The code might run in a context that doesn't have a clipboard API (like test).
				// Ignore and pass.
			}
		},
	},
} );
</script>

<style scoped lang="scss">
@import '@wikimedia/codex-design-tokens/theme-wikimedia-ui';
@import '../styles/typography';

$tinyViewportWidth: 36em;

.querybuilder__sharable-link {
	@include body-s;

	margin-inline-start: var(--dimension-layout-xsmall);

	@media (max-width: $tinyViewportWidth) {
		margin-inline-start: 0;

		& button {
			margin-block-start: var(--dimension-layout-xxsmall);
		}
	}
}
</style>
