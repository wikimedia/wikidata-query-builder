import { Store } from 'vuex';
import createActions from './actions';
import mutations from './mutations';
import getters from './getters';
import QueryBuilderServices from '@/QueryBuilderServices';
import RootState, { ConditionRow, PropertyData } from '@/store/RootState';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import QueryBuilderError from '@/data-model/QueryBuilderError';
import ConditionRelation from '@/data-model/ConditionRelation';
import ReferenceRelation from '@/data-model/ReferenceRelation';

export function newEmptyPropertyData( propertyError: QueryBuilderError | null = null ): PropertyData {
	return {
		label: '',
		id: '',
		datatype: null,
		isPropertySet: false,
		propertyError,
	};
}

export function getFreshConditionRow( isFirstCondition: boolean ): ConditionRow {
	return {
		propertyData: newEmptyPropertyData(),
		valueData: {
			value: null,
			valueError: null,
		},
		propertyValueRelationData: {
			value: PropertyValueRelation.Matching,
		},
		referenceRelation: ReferenceRelation.Regardless,
		subclasses: false,
		negate: false,
		conditionRelation: isFirstCondition ? null : ConditionRelation.And,
		conditionId: `condition-id-${Math.random()}`,
	};
}

export function getInitialState(): RootState {
	return {
		conditionRows: [ getFreshConditionRow( true ) ],
		errors: [],
		limit: 100,
		useLimit: true,
		omitLabels: false,
	};
}

export function createStore( services: QueryBuilderServices ): Store<RootState> {

	return new Store( {
		state: getInitialState(),
		actions: createActions(
			services.get( 'searchEntityRepository' ),
			services.get( 'metricsCollector' ),
			services.get( 'parseValueRepository' ),
			services.get( 'formatValueRepository' ),
		),
		mutations,
		getters,
		modules: {},
	} );

}
