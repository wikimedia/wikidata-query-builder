<template>
	<div class="querybuilder-result">
		<div class="querybuilder-result__link">
			<a :href="queryServiceUrl + ((encodedQuery.length !== 0) ? '#' + encodedQuery : '')" target="_blank" >
				{{ $i18n('query-builder-result-link-text')}}
			</a>
		</div>
		<div class="querybuilder-result__header">
			<h2>{{ $i18n('query-builder-result-header')}}</h2>
		</div>
		<div v-if="errors.length !== 0" class="querybuilder-result__errors">
			<Message
				v-for="(error, index) in errors" :type="error.type" :key="index">
				<span>{{$i18n(error.message)}}</span>
			</Message>
		</div>
		<div v-else-if="encodedQuery.length === 0">
			<div class="querybuilder-result__description">
				{{ $i18n('query-builder-result-placeholder')}}
			</div>
		</div>
		<div v-else class="querybuilder-result__wrapper">
			<iframe
				:src="queryServiceEmbedUrl + '#' + encodedQuery"
				:key="iframeRenderKey"
				class="querybuilder-result__iframe"
				referrerpolicy="origin"
				sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox">
			</iframe>
		</div>
	</div>
</template>

<script lang="ts">
import { Message } from '@wmde/wikit-vue-components';
import Vue from 'vue';
import { mapGetters } from 'vuex';

export default Vue.extend( {
	name: 'QueryResult',
	data() {
		return {
			queryServiceEmbedUrl: process.env.VUE_APP_QUERY_SERVICE_EMBED_URL,
			queryServiceUrl: process.env.VUE_APP_QUERY_SERVICE_URL,
		};
	},
	props: {
		encodedQuery: {
			type: String,
		},
		iframeRenderKey: {
			type: Number,
		},
	},
	methods: {
		updateInputTextValue( value: string ): void {
			this.$store.dispatch( 'updateValue', value );
		},
	},
	computed: {
		...mapGetters( {
			errors: 'getErrors',
		} ),
	},
	components: {
		Message,
	},
} );
</script>

<style lang="scss">
	.querybuilder-result {
		margin-block-start: $dimension-layout-medium;
	}

	.querybuilder-result__link {
		margin-block-end: $dimension-layout-xxsmall;
		text-align: end;
	}

	.querybuilder-result__errors {
		padding-block: $dimension-layout-medium;
		padding-inline: $dimension-layout-medium;
		border: $border-width-thin $border-style-base $border-color-base-subtle;
		border-radius: 0 0 $border-radius-base $border-radius-base;
	}

	.querybuilder-result__description {
		padding-block: $dimension-spacing-xxlarge;
		font-size: $font-size-style-description;
		font-family: $font-family-style-description;
		color: $font-color-subtle;
		font-weight: $font-weight-style-description;
		line-height: $font-line-height-style-description;
		width: $dimension-width-full;
		border: $border-width-thin $border-style-base $border-color-base-subtle;
		border-radius: 0 0 $border-radius-base $border-radius-base;
		text-align: center;
	}

	.querybuilder-result__header {
		display: flex;
		align-items: center;
		background: $color-base-90;
		border: $border-width-thin $border-style-base $border-color-base-subtle;
		border-radius: $border-radius-base $border-radius-base 0 0;
		box-sizing: border-box;
		padding-inline-start: $dimension-spacing-xlarge;
		// TODO: Remove this once we have the share button and use padding instead
		height: 3em;
		border-bottom: none;

		& h2 {
			font-family: $font-family-style-heading-sans;
			font-style: normal;
			font-weight: $font-weight-style-h4;
			font-size: $font-size-style-h4;
			color: $font-color-base;
		}
	}

	.querybuilder-result__iframe {
		width: $dimension-width-full;
		border: $border-width-thin $border-style-base $border-color-base-subtle;
		border-radius: 0 0 $border-radius-base $border-radius-base;
		height: 95vh;
	}
</style>
