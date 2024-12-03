<template>
	<div class="wikit wikit-QuantityInput">
		<span class="wikit-QuantityInput__label-wrapper">
			<label
				class="wikit-QuantityInput__label"
				:class="[ disabled ? `wikit-QuantityInput__label--disabled` : '' ]"
				:for="id"
			>
				{{ label }}
			</label>
			<span><slot name="suffix" /></span>
		</span>
		<div class="wikit-QuantityInput__input-wrapper">
			<WikitInput
				:id="id"
				class="wikit-QuantityInput__number-input"
				:placeholder="numberInputPlaceholder"
				:value="numberInputValue"
				:disabled="disabled"
				:feedback-type="errorCause === 'number' || errorCause === 'both' ? feedbackType : null"
				@update:model-value="onNumberInput"
			/>
			<WikitLookupInput
				class="wikit-QuantityInput__unit-lookup"
				:aria-label="unitLookupLabel"
				:placeholder="unitLookupPlaceholder"
				:disabled="disabled"
				:menu-items="unitLookupMenuItems"
				:search-input="unitLookupSearchInput"
				:value="unitLookupValue"
				:feedback-type="errorCause === 'unit' || errorCause === 'both' ? feedbackType : null"
				@update:search-input="onUnitLookupSearchInput"
				@input="onUnitLookupValue"
				@scroll="onScroll"
			>
				<template #no-results>
					<slot name="no-results" />
				</template>
			</WikitLookupInput>
		</div>
		<WikitValidationMessage
			v-if="error"
			:type="error.type"
			:message="error.message"
		/>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { ErrorProp, MenuItem } from '@/types';
import WikitInput from './WikitInput.vue';
import WikitLookupInput from './WikitLookupInput.vue';
import WikitValidationMessage from './WikitValidationMessage.vue';
import { generateUid, getFeedbackTypeFromProps } from '@/utils';

interface Props {
	error: ErrorProp;
	errorCause?: 'number' | 'unit' | 'both' | null;
	label: string;
	unitLookupLabel: string;
	numberInputPlaceholder: string;
	numberInputValue?: string | null;
	unitLookupPlaceholder: string;
	unitLookupMenuItems: MenuItem[];
	unitLookupSearchInput: string;
	unitLookupValue?: MenuItem | null;
	disabled?: boolean;
}

const props = withDefaults( defineProps<Props>(), {
	errorCause: null,
	numberInputValue: null,
	unitLookupValue: null,
} );

const feedbackType = computed( getFeedbackTypeFromProps( props ) );

const id = ref( generateUid( 'wikit-Input' ) );

const emit = defineEmits( [ 'scroll', 'update:numberInputValue',
	'update:unitLookupSearchInput', 'update:unitLookupValue' ] );

function onScroll( firstIndex: number, lastIndex: number ): void {
	emit( 'scroll', firstIndex, lastIndex );
}

function onNumberInput( number: number ): void {
	emit( 'update:numberInputValue', number );
}

function onUnitLookupSearchInput( search: string ): void {
	emit( 'update:unitLookupSearchInput', search );
}

function onUnitLookupValue( value: null | MenuItem ): void {
	emit( 'update:unitLookupValue', value );
}

</script>

<style lang="scss">
@import '../styles/label';

.wikit-QuantityInput {
	&__input-wrapper {
		display: flex;
		align-items: baseline;
	}

	&__number-input {
		flex: 1 1 50%;

		&.wikit-Input {
			border-start-end-radius: $border-radius-sharp;
			border-end-end-radius: $border-radius-sharp;
		}
	}

	&__unit-lookup {
		flex: 1 1 50%;

		.wikit-Input {
			border-start-start-radius: $border-radius-sharp;
			border-end-start-radius: $border-radius-sharp;
		}
	}

	&__label-wrapper {
		display: flex;
		gap: $spacing-50;
	}

	&__label {
		@include wikit-label-mixin(block);
	}
}
</style>
