<template>
	<QuantityInput
		:label="$i18n( 'query-builder-quantity-value-label' )"
		:error="quantityError ? { message: $i18n( quantityError.message ), type: quantityError.type } : null"
		:error-cause="quantityError ? quantityError.subproperty : null"
		:number-input-value.sync="numberInputValue"
		:number-input-placeholder="$i18n( 'query-builder-quantity-value-number-input-placeholder' )"
		:unit-lookup-value.sync="unitLookupValue"
		:unit-lookup-placeholder="$i18n( 'query-builder-quantity-value-unit-lookup-input-placeholder' )"
		:unit-lookup-label="$i18n( 'query-builder-quantity-value-unit-lookup-label' )"
		:unit-lookup-menu-items="searchResults"
		:unit-lookup-search-input.sync="search"
		:disabled="disabled"
		@update:numberInputValue="onValueChange"
		@update:unitLookupValue="onValueChange"
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
	</QuantityInput>
</template>

<script lang="ts">

import { QuantityInput } from '@wmde/wikit-vue-components';
import Vue, { PropType } from 'vue';
import { MenuItem } from '@wmde/wikit-vue-components/dist/components/MenuItem';
import SearchOptions from '@/data-access/SearchOptions';
import SearchResult from '@/data-access/SearchResult';
import InfoTooltip from '@/components/InfoTooltip.vue';
import { QuantityError } from '@/data-model/QueryBuilderError';
import QuantityValidator from '@/form/QuantityValidator';
import { QuantityValue } from '@/store/RootState';
import debounce from 'lodash/debounce';

const NUMBER_OF_SEARCH_RESULTS = 12;

export default Vue.extend( {
	name: 'QuantityValueInput',
	components: {
		QuantityInput,
		InfoTooltip,
	},
	props: {
		value: {
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
	data() {
		return {
			search: '',
			searchResults: [] as MenuItem[],
			topItemIndex: 1,
			numberInputValue: this.value === null ? null : this.value.value.toString(),
			unitLookupValue: this.value === null ? null : this.value.unit,
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

			this.$emit( 'input', value );
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
			return this.$store.dispatch( 'searchItemValues', options );
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
		if ( this.value?.unit?.id && !this.search ) {
			this.search = this.value.unit.id;
		}
	},
} );
</script>
