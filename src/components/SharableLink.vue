<template>
	<span class="querybuilder__sharable-link">
		{{ $i18n( 'query-builder-sharable-link-text' ) }}
		<Popover
			:react-to-hover="false"
			position="end"
		>
			<template #target>
				<Button
					variant="normal"
					type="neutral"
					icon-only
					aria-label="Sharable link"
					@click.native="copyTextToClipboard">
					<Icon
						type="link"
						size="large"
					/>
				</Button>
			</template>
			<template #default>
				{{ $i18n( 'query-builder-sharable-link-message' ) }}
			</template>
		</Popover>
	</span>
</template>

<script lang="ts">
import { defineComponent } from '@/compat';
import { Icon, Button, Popover } from '@wmde/wikit-vue-components';
import QuerySerializer from '@/serialization/QuerySerializer';
import services from '@/ServicesFactory';
import { useStore } from '@/store/index';

export default defineComponent( {
	name: 'SharableLink',
	components: {
		Icon,
		Button,
		Popover,
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
$tinyViewportWidth: 36em;

.querybuilder__sharable-link {
	font-family: $font-family-style-description;
	font-weight: $font-weight-style-description;
	font-size: $font-size-style-description;
	line-height: $font-line-height-style-description;
	margin-inline-start: $dimension-layout-xsmall;

	& .wikit-Icon {
		vertical-align: top;
	}

	@media (max-width: $tinyViewportWidth) {
		margin-inline-start: 0;

		& button {
			margin-block-start: $dimension-layout-xxsmall;
		}
	}
}
</style>
