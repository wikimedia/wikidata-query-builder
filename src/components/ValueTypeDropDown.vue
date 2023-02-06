<template>
	<div class="querybuilder-dropdown">
		<Dropdown
			class="querybuilder-dropdown__select"
			:value="selected"
			label="Value Type"
			:menu-items="optionItems"
			:disabled="disabled"
			@input="onInput"
		/>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import PropertyValueRelation, {
	BasePropertyValueRelation,
	RangePropertyValueRelation,
} from '@/data-model/PropertyValueRelation';
import { MenuItem } from '@wmde/wikit-vue-components/dist/components/MenuItem';
import { Dropdown } from '@wmde/wikit-vue-components';

interface PropertyValueRelationMenuItem extends MenuItem {
	value: PropertyValueRelation;
}

export default Vue.extend( {
	name: 'ValueTypeDropDown',
	components: {
		Dropdown,
	},
	props: {
		value: {
			type: String as PropType<PropertyValueRelation>,
			required: true,
		},
		datatype: {
			type: String,
			default: null,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		optionItems(): PropertyValueRelationMenuItem[] {
			const relationOptions: PropertyValueRelationMenuItem[] = Object.values( BasePropertyValueRelation ).map(
				( value: BasePropertyValueRelation ) => {
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
				},
			);

			if ( this.datatype === 'quantity' ) {
				relationOptions.push( ...Object.values( RangePropertyValueRelation ).map(
					( value: RangePropertyValueRelation ) => {
						return {
							/*
							* Values that can be used here:
							* query-builder-value-type-relation-dropdown-less-than-quantity
							* query-builder-value-type-relation-dropdown-more-than-quantity
							*/
							label: this.$i18n( `query-builder-value-type-relation-dropdown-${value}-quantity` ),
							description: '',
							value,
						};
					},
				) );
			}

			if ( this.datatype === 'time' ) {
				relationOptions.push( ...Object.values( RangePropertyValueRelation ).map(
					( value: RangePropertyValueRelation ) => {
						return {
							/*
							* Values that can be used here:
							* query-builder-value-type-relation-dropdown-less-than-date
							* query-builder-value-type-relation-dropdown-more-than-date
							*/
							label: this.$i18n( `query-builder-value-type-relation-dropdown-${value}-date` ),
							description: '',
							value,
						};
					},
				) );
			}

			return relationOptions;
		},
		selected(): PropertyValueRelationMenuItem | null {
			return this.optionItems.find(
				( option: PropertyValueRelationMenuItem ) => option.value === this.value,
			) || null;
		},
	},
	methods: {
		onInput( event: PropertyValueRelationMenuItem ): void {
			this.$emit( 'input', event.value );
		},
	},
} );
</script>

<style lang="scss">
	// will be removed once dropdown component is implemented in the DS
	.querybuilder-dropdown__select {
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
