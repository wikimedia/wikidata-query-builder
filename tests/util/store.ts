import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import RootState from '@/store/RootState';
import { defineStore } from 'pinia';
import ReferenceRelation from '@/data-model/ReferenceRelation';
import createActions from '@/store/actions';
import defaultGetters from '@/store/getters';
import { Services } from '@/QueryBuilderServices';

export function getFreshRootState(): RootState {
	return {
		conditionRows: [ {
			valueData: { value: 'foo', valueError: null },
			propertyData: {
				id: 'P123',
				label: 'abc',
				datatype: 'string',
				isPropertySet: true,
				propertyError: null,
			},
			propertyValueRelationData: { value: PropertyValueRelation.Matching },
			referenceRelation: ReferenceRelation.Regardless,
			conditionId: '0.123',
			conditionRelation: null,
			subclasses: false,
			negate: false,
		} ],
		limit: 0,
		useLimit: false,
		omitLabels: true,
		errors: [],
	};
}
// TODO: Specify return type, it's not supported natively right now: https://github.com/vuejs/pinia/discussions/1324
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createActionsWithMockServices(
	serviceOverrides: Partial<Services> = {},
) {
	return createActions(
		serviceOverrides.searchEntityRepository ?? {
			searchProperties: jest.fn(),
			searchItemValues: jest.fn(),
			searchLexemeValues: jest.fn(),
			searchSenseValues: jest.fn(),
			searchFormValues: jest.fn(),
		},
		serviceOverrides.metricsCollector ?? {
			increment: jest.fn(),
		},
		serviceOverrides.parseValueRepository ?? {
			parseValues: jest.fn(),
		},
		serviceOverrides.formatValueRepository ?? {
			formatValue: jest.fn(),
		},
	);
}

export const getMockedGetters = {
	// return {
	getConditionRows: jest.fn().mockReturnValue( jest.fn().mockReturnValue( [] ) ),
	property: jest.fn().mockReturnValue( jest.fn() ),
	propertyError: jest.fn().mockReturnValue( jest.fn().mockReturnValue( null ) ),
	datatype: jest.fn().mockReturnValue( jest.fn() ),
	value: jest.fn().mockReturnValue( jest.fn() ),
	valueError: jest.fn().mockReturnValue( jest.fn().mockReturnValue( null ) ),
	negate: jest.fn().mockReturnValue( jest.fn() ),
	limitedSupport: jest.fn().mockReturnValue( jest.fn().mockReturnValue( false ) ),
	subclasses: jest.fn().mockReturnValue( jest.fn().mockReturnValue( false ) ),
	propertyValueRelation: jest.fn().mockReturnValue(
		jest.fn().mockReturnValue( PropertyValueRelation.Matching ),
	),
	referenceRelation: jest.fn().mockReturnValue(
		jest.fn().mockReturnValue( ReferenceRelation.Regardless ),
	),
	conditionRelation: jest.fn().mockReturnValue( jest.fn().mockReturnValue( null ) ),
	getErrors: jest.fn().mockReturnValue( [] ),
	// };
};

// TODO: Specify return type for `defineMockStore`
// eslint-disable-next-line max-len
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export const defineMockStore = ( serviceOverrides: Partial<Services> = {} ) => defineStore( 'store', {
	state: (): RootState => getFreshRootState(),
	getters: defaultGetters,
	actions: createActionsWithMockServices( serviceOverrides ),
} );
