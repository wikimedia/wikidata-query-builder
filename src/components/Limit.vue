<template>
	<div class="querybuilder-limit">
		<Checkbox
			id="limit"
			v-model:checked="checked"
			class="querybuilder-limit__checkbox"
			:label="$i18n( 'query-builder-limit-number-results-description' )"
		/>
		<TextInput
			v-model="limit"
			class="querybuilder-limit__input"
			:disabled="!checked"
			:label="$i18n( 'query-builder-limit-number-screenreader-label' )"
			:placeholder="$i18n( 'query-builder-limit-number-placeholder' )"
			:error="error ? { message: $i18n( error.message ), type: error.type } : null"
			@input="onLimitChange"
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent } from '@/compat';
import { DEFAULT_LIMIT } from '@/store/RootState';
import { Checkbox, TextInput } from '@wmde/wikit-vue-components';
import QueryBuilderError from '@/data-model/QueryBuilderError';
import { useStore } from '@/store/index';

export default defineComponent( {
	name: 'Limit',
	components: {
		Checkbox,
		TextInput,
	},
	data() {
		return {
			error: null as null | QueryBuilderError,
			limit: String( DEFAULT_LIMIT ),
		};
	},
	computed: {
		storeLimit(): number | null | undefined {
			const store = useStore();
			return store.limit;
		},
		checked: {
			get(): boolean {
				const store = useStore();
				return store.useLimit;
			},
			set( value: boolean ): void {
				const store = useStore();
				store.setUseLimit( value );
			},
		},
	},
	methods: {
		onLimitChange( value: string ): void {
			if ( value === '' ) {
				const store = useStore();
				store.setLimit( undefined );
				this.error = {
					type: 'error',
					message: 'query-builder-limit-number-error-message',
				};
				return;
			}
			const limit = Number( value );
			const store = useStore();
			if ( isNaN( limit ) || limit < 1 ) {
				store.setLimit( null );
				this.error = {
					type: 'error',
					message: 'query-builder-limit-number-error-message',
				};
				return;
			}
			this.error = null;
			store.setLimit( limit );
		},
	},
	watch: {
		storeLimit( newStoreLimitValue: number | null | undefined ): void {
			if ( this.limit === '' && newStoreLimitValue ) {
				this.limit = String( newStoreLimitValue );
				this.error = null;
			}
		},
	},
	mounted(): void {
		const store = useStore();
		this.limit = store.limit?.toString() || String( DEFAULT_LIMIT );
	},
} );
</script>

<style lang="scss">

.querybuilder-limit {
	display: flex;
	align-items: flex-start;

	// extra specificity needed to overcome .wikit style resets *sigh* -> T277885
	&__checkbox {
		// TODO: change to real ones
		margin-inline-end: $dimension-layout-xxsmall;

		// We need to manually align the Checkbox with the TextInput,
		// because the Validation error causes misalignment with align-items: center
		margin-block-start: 5px;
	}

	&__input {
		// TODO: change to real ones
		margin-inline-start: $dimension-layout-small;
		inline-size: 16em;

		// hides the label of the TextInput while still allowing to be used by screen readers
		.wikit-TextInput__label {
			position: absolute;
			inline-size: 1px;
			block-size: 1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap;
			clip-path: inset(50%);
			border: 0;
		}
	}
}

</style>
