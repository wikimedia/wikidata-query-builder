<template>
	<div class="query-condition-references">
		<Dropdown
			class="query-condition-references__select"
			:value="selected"
			:label="$i18n( 'query-builder-reference-relation-label' )"
			:menu-items="optionItems"
			:disabled="disabled"
			@input="onInput"
		>
			<template #suffix>
				<InfoTooltip
					position="top"
					:message="$i18n( 'query-builder-reference-relation-tooltip' )"
				/>
			</template>
		</Dropdown>
	</div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { defineComponent } from '@/compat';
import ReferenceRelation from '@/data-model/ReferenceRelation';
import { MenuItem } from '@wmde/wikit-vue-components/dist/components/MenuItem';
import { Dropdown } from '@wmde/wikit-vue-components';
import InfoTooltip from '@/components/InfoTooltip.vue';

interface ReferenceRelationMenuItem extends MenuItem {
	value: ReferenceRelation;
}

export default defineComponent( {
	name: 'ReferenceRelationDropDown',
	components: {
		Dropdown,
		InfoTooltip,
	},
	props: {
		modelValue: {
			type: String as PropType<ReferenceRelation>,
			required: true,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	emits: [ 'update:modelValue' ],
	computed: {
		optionItems(): ReferenceRelationMenuItem[] {
			return Object.values( ReferenceRelation ).map( ( value: ReferenceRelation ) => {
				return {
					/*
          * Values that can be used here:
          * query-builder-reference-relation-dropdown-with
          * query-builder-reference-relation-dropdown-without
          * query-builder-reference-relation-dropdown-regardless-of-value
          */
					label: this.$i18n( `query-builder-reference-relation-dropdown-${value}` ),
					description: '',
					value,
				};
			} );
		},
		selected(): ReferenceRelationMenuItem | null {
			return this.optionItems.find(
				( option: ReferenceRelationMenuItem ) => option.value === this.modelValue,
			) || null;
		},
	},
	methods: {
		onInput( event: ReferenceRelationMenuItem ): void {
			this.$emit( 'update:modelValue', event.value );
		},
	},
} );
</script>
