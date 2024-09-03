<template>
	<div class="querybuilder-limit">
		<CdxCheckbox
			id="limit"
			v-model:model-value="useLimit"
			class="querybuilder-limit__checkbox"
		>
			{{ $i18n( 'query-builder-limit-number-results-description' ) }}
		</CdxCheckbox>
		<CdxField
			class="querybuilder-limit__field"
			:status="error ? error.type : null"
			:messages="error ? { [error.type]: $i18n( error.message ) } : {}"
			hide-label
		>
			<template #label>
				{{ $i18n( 'query-builder-limit-number-screenreader-label' ) }}
			</template>
			<CdxTextInput
				ref="inputContainer"
				class="querybuilder-limit__input"
				input-type="number"
				:model-value="limit"
				:disabled="!useLimit"
				:placeholder="$i18n( 'query-builder-limit-number-placeholder' )"
				:required="useLimit"
				:min="1"
				@update:model-value="validate"
			/>
		</CdxField>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import {
	ref,
	Ref,
} from 'vue';

import QueryBuilderError from '@/data-model/QueryBuilderError';
import { useStore } from '@/store/index';
import {
	CdxCheckbox,
	CdxField,
	CdxTextInput,
} from '@wikimedia/codex';

const inputContainer: Ref<null | InstanceType<typeof CdxTextInput>> = ref( null );
const error: Ref<null | QueryBuilderError> = ref( null );
const { limit, useLimit } = storeToRefs( useStore() );

function validate( value: number | string ): void {
	const { validity } = inputContainer.value.$el.querySelector( 'input' );

	// Unfortunately, We have to programmatically check for input validity even
	// though the browser does it for us. This is because the current version of
	// the CdxTextInput component does not expose the validity state of the
	// input, nor the 'invalid' DOM event. See: T373872

	// If the input is valid, set the limit value
	if ( typeof value === 'number' && value > 0 ) {
		error.value = null;
		limit.value = value;
		return;
	}

	// We check the DOM validity state to see if the input is actually empty
	// since numeric inputs will replace any invalid input with "", this is only
	// really a problem in unit tests, which should be replaced with proper BDD
	// e2e tests anyhow.
	if ( validity.valueMissing && value === '' ) {
		// Limit distinguishes between undefined if the input is empty (which
		// resets the limit to 100 on submit)...
		limit.value = undefined;
	} else {
		// ... and null if the input is invalid for any other reason.
		// See: T270179
		limit.value = null;
	}

	error.value = {
		type: 'error',
		message: 'query-builder-limit-number-error-message',
	};
}
</script>

<style lang="scss">
.querybuilder-limit {
	display: flex;
	align-items: flex-start;

	@media (max-width: $max-width-breakpoint-mobile) {
		flex-direction: column;
		gap: var(--dimension-layout-xsmall);
	}

	// extra specificity needed to overcome .wikit style resets *sigh* -> T277885
	&__checkbox {
		// TODO: change to real ones
		margin-inline-end: var(--dimension-layout-xxsmall);

		// We need to manually align the Checkbox with the TextInput,
		// because the Validation error causes misalignment with align-items: center
		margin-block-start: 5px;
	}

	&__field {
		// Reset the margin of the Field component
		margin: 0;
		margin-inline-start: var(--dimension-layout-small);
	}

	&__input {
		inline-size: 16em;

		// Hide number input spinners
		input[type='number'] {
			appearance: textfield;
		}
	}
}

</style>
