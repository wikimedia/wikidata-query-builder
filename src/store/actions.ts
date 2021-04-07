import allowedDatatypes from '@/allowedDataTypes';
import ConditionValues from '@/form/ConditionValues';
import Validator from '@/form/Validator';
import QueryDeserializer from '@/serialization/QueryDeserializer';
import { MenuItem } from '@wmde/wikit-vue-components/dist/components/MenuItem';
import { ActionContext, ActionTree } from 'vuex';
import RootState, { ConditionRow, DEFAULT_LIMIT } from './RootState';
import SearchResult from '@/data-access/SearchResult';
import Error from '@/data-model/Error';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import MetricsCollector from '@/data-access/MetricsCollector';
import SearchEntityRepository from '@/data-access/SearchEntityRepository';
import SearchOptions from '@/data-access/SearchOptions';
import ConditionRelation from '@/data-model/ConditionRelation';
import ReferenceRelation from '@/data-model/ReferenceRelation';

export default (
	searchEntityRepository: SearchEntityRepository,
	metricsCollector: MetricsCollector,
): ActionTree<RootState, RootState> => ( {
	async searchProperties(
		_context: ActionContext<RootState, RootState>,
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
		_context: ActionContext<RootState, RootState>,
		options: SearchOptions ): Promise<SearchResult[]> {
		// check for empty
		return await searchEntityRepository.searchItemValues(
			options.search,
			options.limit,
			options.offset,
		);
	},
	updateValue(
		context: ActionContext<RootState, RootState>,
		payload: { value: string; conditionIndex: number } ): void {
		context.commit( 'setValue', payload );
		context.commit(
			'clearFieldErrors',
			{
				conditionIndex: payload.conditionIndex,
				errorsToClear: 'value',
			},
		);
	},
	unsetProperty( context: ActionContext<RootState, RootState>, conditionIndex: number ): void {
		context.commit( 'unsetProperty', conditionIndex );
		context.commit(
			'clearFieldErrors',
			{
				conditionIndex,
				errorsToClear: 'property',
			},
		);
	},
	updateProperty( context: ActionContext<RootState, RootState>,
		payload: { property: { label: string; id: string; datatype: string }; conditionIndex: number } ): void {

		const oldDatatype = context.getters.datatype( payload.conditionIndex );
		if ( oldDatatype && oldDatatype !== payload.property.datatype ) {
			context.commit( 'clearValue', payload.conditionIndex );
		}

		context.commit( 'setProperty', payload );
		if ( !allowedDatatypes.includes( payload.property.datatype ) ) {
			context.dispatch( 'setConditionAsLimitedSupport', payload.conditionIndex );
		} else {
			context.commit(
				'clearFieldErrors',
				{
					conditionIndex: payload.conditionIndex,
					errorsToClear: 'property',
				},
			);
		}
	},
	updatePropertyValueRelation( context: ActionContext<RootState, RootState>,
		payload: { propertyValueRelation: PropertyValueRelation; conditionIndex: number } ): void {
		context.commit( 'setPropertyValueRelation', payload );
	},
	setReferenceRelation( context: ActionContext<RootState, RootState>,
		payload: { referenceRelation: ReferenceRelation; conditionIndex: number } ): void {
		context.commit( 'setReferenceRelation', payload );
	},
	setNegate(
		context: ActionContext<RootState, RootState>,
		payload: { value: boolean; conditionIndex: number } ): void {
		context.commit( 'setNegate', payload );
	},
	setLimit( context: ActionContext<RootState, RootState>, limit: number ): void {
		context.commit( 'setLimit', limit );
	},
	setUseLimit( context: ActionContext<RootState, RootState>, useLimit: boolean ): void {
		context.commit( 'setUseLimit', useLimit );
	},
	setOmitLabels( context: ActionContext<RootState, RootState>, omitLabels: boolean ): void {
		context.commit( 'setOmitLabels', omitLabels );
	},
	setSubclasses( context: ActionContext<RootState, RootState>,
		payload: { subclasses: boolean; conditionIndex: number } ): void {
		context.commit( 'setSubclasses', payload );
	},
	setConditionRelation(
		context: ActionContext<RootState, RootState>,
		payload: { value: ConditionRelation | null; conditionIndex: number } ): void {
		context.commit( 'setConditionRelation', payload );
	},
	setErrors( context: ActionContext<RootState, RootState>, errors: Error[] ): void {
		context.commit( 'setErrors', errors );
	},
	incrementMetric( context: ActionContext<RootState, RootState>, metric: string ): void {
		metricsCollector.increment( metric );
	},
	addCondition( context: ActionContext<RootState, RootState> ): void {
		context.commit( 'addCondition' );
	},
	removeCondition( context: ActionContext<RootState, RootState>, conditionIndex: number ): void {
		context.commit( 'removeCondition', conditionIndex );
	},
	setConditionAsLimitedSupport( context: ActionContext<RootState, RootState>, conditionIndex: number ): void {
		context.dispatch(
			'updatePropertyValueRelation',
			{ propertyValueRelation: PropertyValueRelation.Regardless, conditionIndex },
		);
		context.dispatch( 'updateValue', { value: '', conditionIndex } );
		context.commit(
			'setFieldErrors',
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
	validateForm( context: ActionContext<RootState, RootState> ): void {

		const validator = new Validator(
			context.rootState.conditionRows.map( ( condition: ConditionRow ): ConditionValues => {
				// TODO: refactor ConditionValues to match ConditionRow and remove this mapping
				return {
					property: condition.propertyData.isPropertySet ? condition.propertyData : null,
					value: condition.valueData.value,
					propertyValueRelation: condition.propertyValueRelationData.value,
				};
			} ),
		);
		const validationResult = validator.validate();
		context.commit( 'setErrors', validationResult.formErrors );

		// set field errors for each row
		validationResult.fieldErrors.forEach( ( errors, conditionIndex ) => {
			context.commit(
				'setFieldErrors',
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
		context.rootState.conditionRows.forEach( ( conditionRow, index ) => {
			const datatype = conditionRow.propertyData?.datatype;
			if ( datatype && !allowedDatatypes.includes( datatype ) ) {
				context.dispatch( 'setConditionAsLimitedSupport', index );
			}
		} );

		context.dispatch( 'validateLimit' );
	},
	validateLimit( context: ActionContext<RootState, RootState> ): void {
		if ( context.rootState.limit === undefined ) {
			context.commit( 'setLimit', DEFAULT_LIMIT );
			return;
		}
		if ( context.rootState.useLimit && context.rootState.limit === null ) {
			context.commit( 'setErrors', [
				{ type: 'error', message: 'query-builder-result-error-incomplete-form' },
			] );
			return;
		}
	},
	parseState( context: ActionContext<RootState, RootState>, payload: string ): void {
		const deserializer = new QueryDeserializer();
		try {
			const rootState = deserializer.deserialize( payload );
			context.commit( 'setState', rootState );
		} catch ( e ) {
			// do nothing if parameter is invalid
		}
	},
} );
