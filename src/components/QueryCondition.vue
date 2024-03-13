<template>
	<div class="query-condition">
		<NegationToggle
			v-model="negateValue"
			class="query-condition__toggle-button-group"
		/>
		<div class="query-condition__input-container">
			<div>
				<!-- this is needed because the vue2-common eslint configuration is not recognizing
				the methods passed through mapGetters -->
				<!-- eslint-disable vue/no-undef-properties -->
				<PropertyLookup
					v-model="selectedProperty"
					class="query-condition__property-lookup"
					:error="propertyError( conditionIndex )"
				/>
			</div>
			<div>
				<ValueTypeDropDown
					v-model="selectedPropertyValueRelation"
					class="query-condition__value-type-dropdown"
					:disabled="limitedSupport( conditionIndex )"
					:datatype="datatype"
				/>
			</div>
			<div>
				<ValueInput
					v-model="conditionValue"
					class="query-condition__value-input"
					:disabled="isValueInputDisabled()"
					:error="valueError"
					:datatype="datatype"
				/>
				<SubclassCheckbox
					v-if="isSubclassCheckboxVisible"
					:disabled="isValueInputDisabled()"
					:is-checked="subclasses( conditionIndex )"
					@subclass-check="setSubclasses" />
			</div>
			<!-- eslint-enable -->
			<div>
				<ReferenceRelationDropDown
					v-model="selectedReferenceRelation"
					class="query-condition__references"
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
import { defineComponent } from '@/compat';

import ValueInput from '@/components/ValueInput.vue';
import DeleteConditionButton from '@/components/DeleteConditionButton.vue';
import PropertyLookup from '@/components/PropertyLookup.vue';
import ValueTypeDropDown from '@/components/ValueTypeDropDown.vue';
import SubclassCheckbox from '@/components/SubclassCheckbox.vue';
import SearchResult from '@/data-access/SearchResult';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import ReferenceRelationDropDown from '@/components/ReferenceRelationDropDown.vue';
import QueryBuilderError from '@/data-model/QueryBuilderError';
import { mapGetters } from 'vuex';
import NegationToggle from '@/components/NegationToggle.vue';
import ReferenceRelation from '@/data-model/ReferenceRelation';

export default defineComponent( {
	name: 'QueryCondition',
	components: {
		ValueInput,
		PropertyLookup,
		ReferenceRelationDropDown,
		ValueTypeDropDown,
		DeleteConditionButton,
		NegationToggle,
		SubclassCheckbox,
	},
	props: {
		conditionIndex: {
			type: Number,
			required: true,
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
				if ( selectedProperty.datatype !== this.$store.getters.datatype( this.conditionIndex )
				) {
					this.selectedPropertyValueRelation = PropertyValueRelation.Matching;
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
			set( modelValue: Value ): void {
				this.$store.dispatch( 'updateValue', { value: modelValue, conditionIndex: this.conditionIndex } );
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
		valueError(): QueryBuilderError | null {
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
		block-size: max-content;

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
