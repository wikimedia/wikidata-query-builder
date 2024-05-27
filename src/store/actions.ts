import allowedDatatypes from '@/allowedDataTypes';
import ConditionValues from '@/form/ConditionValues';
import FormatValueRepository from '@/data-access/FormatValueRepository';
import ParseValueRepository from '@/data-access/ParseValueRepository';
import Validator from '@/form/Validator';
import QueryDeserializer from '@/serialization/QueryDeserializer';
import { MenuItem } from '@wmde/wikit-vue-components/dist/components/MenuItem';
import {
	ConditionRow,
	DateValue,
	DEFAULT_LIMIT,
	ItemValue,
	QuantityValue,
} from './RootState';
import SearchResult from '@/data-access/SearchResult';
import QueryBuilderError from '@/data-model/QueryBuilderError';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import MetricsCollector from '@/data-access/MetricsCollector';
import SearchEntityRepository from '@/data-access/SearchEntityRepository';
import SearchOptions from '@/data-access/SearchOptions';
import ConditionRelation from '@/data-model/ConditionRelation';
import ReferenceRelation from '@/data-model/ReferenceRelation';
import Property from '@/data-model/Property';
import { useStore } from '@/store/index';
import { getFreshConditionRow } from './index';

export default (
	searchEntityRepository: SearchEntityRepository,
	metricsCollector: MetricsCollector,
	parseValueRepository: ParseValueRepository,
	formatValueRepository: FormatValueRepository,
// TODO: Specify return type, it's not supported natively right now https://github.com/vuejs/pinia/discussions/1324
// eslint-disable-next-line max-len
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
) => ( {
	async searchProperties(
		options: SearchOptions ): Promise<SearchResult[]> {
		const searchResults = await searchEntityRepository.searchProperties(
			options.search,
			options.limit,
			options.offset,
		);
		return searchResults.map( ( searchResult: MenuItem & SearchResult ) => {
			if ( !allowedDatatypes.includes( searchResult.datatype ) ) {
				searchResult.tag = 'query-builder-property-lookup-limited-support-tag';
			}
			return searchResult;
		} );
	},
	async searchItemValues(
		options: SearchOptions ): Promise<SearchResult[]> {
		return await searchEntityRepository.searchItemValues(
			options.search,
			options.limit,
			options.offset,
		);
	},
	async searchLexemeValues(
		options: SearchOptions ): Promise<SearchResult[]> {
		return await searchEntityRepository.searchLexemeValues(
			options.search,
			options.limit,
			options.offset,
		);
	},
	async searchSenseValues(
		options: SearchOptions ): Promise<SearchResult[]> {
		return await searchEntityRepository.searchSenseValues(
			options.search,
			options.limit,
			options.offset,
		);
	},
	async searchFormValues(
		options: SearchOptions ): Promise<SearchResult[]> {
		return await searchEntityRepository.searchFormValues(
			options.search,
			options.limit,
			options.offset,
		);
	},
	async updateDateValue(
		payload: { rawInput: string; conditionIndex: number },
	): Promise<void> {
		const store = useStore();
		store.clearValue( payload.conditionIndex );
		store.clearFieldErrors( {
			conditionIndex: payload.conditionIndex,
			errorsToClear: 'value',
		},
		);

		let parsedValue;
		try {
			[ parsedValue ] = await parseValueRepository.parseValues( [ payload.rawInput ], 'time' );
		} catch ( e ) {
			const errorDateValue: DateValue = {
				parseResult: null,
				formattedValue: ( e as Error ).message,
			};

			store.setValue( { value: errorDateValue, conditionIndex: payload.conditionIndex } );
			store.setFieldErrors(
				{
					index: payload.conditionIndex,
					errors: {
						valueError: { type: 'error', message: ( e as Error ).message },
					},
				},
			);
			return;
		}

		const propertyId = store.property( payload.conditionIndex )?.id;
		const formattedValue = await formatValueRepository.formatValue( parsedValue, propertyId as string );

		const validDateValue: DateValue = {
			parseResult: parsedValue,
			formattedValue,
		};
		store.setValue( {
			value: validDateValue,
			conditionIndex: payload.conditionIndex,
		} );
	},
	updateValue(
		payload: { value: string | null | SearchResult | DateValue | QuantityValue | ItemValue | SearchResult;
			conditionIndex: number; } ): void {
		const store = useStore();
		store.clearFieldErrors(
			{
				conditionIndex: payload.conditionIndex,
				errorsToClear: 'value',
			},
		);
		const datatype = store.datatype( payload.conditionIndex );
		if ( datatype === 'time' && payload.value ) {
			store.updateDateValue( { rawInput: payload.value as string, conditionIndex: payload.conditionIndex } );
			return;
		}
		store.setValue( payload );
	},
	unsetProperty( conditionIndex: number ): void {
		const store = useStore();
		store.conditionRows[ conditionIndex ].propertyData.isPropertySet = false;
		this.clearFieldErrors(
			{
				conditionIndex,
				errorsToClear: 'property',
			},
		);
	},
	updateProperty(
		payload: { property: { label: string; id: string; datatype: string }; conditionIndex: number } ): void {

		const store = useStore();
		const oldDatatype = store.datatype( payload.conditionIndex );
		if ( oldDatatype && oldDatatype !== payload.property.datatype ) {
			store.clearValue( payload.conditionIndex );
		}

		store.setProperty( payload );
		if ( !allowedDatatypes.includes( payload.property.datatype ) ) {
			store.setConditionAsLimitedSupport( payload.conditionIndex );
		} else {
			store.clearFieldErrors(
				{
					conditionIndex: payload.conditionIndex,
					errorsToClear: 'property',
				},
			);
		}
	},
	updatePropertyValueRelation(
		payload: { propertyValueRelation: PropertyValueRelation; conditionIndex: number } ): void {
		const store = useStore();
		store.conditionRows[ payload.conditionIndex ].propertyValueRelationData.value = payload.propertyValueRelation;
	},
	setReferenceRelation(
		payload: { referenceRelation: ReferenceRelation; conditionIndex: number } ): void {
		const store = useStore();
		store.conditionRows[ payload.conditionIndex ].referenceRelation = payload.referenceRelation;
	},
	setNegate(
		payload: { value: boolean; conditionIndex: number } ): void {
		const store = useStore();
		store.conditionRows[ payload.conditionIndex ].negate = payload.value;
	},
	setLimit( limit: number ): void {
		const store = useStore();
		store.limit = limit;
	},
	setUseLimit( useLimit: boolean ): void {
		const store = useStore();
		store.useLimit = useLimit;
	},
	setOmitLabels( omitLabels: boolean ): void {
		const store = useStore();
		store.omitLabels = omitLabels;
	},
	setSubclasses(
		payload: { subclasses: boolean; conditionIndex: number } ): void {
		const store = useStore();
		store.conditionRows[ payload.conditionIndex ].subclasses = payload.subclasses;
	},
	setConditionRelation(
		payload: { value: ConditionRelation | null; conditionIndex: number } ): void {
		const store = useStore();
		store.conditionRows[ payload.conditionIndex ].conditionRelation = payload.value;
	},
	setErrors( errors: QueryBuilderError[] ): void {
		const store = useStore();
		store.errors = errors;
	},
	incrementMetric( metric: string ): void {
		metricsCollector.increment( metric );
	},
	addCondition(): void {
		const store = useStore();
		store.conditionRows.push( getFreshConditionRow( store.conditionRows.length === 0 ) );
	},
	removeCondition( conditionIndex: number ): void {
		const store = useStore();
		store.conditionRows.splice( conditionIndex, 1 );
		if ( store.conditionRows.length === 1 ) {
			store.conditionRows[ 0 ].conditionRelation = null;
		}
	},
	setConditionAsLimitedSupport( conditionIndex: number ): void {
		const store = useStore();
		store.updatePropertyValueRelation(
			{ propertyValueRelation: PropertyValueRelation.Regardless, conditionIndex },
		);
		store.updateValue( { value: null, conditionIndex } );
		store.setFieldErrors(
			{
				index: conditionIndex,
				errors: {
					propertyError: {
						type: 'warning',
						message: 'query-builder-property-lookup-limited-support-note',
					},
				},
			},
		);
	},
	validateForm(): void {
		const store = useStore();
		const validator = new Validator(
			store.conditionRows.map( ( condition: ConditionRow ): ConditionValues => {
				// TODO: refactor ConditionValues to match ConditionRow and remove this mapping
				return {
					property: condition.propertyData.isPropertySet ? condition.propertyData : null,
					value: condition.valueData.value,
					propertyValueRelation: condition.propertyValueRelationData.value,
				};
			} ),
		);
		const validationResult = validator.validate();
		store.setErrors( validationResult.formErrors );

		// set field errors for each row
		validationResult.fieldErrors.forEach( ( errors, conditionIndex ) => {
			store.setFieldErrors(
				{
					index: conditionIndex,
					errors: {
						propertyError: errors.property,
						valueError: errors.value,
					},
				},
			);
		} );

		// re-set limited support warning again where applicable
		store.conditionRows.forEach( ( conditionRow, index ) => {
			const datatype = conditionRow.propertyData?.datatype;
			if ( datatype && !allowedDatatypes.includes( datatype ) ) {
				store.setConditionAsLimitedSupport( index );
			}
		} );

		store.validateLimit();
	},
	validateLimit(): void {
		const store = useStore();
		if ( store.limit === undefined ) {
			store.setLimit( DEFAULT_LIMIT );
			return;
		}
		if ( store.useLimit && store.limit === null ) {
			store.setErrors( [
				{ type: 'error', message: 'query-builder-result-error-incomplete-form' },
			] );
			return;
		}
	},
	parseState( payload: string ): Promise<unknown> {
		const deserializer = new QueryDeserializer();
		const store = useStore();
		try {
			const rootState = deserializer.deserialize( payload );
			store.$patch( rootState );
		} catch ( e ) {
			// do nothing if parameter is invalid
			return Promise.resolve();
		}

		return store.searchForEntities();
	},
	searchForEntities(): Promise<unknown> {
		// search for all the entity IDs in the state, so that they can be shown with their labels
		const promises: Promise<unknown>[] = [];

		const store = useStore();
		store.conditionRows.forEach( ( conditionRow, conditionIndex ) => {
			const propertyId = conditionRow.propertyData.id;
			promises.push(
				searchEntityRepository.searchProperties( propertyId, 1, 0 )
					.then( ( searchResults ) => {
						const searchResult = searchResults[ 0 ];
						const currentConditionRow = store.conditionRows[ conditionIndex ];
						if (
							!searchResult || searchResult.id !== propertyId ||
							!currentConditionRow || currentConditionRow.propertyData.id !== propertyId
						) {
							return;
						}
						return store.updateProperty( {
							property: searchResult,
							conditionIndex,
						} );
					} ),
			);

			if ( conditionRow.propertyData.datatype === 'wikibase-item' ) {
				const itemId = ( conditionRow.valueData.value as ItemValue ).id;
				promises.push(
					searchEntityRepository.searchItemValues( itemId, 1, 0 )
						.then( ( searchResults ) => {
							const searchResult = searchResults[ 0 ];
							const currentConditionRow = store.conditionRows[ conditionIndex ];
							if (
								!searchResult || searchResult.id !== itemId || !currentConditionRow ||
								( currentConditionRow.valueData.value as ItemValue )?.id !== itemId
							) {
								return;
							}
							return store.updateValue( {
								value: searchResult,
								conditionIndex,
							} );
						} ),
				);
			}
		} );

		return Promise.all( promises );
	},
	clearValue( conditionIndex: number ): void {
		const store = useStore();
		store.conditionRows[ conditionIndex ].valueData.value = null;
	},
	setProperty( payload: { property: Property | null; conditionIndex: number } ): void {
		const store = useStore();
		store.conditionRows[ payload.conditionIndex ].propertyData = {
			...store.conditionRows[ payload.conditionIndex ].propertyData,
			...payload.property,
		};
		store.conditionRows[ payload.conditionIndex ].propertyData.isPropertySet = true;
	},
	clearFieldErrors(
		payload: {
			conditionIndex: number;
			errorsToClear: 'property'|'value'|'both';
		},
	): void {
		const store = useStore();
		if ( payload.errorsToClear === 'property' || payload.errorsToClear === 'both' ) {
			store.conditionRows[ payload.conditionIndex ].propertyData.propertyError = null;
		}
		if ( payload.errorsToClear === 'value' || payload.errorsToClear === 'both' ) {
			store.conditionRows[ payload.conditionIndex ].valueData.valueError = null;
		}
	},
	setValue( payload: { value: string | DateValue | null | SearchResult | QuantityValue | ItemValue;
		conditionIndex: number; } ): void {
		const store = useStore();
		store.conditionRows[ payload.conditionIndex ].valueData.value = payload.value;
	},
	setFieldErrors(
		payload: {
			index: number;
			errors: {
				propertyError?: QueryBuilderError|null;
				valueError?: QueryBuilderError|null;
			};
		},
	): void {
		const store = useStore();
		if ( payload.errors.propertyError !== undefined ) {
			store.conditionRows[ payload.index ].propertyData.propertyError = payload.errors.propertyError;
		}
		if ( payload.errors.valueError !== undefined ) {
			store.conditionRows[ payload.index ].valueData.valueError = payload.errors.valueError;
		}
	},
} );
