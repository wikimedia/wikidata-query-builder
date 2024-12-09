<template>
	<div
		class="wikit wikit-InputWithExtender"
	>
		<span class="wikit-InputWithExtender__label-wrapper">
			<label
				class="wikit-InputWithExtender__label"
				:class="[
					disabled ? `wikit-InputWithExtender__label--disabled` : ''
				]"
				:for="id"
			>
				{{ label }}
			</label>
			<span><slot name="suffix" /></span>
		</span>
		<WikitInput
			:id="id"
			:value="value"
			:feedback-type="feedbackType"
			:placeholder="placeholder"
			:disabled="disabled"
			@focus.native="showExtension = true"
			@blur.native="showExtension = false"
			@keydown.native.esc="showExtension = false"
			@update:model-value="onInput"
		/>
		<div v-if="showExtension" class="wikit-InputWithExtender__extension">
			<slot />
		</div>
		<WikitValidationMessage
			v-if="error"
			:type="error.type"
			:message="error.message"
		/>
	</div>
</template>

<script lang="ts">
export default {
	inheritAttrs: false,
};
</script>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { generateUid, getFeedbackTypeFromProps } from '@/utils';
import WikitInput from './WikitInput.vue';
import WikitValidationMessage from './WikitValidationMessage.vue';
import { ErrorProp } from '@/types';

const showExtension = ref( false );
const id = ref( generateUid( 'wikit-InputWithExtender' ) );

interface Props {
	error: ErrorProp;
	disabled?: boolean;
	placeholder?: string;
	value?: string | null;
	label?: string | null;
}

const props = withDefaults( defineProps<Props>(), {
	disabled: false,
	placeholder: '',
	value: null,
	label: null,
} );

const feedbackType = computed( getFeedbackTypeFromProps( props ) );

const emit = defineEmits( [ 'update:modelValue' ] );

function onInput( value: string ): void {
	showExtension.value = true;
	emit( 'update:modelValue', value );
}

</script>

<style lang="scss">
.wikit-InputWithExtender {
	position: relative;

	&__label-wrapper {
		display: flex;
		align-items: center;
		gap: $spacing-50;
		font-weight: $font-weight-bold;
	}

	&__extension {
		padding: $spacing-50 $spacing-75;
		background-color: $background-color-base;
		inline-size: $size-full;
		position: absolute;
		overflow-y: auto;
		z-index: $z-index-dropdown;
		border: $border-base;
		box-shadow: $box-shadow-drop-medium;
		border-radius: $border-radius-sharp $border-radius-sharp $border-radius-base $border-radius-base;
		font-family: $font-family-system-sans;
		font-size: $font-size-medium;
		font-weight: $font-weight-normal;
		color: $color-base;
		line-height: $line-height-xx-small;
	}
}
</style>
