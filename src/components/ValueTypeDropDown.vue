<template>
	<div class="valuetype-dropdown">
		<CdxField class="valuetype-dropdown__field">
			<CdxSelect
				ref="select"
				v-model:selected="selected"
				:menu-items="optionItems"
				:disabled="disabled"
				aria-labelledby="value-dropdown__label"
			/>
			<template #label>
				<span id="value-dropdown__label" class="valuetype-dropdown__label">
					{{ $i18n( "query-builder-value-type-label" ) }}
				</span>
			</template>
		</CdxField>
	</div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { defineComponent } from '@/compat';
import PropertyValueRelation, {
	BasePropertyValueRelation,
	RangePropertyValueRelation,
} from '@/data-model/PropertyValueRelation';
import { CdxField, CdxSelect } from '@wikimedia/codex';

export declare type MenuItem = {
	label: string;
	description: string;
	tag?: string;
};

interface PropertyValueRelationMenuItem extends MenuItem {
	value: PropertyValueRelation;
}

export default defineComponent( {
	name: 'ValueTypeDropDown',
	components: {
		CdxField,
		CdxSelect,
	},
	props: {
		modelValue: {
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
	emits: [ 'update:modelValue' ],
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
		selected: {
			get(): PropertyValueRelationMenuItem | null {
				return ( this.optionItems.find(
					( option: PropertyValueRelationMenuItem ) => option.value === this.modelValue,
				) ).value || null;
			},
			set( value: PropertyValueRelationMenuItem ) {
				this.$emit( 'update:modelValue', value );
			},
		},
	},
	mounted() {
		// TODO: Workaround for comp. build, remove this after fully migrated to vue 3
		this.$refs.select.$refs.handle.setAttribute( 'aria-expanded', 'false' );
	},
} );
</script>

<style lang="scss">
	// TODO: this import only works in dev, in production the styles are
	// taken from the bundled css. Remove this when it's clear what's
	// happening
	@import '@wikimedia/codex/dist/codex.style.css';

	// override codex style that is making the icon appear on the left
	.cdx-select-vue__indicator {
		inset-inline-end: 12px;
		inset-inline-start: unset;
	}

	.valuetype-dropdown {
		// Make the label invisible, but keep it's space. `visibility: hidden`
		// prevents screen readers from accessing the content
		&__label {
			color: transparent;
			user-select: none;
		}
	}
</style>
