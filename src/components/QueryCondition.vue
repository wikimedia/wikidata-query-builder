<template>
	<div class="query-condition">
		<NegationToggle
			class="query-condition__toggle-button-group"
			v-model="negateValue"
		/>
		<div class="query-condition__input-container">
			<div>
				<PropertyLookup
					class="query-condition__property-lookup"
					v-model="selectedProperty"
					:error="propertyError(conditionIndex)"
				/>
			</div>
			<div>
				<ValueTypeDropDown
					class="query-condition__value-type-dropdown"
					v-model="selectedPropertyValueRelation"
					:disabled="limitedSupport(conditionIndex)"
				/>
			</div>
			<div>
				<ValueInput
					class="query-condition__value-input"
					:disabled="isValueInputDisabled()"
					v-model="conditionValue"
					:error="valueError"
					:datatype="datatype"
				/>
				<SubclassCheckbox
					v-if="isSubclassCheckboxVisible"
					:disabled="isValueInputDisabled()"
					@subclass-check="setSubclasses"
					:isChecked="subclasses(conditionIndex)" />
			</div>
			<div>
				<ReferenceRelationDropDown
					class="query-condition__references"
					v-model="selectedReferenceRelation"
				/>
			</div>
		</div>
		<DeleteConditionButton
			class="query-condition__remove"
			@click="removeCondition"
		/>
	</div>
</template>

<script lang="ts">
import { Value } from '@/store/RootState';
import Vue from 'vue';

import ValueInput from '@/components/ValueInput.vue';
import DeleteConditionButton from '@/components/DeleteConditionButton.vue';
import PropertyLookup from '@/components/PropertyLookup.vue';
import ValueTypeDropDown from '@/components/ValueTypeDropDown.vue';
import SubclassCheckbox from '@/components/SubclassCheckbox.vue';
import SearchResult from '@/data-access/SearchResult';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import ReferenceRelationDropDown from '@/components/ReferenceRelationDropDown.vue';
import Error from '@/data-model/Error';
import { mapGetters } from 'vuex';
import NegationToggle from '@/components/NegationToggle.vue';
import ReferenceRelation from '@/data-model/ReferenceRelation';

export default Vue.extend( {
	name: 'QueryCondition',
	props: {
		conditionIndex: {
			type: Number,
			required: true,
		},
	},
	methods: {
		isValueInputDisabled(): boolean {
			return this.selectedPropertyValueRelation === PropertyValueRelation.Regardless;
		},
		removeCondition(): void {
			this.$store.dispatch( 'removeCondition', this.conditionIndex );
		},
		setSubclasses( subclasses: boolean ): void {
			this.$store.dispatch( 'setSubclasses', { subclasses, conditionIndex: this.conditionIndex } );
		},
	},
	computed: {
		datatype(): string | null {
			return this.$store.getters.datatype( this.conditionIndex );
		},
		selectedProperty: {
			get(): SearchResult | null {
				return this.$store.getters.property( this.conditionIndex );
			},
			set( selectedProperty: SearchResult | null ): void {
				if ( selectedProperty === null ) {
					this.$store.dispatch( 'unsetProperty', this.conditionIndex );
					return;
				}
				if ( selectedProperty.datatype === 'wikibase-item' ) {
					this.$store.dispatch( 'setSubclasses', { conditionIndex: this.conditionIndex, subclasses: true } );
				} else {
					this.$store.dispatch( 'setSubclasses', { conditionIndex: this.conditionIndex, subclasses: false } );
				}
				this.$store.dispatch( 'updateProperty',
					{ property: selectedProperty, conditionIndex: this.conditionIndex },
				);
			},
		},
		isSubclassCheckboxVisible(): boolean {
			return this.$store.getters.datatype( this.conditionIndex ) === 'wikibase-item';
		},
		selectedPropertyValueRelation: {
			get(): PropertyValueRelation {
				return this.$store.getters.propertyValueRelation( this.conditionIndex );
			},
			set( selectedPropertyValueRelation: PropertyValueRelation ): void {
				if ( selectedPropertyValueRelation === PropertyValueRelation.Regardless ) {
					this.conditionValue = null;
				}

				this.$store.dispatch(
					'updatePropertyValueRelation',
					{ propertyValueRelation: selectedPropertyValueRelation, conditionIndex: this.conditionIndex },
				);
			},
		},
		selectedReferenceRelation: {
			get(): ReferenceRelation {
				return this.$store.getters.referenceRelation( this.conditionIndex );
			},
			set( selectedReferenceRelation: ReferenceRelation ): void {
				this.$store.dispatch(
					'setReferenceRelation',
					{ referenceRelation: selectedReferenceRelation, conditionIndex: this.conditionIndex },
				);
			},
		},
		conditionValue: {
			get(): Value {
				return this.$store.getters.value( this.conditionIndex );
			},
			set( value: Value ): void {
				this.$store.dispatch( 'updateValue', { value, conditionIndex: this.conditionIndex } );
			},
		},
		negateValue: {
			get(): string {
				const negate = this.$store.getters.negate( this.conditionIndex );
				return negate === true ? 'without' : 'with';
			},
			set( value: string ): void {
				if ( value !== 'with' && value !== 'without' ) {
					throw new Error( 'Unknown negate value: ' + value );
				}
				const valueBoolean = value === 'without';
				this.$store.dispatch( 'setNegate', { value: valueBoolean, conditionIndex: this.conditionIndex } );
			},
		},
		valueError(): Error | null {
			const valueError = this.$store.getters.valueError( this.conditionIndex );
			if ( valueError === null ) {
				return null;
			}
			return {
				...valueError,
				message: this.$i18n( valueError.message ),
			};
		},
		...mapGetters( [
			'propertyError',
			'limitedSupport',
			'subclasses',
		] ),
	},
	components: {
		ValueInput,
		PropertyLookup,
		ReferenceRelationDropDown,
		ValueTypeDropDown,
		DeleteConditionButton,
		NegationToggle,
		SubclassCheckbox,
	},
} );
</script>

<style scoped lang="scss">
$tinyViewportWidth: 38em; // Set so that inputs show all below each other in the smallest layout

.query-condition {
	display: flex;
	padding-block: $dimension-layout-xsmall;
	padding-inline: $dimension-layout-xsmall;
	border: $border-width-thin $border-style-base $border-color-base-subtle;
	border-radius: $border-radius-base;
	background-color: $background-color-base-default;

	@media (max-width: $tinyViewportWidth) {
		display: grid;
		padding-block: $dimension-layout-xxsmall;
		padding-inline: $dimension-layout-xxsmall;
	}

	&__remove {
		margin-inline-start: $dimension-layout-small;
		float: inline-end;
		height: max-content;

		@media (max-width: $tinyViewportWidth) {
			position: absolute;
			inset-inline-end: $dimension-layout-xsmall * 2;
		}
	}

	&__toggle-button-group {
		white-space: nowrap;
		float: inline-start;
		margin-block-start: $dimension-layout-small;
		margin-inline-end: $dimension-layout-large;

		@media (max-width: $tinyViewportWidth) {
			margin-block-start: 0;
			margin-inline-end: 0;
		}
	}

	&__input-container {
		display: grid;
		flex: 1;
		// 16em == 256px minimum-width as defined by UX
		grid-template-columns: repeat(auto-fit, minmax(16em, 1fr));
		grid-gap: $dimension-layout-xsmall;

		@media (max-width: $tinyViewportWidth) {
			padding-block-start: $dimension-layout-small;
			clear: both;
		}
	}
}

.query-condition__value-type-dropdown {
	margin-block-start: $dimension-layout-small;
}

</style>
