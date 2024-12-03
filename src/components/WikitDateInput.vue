<template>
	<div
		class="wikit wikit-DateInput"
	>
		<WikitInputWithExtender
			:label="label"
			:value="value"
			:error="error"
			:placeholder="placeholder"
			:disabled="disabled"
			@update:model-value="$emit( 'input', $event )"
		>
			<template #default>
				<p class="wikit-DateInput__IntroText">
					{{ resultsIntroText }}
				</p>
				<p v-if="parsedValue" class="wikit-DateInput__ParsedValue">
					<b>{{ parsedValue }}</b>
				</p>
				<p v-if="promptText && !value" class="wikit-DateInput__Prompt">
					{{ promptText }}
				</p>
				<WikitBouncingDots v-if="!parsedValue && value" type="small" />
				<div v-if="calendarNotice && parsedValue" class="wikit-DateInput__CalendarNotice">
					<WikitIcon
						color="inherit"
						type="info"
						size="small" />
					{{ calendarNotice }}
				</div>
			</template>
			<template #suffix>
				<slot name="suffix" />
			</template>
		</WikitInputWithExtender>
	</div>
</template>

<script lang="ts" setup>
import WikitBouncingDots from './WikitBouncingDots.vue';
import WikitIcon from './WikitIcon.vue';
import WikitInputWithExtender from './WikitInputWithExtender.vue';
import { ErrorProp } from '@/types';

interface Props {
	error: ErrorProp;
	disabled?: boolean;
	placeholder?: string;
	label?: string | null;
	parsedValue?: string | null;
	resultsIntroText?: string | null;
	promptText?: string | null;
	value?: string | null;
	calendarNotice?: string | null;
}

withDefaults( defineProps<Props>(), {
	disabled: false,
	placeholder: '',
	label: null,
	parsedValue: null,
	resultsIntroText: null,
	promptText: null,
	value: null,
	calendarNotice: null,
} );

defineEmits( [ 'input' ] );

</script>

<style lang="scss">
.wikit-DateInput {
	&__IntroText {
		padding-block-end: $spacing-25;
		font-family: $font-family-system-sans;
		font-weight: $font-weight-normal;
		font-size: $font-size-medium;
		line-height: $line-height-xx-small;
		color: $color-base;
	}

	&__ParsedValue {
		padding-block: $spacing-25;
		font-family: $font-family-system-sans;
		font-weight: $font-weight-semi-bold;
		font-size: $font-size-medium;
		line-height: $line-height-xx-small;
		color: $color-base;
	}

	&__CalendarNotice {
		padding-block-start: $spacing-25;
		font-family: $font-family-system-sans;
		font-weight: $font-weight-normal;
		font-size: $font-size-small;
		line-height: $line-height-small;
		color: $color-subtle;
	}

	&__Prompt {
		font-family: $font-family-system-sans;
		font-weight: $font-weight-normal;
		font-size: $font-size-medium;
		line-height: $line-height-xx-small;
		color: $color-placeholder;
	}
}
</style>
