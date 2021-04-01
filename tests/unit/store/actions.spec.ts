import { Services } from '@/QueryBuilderServices';
import createActions from '@/store/actions';
import SearchOptions from '@/data-access/SearchOptions';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import { ConditionRow, DEFAULT_LIMIT } from '@/store/RootState';
import ConditionRelation from '@/data-model/ConditionRelation';
import ReferenceRelation from '@/data-model/ReferenceRelation';
import Error from '@/data-model/Error';

function createActionsWithMockServices(
	serviceOverrides: Partial<Services> = {},
): any {
	return createActions(
		serviceOverrides.searchEntityRepository ?? {
			searchProperties: jest.fn(),
			searchItemValues: jest.fn(),
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

describe( 'actions', () => {

	describe( 'updateValue', () => {
		it( 'sets the value in the store', () => {
			const context = {
				getters: { datatype: jest.fn().mockReturnValue( 'string' ) },
				commit: jest.fn(),
			};
			const value = 'whatever';
			const conditionIndex = 0;
			const actions = createActionsWithMockServices();

			actions.updateValue( context as any, { value, conditionIndex } );

			expect( context.commit ).toHaveBeenCalledWith( 'setValue', { value, conditionIndex } );
			expect( context.commit ).toHaveBeenCalledWith( 'clearFieldErrors', {
				conditionIndex,
				errorsToClear: 'value',
			} );
		} );

		it( 'delegates to updateDateValue for datatype time', () => {
			const context = {
				getters: { datatype: jest.fn().mockReturnValue( 'time' ) },
				commit: jest.fn(),
				dispatch: jest.fn(),
			};
			const value = 'whatever';
			const conditionIndex = 0;
			const actions = createActionsWithMockServices();

			actions.updateValue( context as any, { value, conditionIndex } );

			expect( context.commit ).toHaveBeenCalledTimes( 1 );
			expect( context.commit ).toHaveBeenCalledWith( 'clearFieldErrors', {
				conditionIndex,
				errorsToClear: 'value',
			} );
			expect( context.dispatch ).toHaveBeenCalledWith( 'updateDateValue', { conditionIndex, rawInput: value } );
		} );
	} );

	describe( 'updateDateValue', () => {
		it( 'parses payload and formats parsedDate and stores it in the state', async () => {
			const context = {
				getters: {
					property: jest.fn().mockReturnValue( { id: 'P123' } ),
				},
				commit: jest.fn(),
			};
			const value = '2021-04-06';
			const conditionIndex = 0;
			const mockParsedValue = {};
			const mockFormatValue = '6 April 2021';
			const parseValues = jest.fn().mockResolvedValue( [ mockParsedValue ] );
			const formatValue = jest.fn().mockResolvedValue( mockFormatValue );
			const actions = createActionsWithMockServices( {
				parseValueRepository: { parseValues },
				formatValueRepository: { formatValue },
			} );

			await actions.updateDateValue( context as any, { rawInput: value, conditionIndex } );

			expect( context.commit ).toHaveBeenCalledWith( 'clearValue', 0 );
			expect( context.commit ).toHaveBeenCalledWith(
				'clearFieldErrors',
				{ conditionIndex, errorsToClear: 'value' },
			);
			expect( parseValues ).toHaveBeenCalledWith( [ value ], 'time' );
			expect( formatValue ).toHaveBeenCalledWith( mockParsedValue, 'P123' );
			expect( context.commit ).toHaveBeenCalledWith( 'setValue', {
				value: { parseResult: mockParsedValue, formattedValue: mockFormatValue },
				conditionIndex,
			} );
		} );

		it( 'parses payload and sets error if that fails', async () => {
			const context = {
				commit: jest.fn(),
			};
			const value = 'not a date';
			const conditionIndex = 0;
			const someErrorMessage = 'parsing not great';
			const parseValues = jest.fn().mockRejectedValue( new Error( someErrorMessage ) );
			const formatValue = jest.fn();
			const actions = createActionsWithMockServices( {
				parseValueRepository: { parseValues },
				formatValueRepository: { formatValue },
			} );

			await actions.updateDateValue( context as any, { rawInput: value, conditionIndex } );

			expect( context.commit ).toHaveBeenCalledTimes( 4 );
			expect( context.commit ).toHaveBeenCalledWith( 'clearValue', 0 );
			expect( context.commit ).toHaveBeenCalledWith(
				'clearFieldErrors',
				{ conditionIndex, errorsToClear: 'value' },
			);
			expect( formatValue ).not.toHaveBeenCalled();
			expect( context.commit ).toHaveBeenCalledWith( 'setValue', {
				value: { parseResult: null, formattedValue: someErrorMessage },
				conditionIndex,
			} );
			expect( context.commit ).toHaveBeenCalledWith( 'setFieldErrors', {
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
		const context = {
			commit: jest.fn(),
			dispatch: jest.fn(),
		};
		const actions = createActionsWithMockServices();
		const conditionIndex = 0;

		actions.setConditionAsLimitedSupport( context as any, conditionIndex );

		expect( context.commit ).toHaveBeenCalledWith( 'setFieldErrors', {
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
		const context = {
			commit: jest.fn(),
		};
		const conditionIndex = 0;
		const actions = createActionsWithMockServices();

		actions.unsetProperty( context as any, conditionIndex );

		expect( context.commit ).toHaveBeenCalledTimes( 2 );
		expect( context.commit ).toHaveBeenCalledWith( 'unsetProperty', conditionIndex );
		expect( context.commit ).toHaveBeenCalledWith( 'clearFieldErrors', {
			conditionIndex,
			errorsToClear: 'property',
		} );
	} );

	describe( 'updateProperty', () => {
		it( 'commits the property to the store', () => {
			const context = {
				commit: jest.fn(),
				dispatch: jest.fn(),
				getters: {
					datatype: jest.fn().mockReturnValue( null ),
				},
			};
			const property = {
				id: 'P666',
				label: 'Property label',
				datatype: 'string',
			};
			const conditionIndex = 0;
			const actions = createActionsWithMockServices();

			actions.updateProperty( context as any, { property, conditionIndex } );

			expect( context.commit ).toHaveBeenCalledTimes( 2 );
			expect( context.commit ).toHaveBeenCalledWith( 'setProperty', { property, conditionIndex } );
			expect( context.commit ).toHaveBeenCalledWith( 'clearFieldErrors', {
				conditionIndex: 0,
				errorsToClear: 'property',
			} );
		} );

		it( 'handles datatypes with limited support', () => {
			const context = {
				commit: jest.fn(),
				dispatch: jest.fn(),
				getters: {
					datatype: jest.fn().mockReturnValue( null ),
				},
			};
			const property = {
				id: 'P666',
				label: 'Property label',
				datatype: 'some unsupported data type',
			};
			const conditionIndex = 0;
			const actions = createActionsWithMockServices();

			actions.updateProperty( context as any, { property, conditionIndex } );

			expect( context.commit ).toHaveBeenCalledTimes( 1 );
			expect( context.commit ).toHaveBeenCalledWith( 'setProperty', { property, conditionIndex } );
			expect( context.dispatch ).toHaveBeenCalledWith( 'setConditionAsLimitedSupport', 0 );
		} );

		it( 'clears an existing value if a property with a different datatype is selected', () => {
			const context = {
				commit: jest.fn(),
				dispatch: jest.fn(),
				getters: {
					datatype: jest.fn().mockReturnValue( 'string' ),
				},
			};
			const property = {
				id: 'P666',
				label: 'Property label',
				datatype: 'wikibase-item',
			};
			const conditionIndex = 0;
			const actions = createActionsWithMockServices();

			actions.updateProperty( context as any, { property, conditionIndex } );

			expect( context.commit ).toHaveBeenCalledTimes( 3 );
			expect( context.commit ).toHaveBeenCalledWith( 'setProperty', { property, conditionIndex } );
			expect( context.commit ).toHaveBeenCalledWith( 'clearValue', conditionIndex );
			expect( context.commit ).toHaveBeenCalledWith( 'clearFieldErrors', {
				conditionIndex: 0,
				errorsToClear: 'property',
			} );
		} );
	} );

	describe( 'searchProperties', () => {
		it( 'calls the repo and resolves with the result', async () => {
			const expectedResult = [ { label: 'postal code', id: 'P123', datatype: 'string' } ];
			const searchProperties = jest.fn().mockResolvedValue(
				JSON.parse( JSON.stringify( expectedResult ) ),
			);
			const actions = createActionsWithMockServices(
				{
					searchEntityRepository: { searchProperties, searchItemValues: jest.fn() },
				},
			);

			const searchOptions: SearchOptions = { search: 'postal', limit: 12 };
			const actualResult = await actions.searchProperties( {} as any, searchOptions );

			expect( searchProperties ).toHaveBeenCalledWith(
				searchOptions.search,
				searchOptions.limit,
				searchOptions.offset,
			);
			expect( actualResult ).toStrictEqual( expectedResult );
		} );

		it( 'adds message to properties with limited support', async () => {
			const searchInput = [ { label: 'postal code', id: 'P123', datatype: 'wikibase-sense' } ];
			const expectedResult = [
				{
					...searchInput[ 0 ],
					tag: 'query-builder-property-lookup-limited-support-tag',
				},
			];
			const searchProperties = jest.fn().mockResolvedValue(
				JSON.parse( JSON.stringify( expectedResult ) ),
			);
			const actions = createActionsWithMockServices(
				{ searchEntityRepository: { searchProperties, searchItemValues: jest.fn() } },
			);

			const searchOptions: SearchOptions = { search: 'postal', limit: 12 };
			const actualResult = await actions.searchProperties( {} as any, searchOptions );

			expect( actualResult ).toStrictEqual( expectedResult );
		} );
	} );

	describe( 'searchItemValues', () => {
		it( 'calls the repo and resolves with the result', async () => {
			const expectedResult = [ { label: 'potato', id: 'Q666', datatype: 'string' } ];
			const searchItemValues = jest.fn().mockResolvedValue(
				JSON.parse( JSON.stringify( expectedResult ) ),
			);
			const actions = createActionsWithMockServices(
				{
					searchEntityRepository: { searchProperties: jest.fn(), searchItemValues },
				},
			);

			const searchOptions: SearchOptions = { search: 'potato', limit: 12 };
			const actualResult = await actions.searchItemValues( {} as any, searchOptions );

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
			const actions = createActionsWithMockServices(
				{ metricsCollector: { increment } },
			);

			await actions.incrementMetric( {} as any, 'foo' );

			expect( increment ).toHaveBeenCalledWith( 'foo' );
		} );
	} );

	it( 'addCondition', () => {
		const context = { commit: jest.fn() };

		const actions = createActionsWithMockServices();

		actions.addCondition( context as any );

		expect( context.commit ).toHaveBeenCalledWith( 'addCondition' );
	} );

	it( 'removeCondition', () => {
		const context = { commit: jest.fn() };

		const actions = createActionsWithMockServices();

		actions.removeCondition( context as any, 0 );

		expect( context.commit ).toHaveBeenCalledWith( 'removeCondition', 0 );
	} );

	it( 'setSubclasses', () => {
		const context = { commit: jest.fn() };
		const subclasses = true;
		const conditionIndex = 0;
		const actions = createActionsWithMockServices();

		actions.setSubclasses( context as any, { subclasses, conditionIndex } );

		expect( context.commit ).toHaveBeenCalledWith( 'setSubclasses', { subclasses, conditionIndex } );
	} );

	it( 'setConditionRelation', () => {
		const context = { commit: jest.fn() };
		const conditionRelation = ConditionRelation.And;
		const conditionIndex = 0;
		const actions = createActionsWithMockServices();

		actions.setConditionRelation( context as any, { value: conditionRelation, conditionIndex } );

		expect( context.commit ).toHaveBeenCalledWith( 'setConditionRelation',
			{ value: conditionRelation, conditionIndex } );
	} );

	it( 'setNegate', () => {
		const context = { commit: jest.fn() };
		const negate = true;
		const conditionIndex = 0;
		const actions = createActionsWithMockServices();

		actions.setNegate( context as any, { value: negate, conditionIndex } );

		expect( context.commit ).toHaveBeenCalledWith( 'setNegate', { value: negate, conditionIndex } );
	} );

	it( 'setOmitLabels', () => {
		const context = { commit: jest.fn() };

		const actions = createActionsWithMockServices();

		const omitLabels = false;

		actions.setOmitLabels( context as any, omitLabels );

		expect( context.commit ).toHaveBeenCalledWith( 'setOmitLabels', omitLabels );
	} );

	describe( 'validateForm', () => {
		it( 'adds only a notice for a single empty line', () => {
			const context = {
				rootState: {
					conditionRows: [
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
					],
				},
				commit: jest.fn(),
				dispatch: jest.fn(),
			};

			const actions = createActionsWithMockServices();

			actions.validateForm( context as any );

			expect( context.commit ).toHaveBeenCalledWith( 'setErrors', [ {
				message: 'query-builder-result-error-empty-form',
				type: 'notice',
			} ] );
			expect( context.commit ).toHaveBeenCalledWith( 'setFieldErrors', {
				errors: {
					propertyError: null,
					valueError: null,
				},
				index: 0,
			} );
		} );

		it( 'adds errors if the form is missing a value', () => {
			const context = {
				rootState: {
					conditionRows: [
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
					],
				},
				commit: jest.fn(),
				dispatch: jest.fn(),
			};

			const actions = createActionsWithMockServices();

			actions.validateForm( context as any );

			expect( context.commit ).toHaveBeenCalledWith( 'setErrors', [ {
				message: 'query-builder-result-error-incomplete-form',
				type: 'error',
			} ] );
			expect( context.commit ).toHaveBeenCalledWith( 'setFieldErrors', {
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
			const context = {
				rootState: {
					conditionRows: [
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
					],
				},
				commit: jest.fn(),
				dispatch: jest.fn(),
			};

			const actions = createActionsWithMockServices();

			actions.validateForm( context as any );

			expect( context.commit ).toHaveBeenCalledWith( 'setErrors', [ {
				message: 'query-builder-result-error-incomplete-form',
				type: 'error',
			} ] );
			expect( context.commit ).toHaveBeenCalledWith( 'setFieldErrors', {
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
			const context = {
				rootState: {
					conditionRows: [
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
					],
					errors: [ {
						message: 'query-builder-result-error-incomplete-form',
						type: 'error',
					} ],
				},
				commit: jest.fn(),
				dispatch: jest.fn(),
			};
			const actions = createActionsWithMockServices();

			actions.validateForm( context as any );

			expect( context.commit ).toHaveBeenCalledWith( 'setErrors', [] );
			expect( context.commit ).toHaveBeenCalledWith( 'setFieldErrors', {
				errors: {
					propertyError: null,
					valueError: null,
				},
				index: 0,
			} );

		} );

		it( 'keeps limited support messages', () => {
			const context = {
				rootState: {
					conditionRows: [
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
					],
					errors: [ {
						message: 'query-builder-result-error-incomplete-form',
						type: 'error',
					} ],
				},
				commit: jest.fn(),
				dispatch: jest.fn(),
			};
			const actions = createActionsWithMockServices();

			actions.validateForm( context as any );

			expect( context.commit ).toHaveBeenCalledWith( 'setErrors', [] );
			expect( context.commit ).toHaveBeenCalledWith( 'setFieldErrors', {
				errors: {
					propertyError: null,
					valueError: null,
				},
				index: 0,
			} );
			expect( context.dispatch ).toHaveBeenCalledWith( 'setConditionAsLimitedSupport', 0 );
		} );

		it( 'dispatches action to check the Limit', () => {
			const context = {
				rootState: {
					conditionRows: [
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
					],
				},
				commit: jest.fn(),
				dispatch: jest.fn(),
			};

			const actions = createActionsWithMockServices();

			actions.validateForm( context as any );

			expect( context.dispatch ).toHaveBeenCalledWith( 'validateLimit' );
		} );
	} );

	describe( 'validateLimit', () => {
		it( 'does nothing on a valid limit', () => {
			const context = {
				rootState: {
					limit: 123,
					useLimit: true,
				},
				commit: jest.fn(),
				dispatch: jest.fn(),
			};
			const actions = createActionsWithMockServices();

			actions.validateLimit( context as any );

			expect( context.commit ).not.toHaveBeenCalled();
			expect( context.dispatch ).not.toHaveBeenCalled();
		} );

		it( 'sets the limit back to the default if it is undefined, i.e., empty', () => {
			const context = {
				rootState: {
					limit: undefined,
					useLimit: true,
				},
				commit: jest.fn(),
				dispatch: jest.fn(),
			};
			const actions = createActionsWithMockServices();

			actions.validateLimit( context as any );

			expect( context.commit ).toHaveBeenCalledWith( 'setLimit', DEFAULT_LIMIT );
			expect( context.dispatch ).not.toHaveBeenCalled();
		} );

		it( 'sets an error if the limit is null, i.e., invalid', () => {
			const context = {
				rootState: {
					limit: null,
					useLimit: true,
					errors: [],
				},
				commit: jest.fn(),
				dispatch: jest.fn(),
			};
			const actions = createActionsWithMockServices();

			const expectedError: Error = {
				type: 'error',
				message: 'query-builder-result-error-incomplete-form',
			};

			actions.validateLimit( context as any );

			expect( context.commit ).toHaveBeenCalledWith( 'setErrors', [ expectedError ] );
			expect( context.dispatch ).not.toHaveBeenCalled();
		} );

		it( 'ignores an invalid value in limit if we are not actually using it', () => {
			const context = {
				rootState: {
					limit: null,
					useLimit: false,
				},
				commit: jest.fn(),
				dispatch: jest.fn(),
			};
			const actions = createActionsWithMockServices();

			actions.validateLimit( context as any );

			expect( context.commit ).not.toHaveBeenCalled();
			expect( context.dispatch ).not.toHaveBeenCalled();
		} );
	} );

	it( 'setReferenceRelation', () => {
		const context = { commit: jest.fn() };
		const referenceRelation = ReferenceRelation.Without;
		const conditionIndex = 0;
		const actions = createActionsWithMockServices();

		actions.setReferenceRelation( context as any, { referenceRelation, conditionIndex } );

		expect( context.commit ).toHaveBeenCalledWith( 'setReferenceRelation', { referenceRelation, conditionIndex } );
	} );

} );
