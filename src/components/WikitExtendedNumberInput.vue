<template>
	<div class="wikit wikit-ExtendedNumberInput">
		<label
			class="wikit wikit-ExtendedNumberInput__label"
			:class="[
				disabled ? `wikit-ExtendedNumberInput__label--disabled` : ''
			]"
			:for="id"
		>
			{{ label }}
		</label>
		<WikitInput
			:id="id"
			:value="value"
			:feedback-type="feedbackType"
			:placeholder="placeholder"
			:disabled="disabled"
			@update:model-value="emitInputEvent"
		/>
		<WikitValidationMessage
			v-if="error"
			:type="error.type"
			:message="error.message"
		/>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import WikitInput from './WikitInput.vue';
import WikitValidationMessage from './WikitValidationMessage.vue';
import { generateUid, validateExtendedNumberInput, getFeedbackTypeFromProps } from '@/utils';
import { ErrorProp } from '@/types';

const id = ref( generateUid( 'wikit-ExtendedNumberInput' ) );

interface Props {
	error: ErrorProp;
	disabled?: boolean;
	label?: string;
	placeholder?: string;
	value?: string;
}

const props = withDefaults( defineProps<Props>(), {
	disabled: false,
	label: '',
	placeholder: '',
	value: '',
} );

const feedbackType = computed( getFeedbackTypeFromProps( props ) );

const emit = defineEmits( [ 'input', 'invalid-input' ] );

function emitInputEvent( value: string ): void {
	/**
	 * contains user input, i.e. the contents of the input value
	 */
	emit( 'input', value );
	if ( value && !validateExtendedNumberInput( value ) ) {
		emit( 'invalid-input', value );
	}
}

</script>

<style lang="scss">
@import '../styles/label';

.wikit-ExtendedNumberInput {
	&__label {
		@include wikit-label-mixin( block );
	}
}
</style>
