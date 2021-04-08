<template>
	<div class="querybuilder__dropdown">
		<Dropdown
			class="querybuilder__dropdown-select"
			@input="onInput"
			:value="selected"
			label="Value Type"
			:menuItems="optionItems"
			:disabled="disabled"
		/>
	</div>

</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import PropertyValueRelation, { BasePropertyValueRelation } from '@/data-model/PropertyValueRelation';
import { MenuItem } from '@wmde/wikit-vue-components/dist/components/MenuItem';
import { Dropdown } from '@wmde/wikit-vue-components';

interface PropertyValueRelationMenuItem extends MenuItem {
	value: PropertyValueRelation;
}

export default Vue.extend( {
	name: 'ValueTypeDropDown',
	props: {
		value: {
			type: String as PropType<PropertyValueRelation>,
			required: true,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	methods: {
		onInput( event: PropertyValueRelationMenuItem ): void {
			this.$emit( 'input', event.value );
		},
	},
	computed: {
		optionItems(): PropertyValueRelationMenuItem[] {
			return Object.values( BasePropertyValueRelation ).map( ( value: BasePropertyValueRelation ) => {
				return {
					/*
					* Values that can be used here:
					* query-builder-value-type-relation-dropdown-matching
					* query-builder-value-type-relation-dropdown-without
					* query-builder-value-type-relation-dropdown-regardless-of-value
					*/
					label: this.$i18n( `query-builder-value-type-relation-dropdown-${value}` ),
					description: '',
					value,
				};
			} );
		},
		selected(): PropertyValueRelationMenuItem | null {
			return this.optionItems.find(
				( option: PropertyValueRelationMenuItem ) => option.value === this.value,
			) || null;
		},
	},
	components: {
		Dropdown,
	},
} );
</script>
<style lang="scss">
	// will be removed once dropdown component is implemented in the DS
	.querybuilder__dropdown-select {
		.wikit-Dropdown__label {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap;
			-webkit-clip-path: inset(50%);
			clip-path: inset(50%);
			border: 0;
		}
	}
</style>
