<template>
	<span class="querybuilder__sharable-link">
		{{ $i18n('query-builder-sharable-link-text') }}
		<Popover
			:reactToHover="false"
			position="end"
		>
			<template v-slot:target>
				<Button
					variant="normal"
					type="neutral"
					iconOnly
					@click.native="copyTextToClipboard"
					aria-label="Sharable link">
					<Icon
						type="link"
						size="large"
					/>
				</Button>
			</template>
			<template v-slot:default>
				{{ $i18n('query-builder-sharable-link-message') }}
			</template>
		</Popover>
	</span>
</template>

<script lang="ts">
import Vue from 'vue';
import { Icon, Button, Popover } from '@wmde/wikit-vue-components';
import QuerySerializer from '@/serialization/QuerySerializer';

export default Vue.extend( {
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
			const serializedQuery = querySerializer.serialize( this.$store.state );
			const current = new URL( window.location.href );
			current.searchParams.set( 'query', serializedQuery );
			this.href = current.href;
			await this.shortenUrl( current.href );
			try {
				await navigator.clipboard.writeText( this.href );
			} catch ( err ) {
				// The code might run in a context that doesn't have a clipboard API (like test).
				// Ignore and pass.
			}
		},
		async shortenUrl( url: string ): Promise<void> {
			const requestOptions = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			};

			const params: { [key: string]: string } = {
				action: 'shortenurl',
				format: 'json',
				origin: '*',
				url: url,
			};
			const shortnerUrl = new URL( process.env.VUE_APP_URL_SHORTNER_SERVICE_URL || '' );

			for ( const key in params ) {
				shortnerUrl.searchParams.set( key, params[ key ] );
			}

			try {
				const response = await fetch( shortnerUrl.toString(), requestOptions );
				if ( response.ok ) {
					const data = await response.json();
					this.href = window.location.protocol + '//' +
						( data.shortenurl.shorturl || data.shortenurl.shorturlalt );
				}
			} catch ( err ) {
				// nothing happens here. the long url is not shortned.
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
