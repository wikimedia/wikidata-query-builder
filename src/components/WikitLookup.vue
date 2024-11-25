<template>
	<div
		class="wikit wikit-Lookup"
		:class="[ extraClasses ]"
		:style="extraStyles"
	>
		<span class="wikit-Lookup__label-wrapper">
			<label
				class="wikit-Lookup__label"
				:class="[
					disabled ? `wikit-Lookup__label--disabled` : ''
				]"
				:for="inputId"
			>
				{{ label }}
			</label>
			<span><slot name="suffix" /></span>
		</span>

		<WikitLookupInput
			:id="inputId"
			:feedback-type="feedbackType"
			:menu-items="menuItems"
			:disabled="disabled"
			:placeholder="placeholder"
			:value="value"
			:search-input="searchInput"
			:label="label"
			v-bind="otherAttributes"
			@update:search-input="$emit( 'update:searchInput', $event )"
			@input="$emit( 'input', $event )"
			@scroll="( firstIndex, lastIndex ) => $emit( 'scroll', firstIndex, lastIndex )"
		>
			<template #no-results>
				<slot name="no-results" />
			</template>
		</WikitLookupInput>
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
import { useAttrs, Ref, ref, PropType, computed } from 'vue';

import WikitValidationMessage from './WikitValidationMessage.vue';
import WikitLookupInput from './WikitLookupInput.vue';

import { generateUid } from '@/utils';
import { ErrorProp, MenuItem } from '@/types';

const attrs = useAttrs();
const { class: extraClasses, style: extraStyles, ...otherAttributes } = attrs;

const inputId: Ref<string> = ref( generateUid( 'wikit-Lookup' ) );

const props = defineProps( {
	error: {
		type: Object as PropType<ErrorProp>,
		validator( error: ErrorProp ): boolean {
			return error === null ||
			typeof error.message === 'string' &&
			typeof error.type === 'string' &&
			[ 'warning', 'error' ].includes( error.type );
		},
		default: null,
	},
	menuItems: {
		type: Array as PropType<MenuItem[]>,
		default: (): [] => [],
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	label: {
		type: String,
		default: '',
	},
	placeholder: {
		type: String,
		default: '',
	},
	value: {
		type: Object,
		default: null,
	},
	searchInput: {
		type: String,
		default: '',
	},
} );

const feedbackType = computed<() => 'error' | 'warning' | null>( () => {
	return () => {
		return props.error && props.error.type || null;
	};
} );

defineEmits( [ 'update:searchInput', 'input', 'scroll' ] );

</script>

<style>
.wikit-Lookup {
	&__label-wrapper {
		display: flex;
		align-items: center;
		gap: $spacing-50;
	}

	&__label {
		@include Label( block );
	}
}
</style>
