<template>
	<div class="query-condition-references">
		<CdxField>
			<CdxSelect
				ref="select"
				v-model:selected="selected"
				class="query-condition-references__select"
				:menu-items="optionItems"
				:disabled="disabled"
				:aria-label="$i18n( 'query-builder-reference-relation-label' )"
			/>
			<template #label>
				{{ $i18n( 'query-builder-reference-relation-label' ) }}
				<InfoTooltip
					position="top"
					:message="$i18n( 'query-builder-reference-relation-tooltip' )"
				/>
			</template>
		</CdxField>
	</div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { defineComponent } from '@/compat';
import ReferenceRelation from '@/data-model/ReferenceRelation';
import { MenuItem } from '@/types';
import { CdxSelect, CdxField } from '@wikimedia/codex';
import InfoTooltip from '@/components/InfoTooltip.vue';

interface ReferenceRelationMenuItem extends MenuItem {
	value: ReferenceRelation;
}

export default defineComponent( {
	name: 'ReferenceRelationDropDown',
	components: {
		CdxField,
		CdxSelect,
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
		selected: {
			get(): ReferenceRelationMenuItem | null {
				return ( this.optionItems.find(
					( option: ReferenceRelationMenuItem ) => option.value === this.modelValue,
				) ).value || null;
			},
			set( value: ReferenceRelationMenuItem ) {
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
.cdx-select-vue {
	inline-size: 100%;
}
</style>
