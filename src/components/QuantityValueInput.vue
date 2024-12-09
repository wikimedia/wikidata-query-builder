<template>
	<WikitQuantityInput
		v-model:number-input-value="numberInputValue"
		v-model:unit-lookup-value="unitLookupValue"
		v-model:unit-lookup-search-input="search"
		:label="$i18n( 'query-builder-quantity-value-label' )"
		:error="quantityError ? { message: $i18n( quantityError.message ), type: quantityError.type } : null"
		:error-cause="quantityError ? quantityError.subproperty : null"
		:number-input-placeholder="$i18n( 'query-builder-quantity-value-number-input-placeholder' )"
		:unit-lookup-placeholder="$i18n( 'query-builder-quantity-value-unit-lookup-input-placeholder' )"
		:unit-lookup-label="$i18n( 'query-builder-quantity-value-unit-lookup-label' )"
		:unit-lookup-menu-items="searchResults"
		:disabled="disabled"
		@update:number-input-value="onValueChange"
		@update:unit-lookup-value="onValueChange"
		@scroll="handleScroll"
	>
		<template
			#no-results
		>
			{{ $i18n( 'query-builder-property-lookup-no-match-found' ) }}
		</template>
		<template #suffix>
			<InfoTooltip
				position="top-end"
				:message="$i18n( 'query-builder-input-value-tooltip' )"
			/>
		</template>
	</WikitQuantityInput>
</template>

<script lang="ts">
import WikitQuantityInput from './WikitQuantityInput.vue';

import { PropType } from 'vue';
import { defineComponent } from '@/compat';
import { MenuItem } from '@/types';
import SearchOptions from '@/data-access/SearchOptions';
import SearchResult from '@/data-access/SearchResult';
import InfoTooltip from '@/components/InfoTooltip.vue';
import { QuantityError } from '@/data-model/QueryBuilderError';
import QuantityValidator from '@/form/QuantityValidator';
import { QuantityValue } from '@/store/RootState';
import { useStore } from '@/store';
import debounce from 'lodash/debounce';

const NUMBER_OF_SEARCH_RESULTS = 12;

export default defineComponent( {
	name: 'QuantityValueInput',
	components: {
		WikitQuantityInput,
		InfoTooltip,
	},
	props: {
		modelValue: {
			type: Object as PropType<QuantityValue | null>,
			default: null,
		},
		error: {
			type: Object as PropType<QuantityError | null>,
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
			search: '',
			searchResults: [] as MenuItem[],
			topItemIndex: 1,
			numberInputValue: this.modelValue === null ? null : this.modelValue.value.toString(),
			unitLookupValue: this.modelValue === null ? null : this.modelValue.unit,
			debouncedUpdateMenuItems: null as ( ( arg0: SearchOptions ) => void ) | null,
			quantityError: this.error,
		};
	},
	methods: {
		parseNumberInputValue( rawValue: string | null ): number {
			if ( !( new QuantityValidator() ).isValidNumberValue( rawValue ) ) {
				this.quantityError = QuantityValidator.NUMBER_ERROR;
				return NaN;
			}

			this.quantityError = null;
			return Number( rawValue );
		},
		async onValueChange(): Promise<void> {
			await this.$nextTick();
			const value: QuantityValue = {
				value: this.parseNumberInputValue( this.numberInputValue ),
				unit: this.unitLookupValue,
				rawUnitInput: this.search,
			};

			this.$emit( 'update:modelValue', value );
		},
		async handleScroll( event: number ): Promise<void> {
			if ( this.topItemIndex <= event ) {
				this.topItemIndex += NUMBER_OF_SEARCH_RESULTS;

				const searchOptions: SearchOptions = {
					search: this.search,
					offset: this.topItemIndex,
					limit: NUMBER_OF_SEARCH_RESULTS,
				};

				this.searchResults = this.searchResults.concat(
					await this.searchEntities( searchOptions ),
				);
			}
		},
		async searchEntities( searchOptions: SearchOptions ): Promise<SearchResult[]> {
			const searchResults = await this.searchForItems( searchOptions );
			return searchResults.map(
				( item: MenuItem & SearchResult ) => {
					item.tag = item.tag && this.$i18n( item.tag );
					return item;
				},
			);
		},
		searchForItems( options: SearchOptions ): Promise<SearchResult[]> {
			const store = useStore();
			return store.searchItemValues( options );
		},
		updateMenuItems( searchOptions: SearchOptions ): void {
			if ( this.debouncedUpdateMenuItems === null ) {
				this.debouncedUpdateMenuItems = debounce(
					async ( debouncedSearchOptions: SearchOptions ) => {
						this.searchResults = await this.searchForItems( debouncedSearchOptions );
					},
					150,
				);
			}
			this.debouncedUpdateMenuItems( searchOptions );
		},
	},
	watch: {
		disabled( isDisabled: boolean ): void {
			if ( isDisabled ) {
				this.search = '';
				this.numberInputValue = '';
			}
		},
		search( newSearchString: string ): void {
			this.onValueChange();
			this.topItemIndex = 0;
			if ( !newSearchString ) {
				this.searchResults = [];
				return;
			}
			const searchOptions: SearchOptions = {
				search: newSearchString,
				limit: NUMBER_OF_SEARCH_RESULTS,
			};
			this.updateMenuItems( searchOptions );
		},
		error( error: QuantityError | null ): void {
			this.quantityError = error;
		},
	},
	mounted() {
		if ( this.modelValue?.unit?.id && !this.search ) {
			this.search = this.modelValue.unit.id;
		}
	},
} );
</script>
