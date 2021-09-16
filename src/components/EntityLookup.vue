<template>
	<Lookup
		:value="value"
		@input="$emit( 'input', $event )"
		:error="error ? {message: $i18n(error.message), type: error.type} : null"
		:menu-items="searchResults"
		:search-input.sync="search"
		:placeholder="placeholder"
		:label="label"
		:disabled="disabled"
		v-on:scroll="handleScroll"
	>
		<template
			v-slot:no-results
		>{{ noMatchFoundMessage }}</template>
		<template v-if="tooltip" v-slot:suffix>
			<InfoTooltip
				position="top-end"
				:message="tooltip"
			/></template>
	</Lookup>
</template>

<script lang="ts">
import { MenuItem } from '@wmde/wikit-vue-components/dist/components/MenuItem';
import Vue, { PropType } from 'vue';
import debounce from 'lodash/debounce';

import { Lookup } from '@wmde/wikit-vue-components';
import SearchResult from '@/data-access/SearchResult';
import SearchOptions from '@/data-access/SearchOptions';
import InfoTooltip from '@/components/InfoTooltip.vue';

const NUMBER_OF_SEARCH_RESULTS = 12;

export default Vue.extend( {
	name: 'EntityLookup',
	components: {
		InfoTooltip,
		Lookup,
	},
	data() {
		return {
			search: '',
			searchResults: [] as MenuItem[],
			topItemIndex: 1,
			debouncedUpdateMenuItems: null as Function | null,
		};
	},
	methods: {
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
			const searchResults = await this.searchForMenuItems( searchOptions );
			return searchResults.map(
				( item: MenuItem & SearchResult ) => {
					item.tag = item.tag && this.$i18n( item.tag );
					return item;
				},
			);
		},
		updateMenuItems( searchOptions: SearchOptions ): void {
			if ( this.debouncedUpdateMenuItems === null ) {
				this.debouncedUpdateMenuItems = debounce(
					async ( debouncedSearchOptions: SearchOptions ) => {
						this.searchResults = await this.searchForMenuItems( debouncedSearchOptions );
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
			}
		},
		search( newSearchString: string ): void {
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
		value( newValue: MenuItem ): void {
			if ( newValue.id === this.value.id ) {
				this.search = newValue.label;
			}
		},
	},
	mounted() {
		if ( this.value && this.value.label && !this.search ) {
			this.search = this.value.label;
		}
	},
	props: {
		searchForMenuItems: {
			type: Function as PropType<( searchOptions: SearchOptions ) => Promise<SearchResult[]>>,
			required: true,
		},
		value: {
			type: Object as PropType<MenuItem>,
			default: null,
		},
		error: {
			type: Object,
			default: null,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		label: {
			type: String,
			required: true,
		},
		noMatchFoundMessage: {
			type: String,
			required: true,
		},
		placeholder: {
			type: String,
			default: '',
		},
		tooltip: {
			type: String,
			default: '',
		},
	},
} );
</script>
