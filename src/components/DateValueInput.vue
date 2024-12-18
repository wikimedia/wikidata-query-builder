<template>
	<WikitDateInput
		v-model="rawInput"
		:label="$i18n( 'query-builder-date-input-value-label' )"
		:placeholder="$i18n( 'query-builder-date-input-placeholder' )"
		:prompt-text="$i18n( 'query-builder-date-input-prompt-text' )"
		:results-intro-text="$i18n( 'query-builder-date-input-results-intro-text' )"
		:calendar-notice="$i18n( 'query-builder-date-input-calendar-notice-text' )"
		:error="error ? { message: $i18n( error.message ), type: error.type } : null"
		:parsed-value="( modelValue && modelValue.formattedValue ) ? modelValue.formattedValue : null"
		:disabled="disabled"
		@input="onInput( $event )"
	>
		<template #suffix>
			<InfoTooltip
				position="top-end"
				:message="$i18n( 'query-builder-input-value-tooltip' )"
			/>
		</template>
	</WikitDateInput>
</template>

<script lang="ts">
import WikitDateInput from '@/components/WikitDateInput.vue';
import { DateValue } from '@/store/RootState';
import { PropType } from 'vue';
import { defineComponent } from 'vue';
import InfoTooltip from '@/components/InfoTooltip.vue';
import debounce from 'lodash/debounce';

export default defineComponent( {
	name: 'DateValueInput',
	components: {
		WikitDateInput,
		InfoTooltip,
	},
	props: {
		modelValue: {
			type: Object as PropType<DateValue>,
			default: null,
		},
		error: {
			type: Object,
			default: null,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	emits: [ 'update:modelValue' ],
	data() {
		return {
			rawInput: '',
			debouncedDateValue: null as ( ( arg0: string ) => void ) | null,
		};
	},
	methods: {
		onInput( event: string ): void {
			if ( this.debouncedDateValue === null ) {
				this.debouncedDateValue = debounce( async ( debouncedDateInput: string ) => {
					this.$emit( 'update:modelValue', debouncedDateInput );
				}, 150 );
			}

			this.debouncedDateValue( event );
		},
	},
	watch: {
		disabled( isDisabled: boolean ): void {
			if ( isDisabled ) {
				this.rawInput = '';
			}
		},
	},
	mounted() {
		if ( this.modelValue ) {
			this.rawInput = this.modelValue.formattedValue || '';
		}
	},
} );
</script>
