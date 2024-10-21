import SearchOptions from '@/data-access/SearchOptions';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import { ConditionRow, DEFAULT_LIMIT } from '@/store/RootState';
import ConditionRelation from '@/data-model/ConditionRelation';
import ReferenceRelation from '@/data-model/ReferenceRelation';
import QueryBuilderError from '@/data-model/QueryBuilderError';
import { useStore } from '@/store/index';
import { setActivePinia, createPinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';
import { defineMockStore } from '../../util/store';

beforeEach( () => {
	setActivePinia( createPinia() );
} );

describe( 'actions', () => {

	describe( 'updateValue', () => {
		it( 'sets the value in the store', () => {
			const pinia = createTestingPinia( {
				stubActions: false,
			} );
			const store = useStore( pinia );
			const value = 'whatever';
			const conditionIndex = 0;

			store.updateValue( { value, conditionIndex } );

			expect( store.setValue ).toHaveBeenCalledWith( { value, conditionIndex } );
			expect( store.clearFieldErrors ).toHaveBeenCalledWith( {
				conditionIndex,
				errorsToClear: 'value',
			} );
		} );

		it( 'delegates to updateDateValue for datatype time', () => {
			const value = 'whatever';
			const conditionIndex = 0;

			const pinia = createTestingPinia( {
				stubActions: false,
			} );

			const store = useStore( pinia );
			// @ts-expect-error: getters are assignable in Pinia tests but TS is not recognizing it.
			store.datatype = () => 'time';
			store.updateValue( { value, conditionIndex } );

			expect( store.clearFieldErrors ).toHaveBeenCalledTimes( 2 );
			expect( store.clearFieldErrors ).toHaveBeenCalledWith( {
				conditionIndex,
				errorsToClear: 'value',
			} );
			expect( store.updateDateValue ).toHaveBeenCalledWith( { conditionIndex, rawInput: value } );
		} );
	} );

	describe( 'updateDateValue', () => {
		it( 'parses payload and formats parsedDate and stores it in the state', async () => {
			const pinia = createTestingPinia( {
				stubActions: false,
			} );
			const mockParsedValue = {};
			const mockFormatValue = '6 April 2021';

			const parseValues = jest.fn().mockResolvedValue( [ mockParsedValue ] );
			const formatValue = jest.fn().mockResolvedValue( mockFormatValue );
			const useMockStore = defineMockStore( {
				parseValueRepository: { parseValues },
				formatValueRepository: { formatValue },
			} );
			const store = useMockStore( pinia );

			// @ts-expect-error: // getters are assignable in Pinia tests but TS is not recognizing it.
			store.property = () => ( { id: 'P123' } );

			const value = '2021-04-06';
			const conditionIndex = 0;
			await store.updateDateValue( { rawInput: value, conditionIndex } );

			expect( store.clearValue ).toHaveBeenCalledWith( 0 );
			expect( store.clearFieldErrors ).toHaveBeenCalledWith(
				{ conditionIndex, errorsToClear: 'value' },
			);
			expect( parseValues ).toHaveBeenCalledWith( [ value ], 'time' );
			expect( formatValue ).toHaveBeenCalledWith( mockParsedValue, 'P123' );
			expect( store.setValue ).toHaveBeenCalledWith( {
				value: { parseResult: mockParsedValue, formattedValue: mockFormatValue },
				conditionIndex,
			} );
		} );

		it( 'parses payload and sets error if that fails', async () => {
			const someErrorMessage = 'parsing not great';
			const parseValues = jest.fn().mockRejectedValue( new Error( someErrorMessage ) );
			const formatValue = jest.fn();
			const useMockStore = defineMockStore( {
				parseValueRepository: { parseValues },
				formatValueRepository: { formatValue },
			} );
			const pinia = createTestingPinia( {
				stubActions: false,
			} );
			const store = useMockStore( pinia );
			const value = 'not a date';
			const conditionIndex = 0;

			await store.updateDateValue( { rawInput: value, conditionIndex } );

			expect( store.clearValue ).toHaveBeenCalledWith( 0 );
			expect( store.clearFieldErrors ).toHaveBeenCalledWith(
				{ conditionIndex, errorsToClear: 'value' },
			);
			expect( formatValue ).not.toHaveBeenCalled();
			expect( store.setValue ).toHaveBeenCalledWith( {
				value: { parseResult: null, formattedValue: someErrorMessage },
				conditionIndex,
			} );
			expect( store.setFieldErrors ).toHaveBeenCalledWith( {
				index: conditionIndex,
				errors: {
					valueError: {
						message: someErrorMessage,
						type: 'error',
					},
				},
			} );

		} );
	} );

	it( 'setConditionAsLimitedSupport', () => {
		const conditionIndex = 0;

		const pinia = createTestingPinia( {
			stubActions: false,
		} );
		const store = useStore( pinia );

		store.setConditionAsLimitedSupport( conditionIndex );

		expect( store.setFieldErrors ).toHaveBeenCalledWith( {
			index: conditionIndex,
			errors: {
				propertyError: {
					message: 'query-builder-property-lookup-limited-support-note',
					type: 'warning',
				},
			},
		} );
	} );

	it( 'unsetProperty', () => {
		const pinia = createTestingPinia( {
			stubActions: false,
		} );
		const store = useStore( pinia );
		const conditionIndex = 0;

		store.unsetProperty( conditionIndex );

		expect( store.unsetProperty ).toHaveBeenCalledWith( conditionIndex );
		expect( store.clearFieldErrors ).toHaveBeenCalledWith( {
			conditionIndex,
			errorsToClear: 'property',
		} );
	} );

	describe( 'updateProperty', () => {
		it( 'commits the property to the store', () => {

			const pinia = createTestingPinia( {
				stubActions: false,
			} );
			const store = useStore( pinia );

			// @ts-expect-error: // getters are assignable in Pinia tests but TS is not recognizing it.
			store.datatype = () => null;
			const property = {
				id: 'P666',
				label: 'Property label',
				datatype: 'string',
			};
			const conditionIndex = 0;

			store.updateProperty( { property, conditionIndex } );

			expect( store.setProperty ).toHaveBeenCalledWith( { property, conditionIndex } );
			expect( store.clearFieldErrors ).toHaveBeenCalledWith( {
				conditionIndex: 0,
				errorsToClear: 'property',
			} );
		} );

		it( 'handles datatypes with limited support', () => {
			const pinia = createTestingPinia( {
				stubActions: false,
			} );
			const store = useStore( pinia );
			// @ts-expect-error: getters are assignable in Pinia tests but TS is not recognizing it.
			store.datatype = () => null;
			const property = {
				id: 'P666',
				label: 'Property label',
				datatype: 'some unsupported data type',
			};
			const conditionIndex = 0;

			store.updateProperty( { property, conditionIndex } );

			expect( store.setProperty ).toHaveBeenCalledWith( { property, conditionIndex } );
			expect( store.setConditionAsLimitedSupport ).toHaveBeenCalledWith( 0 );
		} );

		it( 'clears an existing value if a property with a different datatype is selected', () => {
			const pinia = createTestingPinia( {
				stubActions: false,
			} );
			const store = useStore( pinia );
			// @ts-expect-error: getters are assignable in Pinia tests but TS is not recognizing it.
			store.datatype = () => 'string';
			const property = {
				id: 'P666',
				label: 'Property label',
				datatype: 'wikibase-item',
			};
			const conditionIndex = 0;

			store.updateProperty( { property, conditionIndex } );

			expect( store.setProperty ).toHaveBeenCalledWith( { property, conditionIndex } );
			expect( store.clearValue ).toHaveBeenCalledWith( conditionIndex );
			expect( store.clearFieldErrors ).toHaveBeenCalledWith( {
				conditionIndex: 0,
				errorsToClear: 'property',
			} );
		} );
	} );

	describe( 'searchProperties', () => {
		it( 'calls the repo and resolves with the result', async () => {
			const expectedResult = [ { label: 'postal code', limit: 'P123', datatype: 'string' } ];
			const searchProperties = jest.fn().mockResolvedValue(
				JSON.parse( JSON.stringify( expectedResult ) ),
			);

			const useMockStore = defineMockStore( {
				searchEntityRepository: {
					searchProperties,
					searchItemValues: jest.fn(),
					searchLexemeValues: jest.fn(),
					searchSenseValues: jest.fn(),
					searchFormValues: jest.fn(),
				},
			} );
			const pinia = createTestingPinia( {
				stubActions: false,
			} );
			const store = useMockStore( pinia );

			const searchOptions: SearchOptions = { search: 'postal', limit: 12 };
			const actualResult = await store.searchProperties( searchOptions );

			expect( searchProperties ).toHaveBeenCalledWith(
				searchOptions.search,
				searchOptions.limit,
				searchOptions.offset,
			);
			expect( actualResult ).toStrictEqual( expectedResult );
		} );

		it( 'adds message to properties with limited support', async () => {
			const searchInput = [ { label: 'postal code', id: 'P123', datatype: 'math' } ];
			const expectedResult = [
				{
					...searchInput[ 0 ],
					supportingText: 'query-builder-property-lookup-limited-support-tag',
				},
			];
			const searchProperties = jest.fn().mockResolvedValue(
				JSON.parse( JSON.stringify( expectedResult ) ),
			);

			const useMockStore = defineMockStore( {
				searchEntityRepository: {
					searchProperties,
					searchItemValues: jest.fn(),
					searchLexemeValues: jest.fn(),
					searchSenseValues: jest.fn(),
					searchFormValues: jest.fn(),
				},
			} );
			const pinia = createTestingPinia( {
				stubActions: false,
			} );
			const store = useMockStore( pinia );

			const searchOptions: SearchOptions = { search: 'postal', limit: 12 };
			const actualResult = await store.searchProperties( searchOptions );

			expect( actualResult ).toStrictEqual( expectedResult );
		} );
	} );

	describe( 'searchItemValues', () => {
		it( 'calls the repo and resolves with the result', async () => {
			const expectedResult = [ { label: 'potato', id: 'Q666', datatype: 'string' } ];
			const searchItemValues = jest.fn().mockResolvedValue(
				JSON.parse( JSON.stringify( expectedResult ) ),
			);

			const useMockStore = defineMockStore( {
				searchEntityRepository: {
					searchProperties: jest.fn(),
					searchItemValues,
					searchLexemeValues: jest.fn(),
					searchSenseValues: jest.fn(),
					searchFormValues: jest.fn(),
				},
			} );
			const pinia = createTestingPinia( {
				stubActions: false,
			} );
			const store = useMockStore( pinia );

			const searchOptions: SearchOptions = { search: 'potato', limit: 12 };
			const actualResult = await store.searchItemValues( searchOptions );

			expect( searchItemValues ).toHaveBeenCalledWith(
				searchOptions.search,
				searchOptions.limit,
				searchOptions.offset,
			);
			expect( actualResult ).toStrictEqual( expectedResult );
		} );
	} );

	describe( 'incrementMetric', () => {
		it( 'increments metric', async () => {
			const increment = jest.fn();

			const useMockStore = defineMockStore( {
				metricsCollector: { increment },
			} );
			const pinia = createTestingPinia( {
				stubActions: false,
			} );
			const store = useMockStore( pinia );

			await store.incrementMetric( 'foo' );

			expect( increment ).toHaveBeenCalledWith( 'foo' );
		} );
	} );

	it( 'addCondition', () => {

		const expectedNewConditionRow = {
			valueData: { value: null, valueError: null },
			propertyData: { id: '', label: '', datatype: null, isPropertySet: false, propertyError: null },
			propertyValueRelationData: { value: PropertyValueRelation.Matching },
			referenceRelation: ReferenceRelation.Regardless,
			conditionId: 'TO BE FILLED WITH THE GENERATED RANDOM VALUE',
			conditionRelation: ConditionRelation.And,
			subclasses: false,
			negate: false,
		};

		const pinia = createTestingPinia( {
			stubActions: false,
		} );
		const store = useStore( pinia );

		store.addCondition();

		expect( store.conditionRows.length ).toBe( 2 );

		// expect the random value
		expectedNewConditionRow.conditionId = store.conditionRows[ 1 ].conditionId;
		expect( store.conditionRows[ 1 ] ).toStrictEqual( expectedNewConditionRow );
	} );

	it( 'removeCondition', () => {

		const pinia = createTestingPinia( {
			stubActions: false,
		} );
		const store = useStore( pinia );

		store.removeCondition( 0 );

		expect( store.removeCondition ).toHaveBeenCalledWith( 0 );
	} );

	it( 'setSubclasses', () => {
		const pinia = createTestingPinia( { stubActions: false } );
		const store = useStore( pinia );

		const expectedValue = true;

		store.setSubclasses( { subclasses: expectedValue, conditionIndex: 0 } );

		expect( store.conditionRows[ 0 ].subclasses ).toBe( expectedValue );
	} );

	it( 'setConditionRelation', () => {
		const pinia = createTestingPinia( { stubActions: false } );
		const store = useStore( pinia );

		const conditionRelation = ConditionRelation.Or;

		store.setConditionRelation( { conditionIndex: 0, value: conditionRelation } );

		expect( store.conditionRows[ 0 ].conditionRelation ).toBe( conditionRelation );
	} );

	it( 'setNegate', () => {
		const pinia = createTestingPinia( { stubActions: false } );
		const store = useStore( pinia );
		const negate = true;

		store.setNegate( { conditionIndex: 0, value: negate } );

		expect( store.conditionRows[ 0 ].negate ).toBe( negate );
	} );

	it( 'setOmitLabels', () => {
		const pinia = createTestingPinia();
		const store = useStore( pinia );
		const omitLabels = false;

		store.setOmitLabels( omitLabels );
		expect( store.omitLabels ).toBe( omitLabels );
	} );

	describe( 'validateForm', () => {
		it( 'adds only a notice for a single empty line', () => {

			const pinia = createTestingPinia( { stubActions: false } );
			const store = useStore( pinia );

			store.conditionRows = [
				{
					propertyData: {
						id: '',
						label: '',
						datatype: null,
						propertyError: null,
					},
					valueData: {
						value: '',
						valueError: null,
					},
					propertyValueRelationData: {
						value: PropertyValueRelation.Matching,
					},
				} as ConditionRow,
			];

			store.validateForm();

			expect( store.setErrors ).toHaveBeenCalledWith( [ {
				message: 'query-builder-result-error-empty-form',
				type: 'notice',
			} ] );

			expect( store.setFieldErrors ).toHaveBeenCalledWith( {
				errors: {
					propertyError: null,
					valueError: null,
				},
				index: 0,
			} );
		} );

		it( 'adds errors if the form is missing a value', () => {

			const pinia = createTestingPinia( { stubActions: false } );
			const store = useStore( pinia );

			store.conditionRows = [
				{
					propertyData: {
						id: 'P123',
						label: 'some string',
						datatype: 'string',
						isPropertySet: true,
						propertyError: null,
					},
					valueData: {
						value: '',
						valueError: null,
					},
					propertyValueRelationData: {
						value: PropertyValueRelation.Matching,
					},
				} as ConditionRow,
			];

			store.validateForm();

			expect( store.setErrors ).toHaveBeenCalledWith( [ {
				message: 'query-builder-result-error-incomplete-form',
				type: 'error',
			} ] );

			expect( store.setFieldErrors ).toHaveBeenCalledWith( {
				errors: {
					propertyError: null,
					valueError: {
						message: 'query-builder-result-error-missing-value',
						type: 'error',
					},
				},
				index: 0,
			} );
		} );

		it( 'adds errors if the form is missing a property', () => {

			const pinia = createTestingPinia( { stubActions: false } );
			const store = useStore( pinia );

			store.conditionRows = [
				{
					propertyData: {
						id: 'P123',
						label: 'some string',
						datatype: 'string',
						isPropertySet: false,
						propertyError: null,
					},
					valueData: {
						value: '10777',
						valueError: null,
					},
					propertyValueRelationData: {
						value: PropertyValueRelation.Matching,
					},
				} as ConditionRow,
			];

			store.validateForm();

			expect( store.setErrors ).toHaveBeenCalledWith( [ {
				message: 'query-builder-result-error-incomplete-form',
				type: 'error',
			} ] );

			expect( store.setFieldErrors ).toHaveBeenCalledWith( {
				errors: {
					valueError: null,
					propertyError: {
						message: 'query-builder-result-error-missing-property',
						type: 'error',
					},
				},
				index: 0,
			} );
		} );

		it( 'removes existing errors', () => {
			const pinia = createTestingPinia( { stubActions: false } );
			const store = useStore( pinia );

			store.conditionRows = [
				{
					propertyData: {
						id: 'P123',
						label: 'some string',
						datatype: 'string',
						isPropertySet: true,
						propertyError: null,
					},
					valueData: {
						value: 'some text that was added',
						valueError: {
							message: 'some-error-message-key',
							type: 'error',
						},
					},
					propertyValueRelationData: {
						value: PropertyValueRelation.Matching,
					},
				} as ConditionRow,
			];

			store.errors = [ {
				message: 'query-builder-result-error-incomplete-form',
				type: 'error',
			} ];

			store.validateForm();

			expect( store.setErrors ).toHaveBeenCalledWith( [] );
			expect( store.setFieldErrors ).toHaveBeenCalledWith( {
				errors: {
					propertyError: null,
					valueError: null,
				},
				index: 0,
			} );

		} );

		it( 'keeps limited support messages', () => {
			const pinia = createTestingPinia( { stubActions: false } );
			const store = useStore( pinia );

			store.conditionRows = [
				{
					propertyData: {
						id: 'P123',
						label: 'some string',
						datatype: 'some unsupported data type',
						isPropertySet: true,
						propertyError: null,
					},
					valueData: {
						value: 'Lorem Ipsum',
						valueError: null,
					},
					propertyValueRelationData: {
						value: PropertyValueRelation.Matching,
					},
				} as ConditionRow,
			];

			store.errors = [ {
				message: 'query-builder-result-error-incomplete-form',
				type: 'error',
			} ];

			store.validateForm();

			expect( store.setErrors ).toHaveBeenCalledWith( [] );
			expect( store.setFieldErrors ).toHaveBeenCalledWith( {
				errors: {
					propertyError: null,
					valueError: null,
				},
				index: 0,
			} );
			expect( store.setConditionAsLimitedSupport ).toHaveBeenCalledWith( 0 );
		} );

		it( 'dispatches action to check the Limit', () => {
			const pinia = createTestingPinia( { stubActions: false } );
			const store = useStore( pinia );

			store.conditionRows = [
				{
					propertyData: {
						id: 'P123',
						label: '',
						datatype: null,
						propertyError: null,
					},
					valueData: {
						value: 'some value',
						valueError: null,
					},
					propertyValueRelationData: {
						value: PropertyValueRelation.Matching,
					},
				} as ConditionRow,
			];

			store.validateForm();

			expect( store.validateLimit ).toHaveBeenCalled();
		} );
	} );

	describe( 'validateLimit', () => {
		it( 'does nothing on a valid limit', () => {
			const pinia = createTestingPinia( { stubActions: false } );
			const store = useStore( pinia );

			store.limit = 123;
			store.useLimit = true;

			store.validateLimit();

			expect( store.setLimit ).not.toHaveBeenCalled();

		} );

		it( 'sets the limit back to the default if it is undefined, i.e., empty', () => {

			const pinia = createTestingPinia( { stubActions: false } );
			const store = useStore( pinia );
			store.limit = undefined;
			store.useLimit = true;

			store.validateLimit();

			expect( store.setLimit ).toHaveBeenCalledWith( DEFAULT_LIMIT );
		} );

		it( 'sets an error if the limit is null, i.e., invalid', () => {
			const pinia = createTestingPinia( { stubActions: false } );
			const store = useStore( pinia );
			store.limit = null;
			store.useLimit = true;
			store.errors = [];

			const expectedError: QueryBuilderError = {
				type: 'error',
				message: 'query-builder-result-error-incomplete-form',
			};

			store.validateLimit();

			expect( store.setErrors ).toHaveBeenCalledWith( [ expectedError ] );
		} );

		it( 'ignores an invalid value in limit if we are not actually using it', () => {
			const pinia = createTestingPinia( { stubActions: false } );
			const store = useStore( pinia );
			store.limit = null;
			store.useLimit = false;

			store.validateLimit();

			expect( store.setLimit ).not.toHaveBeenCalled();
			expect( store.setErrors ).not.toHaveBeenCalled();
		} );
	} );

	it( 'setReferenceRelation', () => {
		const referenceRelation = ReferenceRelation.Without;
		const conditionIndex = 0;

		const pinia = createTestingPinia( { stubActions: false } );
		const store = useStore( pinia );

		store.setReferenceRelation( { referenceRelation, conditionIndex } );

		expect( store.setReferenceRelation ).toHaveBeenCalledWith( { referenceRelation, conditionIndex } );
	} );

	describe( 'parseState', () => {
		it( 'parses state and dispatches action to search for entities', () => {
			const payload = {
				conditions: [ {
					propertyId: 'P31',
					propertyDataType: 'wikibase-item',
					propertyValueRelation: 'matching',
					referenceRelation: 'regardless',
					value: 'Q146',
					subclasses: true,
					conditionRelation: null,
					negate: false,
				} ],
				limit: 10,
				useLimit: true,
				omitLabels: false,
			};

			const pinia = createTestingPinia( { stubActions: false } );
			const store = useStore( pinia );
			store.searchForEntities = jest.fn().mockResolvedValue( [] );

			store.parseState( JSON.stringify( payload ) );

			expect( store.$patch ).toHaveBeenCalledWith( {
				conditionRows: [ {
					conditionId: '1',
					propertyData: {
						datatype: 'wikibase-item',
						id: 'P31',
						isPropertySet: true,
						label: 'P31',
						propertyError: null,
					},
					propertyValueRelationData: { value: 'matching' },
					referenceRelation: 'regardless',
					valueData: {
						value: {
							id: 'Q146',
							label: 'Q146',
						},
						valueError: null,
					},
					subclasses: true,
					conditionRelation: null,
					negate: false,
				} ],
				limit: 10,
				omitLabels: false,
				useLimit: true,
				errors: [],
			} );
			expect( store.searchForEntities ).toHaveBeenCalled();
		} );

		it( 'does nothing for invalid payload', () => {
			const pinia = createTestingPinia( { stubActions: false } );
			const store = useStore( pinia );

			store.parseState( 'invalid' );

			expect( store.$patch ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'searchForEntities', () => {
		it( 'searches for properties', async () => {
			const searchProperties = jest.fn().mockResolvedValue( [ {
				id: 'P646',
				label: 'Freebase ID',
			} ] );

			const state = {
				conditionRows: [
					{
						propertyData: {
							id: 'P646',
							datatype: 'external-id',
						},
						valueData: {},
						propertyValueRelationData: {},
					},
					{
						propertyData: {
							id: 'P18',
							datatype: 'commonsMedia',
						},
						valueData: {},
						propertyValueRelationData: {},
					},
				] };

			const useMockStore = defineMockStore( {
				searchEntityRepository: {
					searchProperties,
					searchItemValues: jest.fn(),
					searchLexemeValues: jest.fn(),
					searchSenseValues: jest.fn(),
					searchFormValues: jest.fn(),
				},
			} );
			const pinia = createTestingPinia( {
				stubActions: false,
				initialState: {
					store: state,
				},
			} );
			const store = useMockStore( pinia );

			await store.searchForEntities();

			expect( searchProperties ).toHaveBeenCalledTimes( 2 );
			expect( searchProperties ).toHaveBeenCalledWith( 'P646', 1, 0 );
			expect( searchProperties ).toHaveBeenCalledWith( 'P18', 1, 0 );
			expect( store.updateProperty ).toHaveBeenCalledWith( {
				property: {
					id: 'P646',
					label: 'Freebase ID',
				},
				conditionIndex: 0,
			} );
			// searchProperties returned “wrong” result for second call,
			// so updateProperty() only gets dispatched once
		} );

		it( 'searches for items', async () => {
			const searchProperties = jest.fn().mockResolvedValue( [] );
			const searchItemValues = jest.fn().mockResolvedValue( [ {
				id: 'Q146',
				label: 'house cat',
			} ] );
			const useMockStore = defineMockStore( {
				searchEntityRepository: {
					searchProperties,
					searchItemValues,
					searchLexemeValues: jest.fn(),
					searchSenseValues: jest.fn(),
					searchFormValues: jest.fn(),
				},
			} );

			const state = {
				conditionRows: [
					{
						propertyData: {
							id: 'P31',
							datatype: 'wikibase-item',
						},
						valueData: { value: { id: 'Q146' } },
					},
					{
						propertyData: {
							id: 'P4743',
							datatype: 'wikibase-item',
						},
						valueData: { value: { id: 'Q42604' } },
					},
				] };

			const pinia = createTestingPinia( {
				stubActions: false,
				initialState: {
					store: state,
				},
			} );
			const store = useMockStore( pinia );

			await store.searchForEntities();

			expect( searchItemValues ).toHaveBeenCalledTimes( 2 );
			expect( searchItemValues ).toHaveBeenCalledWith( 'Q146', 1, 0 );
			expect( searchItemValues ).toHaveBeenCalledWith( 'Q42604', 1, 0 );
			// expect( context.dispatch ).toHaveBeenCalledTimes( 1 );
			expect( store.updateValue ).toHaveBeenCalledWith( {
				value: {
					id: 'Q146',
					label: 'house cat',
				},
				conditionIndex: 0,
			} );
			// searchItemValues returned “wrong” result for second call,
			// so updateValue() only gets dispatched once
		} );
	} );

} );
