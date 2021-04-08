<template>
	<div class="query-condition-references">
		<Dropdown
			class="query-condition-references__select"
			@input="onInput"
			:value="selected"
			:label="$i18n('query-builder-reference-relation-label')"
			:menuItems="optionItems"
			:disabled="disabled"
		>
			<template v-slot:suffix>
				<InfoTooltip
					position="top"
					:message="$i18n('query-builder-reference-relation-tooltip')"
				/></template>
		</Dropdown>
	</div>

</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import ReferenceRelation from '@/data-model/ReferenceRelation';
import { MenuItem } from '@wmde/wikit-vue-components/dist/components/MenuItem';
import { Dropdown } from '@wmde/wikit-vue-components';
import InfoTooltip from '@/components/InfoTooltip.vue';

interface ReferenceRelationMenuItem extends MenuItem {
	value: ReferenceRelation;
}

export default Vue.extend( {
	name: 'ReferenceRelationDropDown',
	props: {
		value: {
			type: String as PropType<ReferenceRelation>,
			required: true,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	methods: {
		onInput( event: ReferenceRelationMenuItem ): void {
			this.$emit( 'input', event.value );
		},
	},
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
				( option: ReferenceRelationMenuItem ) => option.value === this.value,
			) || null;
		},
	},
	components: {
		Dropdown,
		InfoTooltip,
	},
} );
</script>
