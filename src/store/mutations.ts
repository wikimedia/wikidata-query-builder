import RootState from './RootState';
import Property from '@/data-model/Property';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import QueryBuilderError from '@/data-model/QueryBuilderError';
import { getFreshConditionRow } from './index';
import ConditionRelation from '@/data-model/ConditionRelation';
import ReferenceRelation from '@/data-model/ReferenceRelation';

export default {
	setValue( state: RootState, payload: { value: string; conditionIndex: number } ): void {
		state.conditionRows[ payload.conditionIndex ].valueData.value = payload.value;
	},
	clearValue( state: RootState, conditionIndex: number ): void {
		state.conditionRows[ conditionIndex ].valueData.value = null;
	},
	setProperty( state: RootState, payload: { property: Property | null; conditionIndex: number } ): void {
		state.conditionRows[ payload.conditionIndex ].propertyData = {
			...state.conditionRows[ payload.conditionIndex ].propertyData,
			...payload.property,
		};
		state.conditionRows[ payload.conditionIndex ].propertyData.isPropertySet = true;
	},
	setNegate( state: RootState, payload: { value: boolean; conditionIndex: number } ): void {
		state.conditionRows[ payload.conditionIndex ].negate = payload.value;
	},
	unsetProperty( state: RootState, conditionIndex: number ): void {
		state.conditionRows[ conditionIndex ].propertyData.isPropertySet = false;
	},
	setPropertyValueRelation( state: RootState,
		payload: { propertyValueRelation: PropertyValueRelation; conditionIndex: number } ): void {
		state.conditionRows[ payload.conditionIndex ].propertyValueRelationData.value = payload.propertyValueRelation;
	},
	setReferenceRelation( state: RootState,
		payload: { referenceRelation: ReferenceRelation; conditionIndex: number } ): void {
		state.conditionRows[ payload.conditionIndex ].referenceRelation = payload.referenceRelation;
	},
	setLimit( state: RootState, limit: number | null | undefined ): void {
		state.limit = limit;
	},
	setUseLimit( state: RootState, useLimit: boolean ): void {
		state.useLimit = useLimit;
	},
	setOmitLabels( state: RootState, omitLabels: boolean ): void {
		state.omitLabels = omitLabels;
	},
	setSubclasses( state: RootState, payload: { subclasses: boolean; conditionIndex: number } ): void {
		state.conditionRows[ payload.conditionIndex ].subclasses = payload.subclasses;
	},
	setConditionRelation( state: RootState, payload: { value: ConditionRelation; conditionIndex: number } ): void {
		state.conditionRows[ payload.conditionIndex ].conditionRelation = payload.value;
	},
	setErrors( state: RootState, errors: QueryBuilderError[] ): void {
		state.errors = errors;
	},
	addCondition( state: RootState ): void {
		state.conditionRows.push( getFreshConditionRow( state.conditionRows.length === 0 ) );
	},
	removeCondition( state: RootState, conditionIndex: number ): void {
		state.conditionRows.splice( conditionIndex, 1 );
		if ( state.conditionRows.length === 1 ) {
			state.conditionRows[ 0 ].conditionRelation = null;
		}
	},
	setFieldErrors(
		state: RootState,
		payload: {
			index: number;
			errors: {
				propertyError?: QueryBuilderError|null;
				valueError?: QueryBuilderError|null;
			};
		},
	): void {
		if ( payload.errors.propertyError !== undefined ) {
			state.conditionRows[ payload.index ].propertyData.propertyError = payload.errors.propertyError;
		}
		if ( payload.errors.valueError !== undefined ) {
			state.conditionRows[ payload.index ].valueData.valueError = payload.errors.valueError;
		}
	},
	clearFieldErrors(
		state: RootState,
		payload: {
			conditionIndex: number;
			errorsToClear: 'property'|'value'|'both';
		},
	): void {
		if ( payload.errorsToClear === 'property' || payload.errorsToClear === 'both' ) {
			state.conditionRows[ payload.conditionIndex ].propertyData.propertyError = null;
		}
		if ( payload.errorsToClear === 'value' || payload.errorsToClear === 'both' ) {
			state.conditionRows[ payload.conditionIndex ].valueData.valueError = null;
		}
	},
	setState( state: RootState, payload: RootState ): void {
		Object.assign( state, payload );
	},
};
