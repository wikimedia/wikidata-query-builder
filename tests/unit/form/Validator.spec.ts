import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import ConditionValues from '@/form/ConditionValues';
import Validator, { ValidationResult } from '@/form/Validator';

describe( 'validator', () => {
	it( 'returns no errors with a complete form', () => {
		const formValues: ConditionValues = {
			property: {
				id: 'P31',
				label: 'instance of',
				datatype: 'wikibase-item',
			},
			value: 'Q5',
			propertyValueRelation: PropertyValueRelation.Matching,
		};

		const expectedResult: ValidationResult = {
			formErrors: [],
			fieldErrors: [ {
				property: null,
				value: null,
			} ],
		};

		const validator = new Validator( [ formValues ] );

		expect( validator.validate() ).toStrictEqual( expectedResult );
	} );

	it( 'returns one error with a property missing', () => {
		const formValues: ConditionValues = {
			property: null,
			value: 'Q5',
			propertyValueRelation: PropertyValueRelation.Matching,
		};

		const expectedResult: ValidationResult = {
			formErrors: [
				{
					type: 'error',
					message: 'query-builder-result-error-incomplete-form',
				},
			],
			fieldErrors: [ {
				property: {
					type: 'error',
					message: 'query-builder-result-error-missing-property',
				},
				value: null,
			} ],
		};

		const validator = new Validator( [ formValues ] );

		expect( validator.validate() ).toStrictEqual( expectedResult );
	} );

	it( 'returns one error with a property empty', () => {
		const formValues: ConditionValues = {
			property: { id: '', label: '', datatype: '' },
			value: 'Q5',
			propertyValueRelation: PropertyValueRelation.Matching,
		};

		const expectedResult: ValidationResult = {
			formErrors: [
				{
					type: 'error',
					message: 'query-builder-result-error-incomplete-form',
				},
			],
			fieldErrors: [ {
				property: {
					type: 'error',
					message: 'query-builder-result-error-missing-property',
				},
				value: null,
			} ],
		};

		const validator = new Validator( [ formValues ] );

		expect( validator.validate() ).toStrictEqual( expectedResult );
	} );

	it( 'returns one error with a value missing when PropertyValueRelation = Matching', () => {
		const formValues: ConditionValues = {
			property: {
				id: 'P31',
				label: 'instance of',
				datatype: 'wikibase-item',
			},
			value: null,
			propertyValueRelation: PropertyValueRelation.Matching,
		};

		const expectedResult: ValidationResult = {
			formErrors: [
				{
					type: 'error',
					message: 'query-builder-result-error-incomplete-form',
				},
			],
			fieldErrors: [ {
				property: null,
				value: {
					type: 'error',
					message: 'query-builder-result-error-missing-value',
				},
			} ],
		};

		const validator = new Validator( [ formValues ] );

		expect( validator.validate() ).toStrictEqual( expectedResult );
	} );

	it( 'returns no errors with a value missing when PropertyValueRelation = Regardless', () => {
		const formValues: ConditionValues[] = [ {
			property: {
				id: 'P31',
				label: 'instance of',
				datatype: 'wikibase-item',
			},
			value: null,
			propertyValueRelation: PropertyValueRelation.Regardless,
		} ];

		const expectedResult: ValidationResult = {
			formErrors: [],
			fieldErrors: [ {
				property: null,
				value: null,
			} ],
		};

		const validator = new Validator( formValues );

		expect( validator.validate() ).toStrictEqual( expectedResult );
	} );

	it( 'returns notice when the form is empty - one empty condition', () => {
		const formValues: ConditionValues[] = [ {
			property: null,
			value: null,
			propertyValueRelation: PropertyValueRelation.Matching,
		} ];

		const expectedResult: ValidationResult = {
			formErrors: [
				{
					type: 'notice',
					message: 'query-builder-result-error-empty-form',
				},
			],
			fieldErrors: [ {
				property: null,
				value: null,
			} ],
		};

		const validator = new Validator( formValues );

		expect( validator.validate() ).toStrictEqual( expectedResult );
	} );

	it( 'returns notice when the form is empty - does not have any condition', () => {
		const formValues: ConditionValues[] = [];

		const expectedResult: ValidationResult = {
			formErrors: [
				{
					type: 'notice',
					message: 'query-builder-result-error-empty-form',
				},
			],
			fieldErrors: [ {
				property: null,
				value: null,
			} ],
		};

		const validator = new Validator( formValues );

		expect( validator.validate() ).toStrictEqual( expectedResult );
	} );

	describe( 'for quantity datatypes', () => {
		it( 'returns an error if no number was entered', () => {
			const formValues: ConditionValues = {
				property: {
					id: 'P31',
					label: 'population',
					datatype: 'quantity',
				},
				value: { value: NaN, unit: null, rawUnitInput: '' },
				propertyValueRelation: PropertyValueRelation.Matching,
			};

			const expectedResult: ValidationResult = {
				formErrors: [
					{
						type: 'error',
						message: 'query-builder-result-error-incomplete-form',
					},
				],
				fieldErrors: [ {
					property: null,
					value: {
						type: 'error',
						subproperty: 'number',
						message: 'query-builder-quantity-value-error-number',
					},
				} ],
			};

			const validator = new Validator( [ formValues ] );

			expect( validator.validate() ).toStrictEqual( expectedResult );
		} );

		it( 'returns an error if a unit was searched for but none selected', () => {
			const formValues: ConditionValues = {
				property: {
					id: 'P31',
					label: 'population',
					datatype: 'quantity',
				},
				value: { value: 12, unit: null, rawUnitInput: 'kittens' },
				propertyValueRelation: PropertyValueRelation.Matching,
			};

			const expectedResult: ValidationResult = {
				formErrors: [
					{
						type: 'error',
						message: 'query-builder-result-error-incomplete-form',
					},
				],
				fieldErrors: [ {
					property: null,
					value: {
						type: 'error',
						subproperty: 'unit',
						message: 'query-builder-quantity-value-error-unit',
					},
				} ],
			};

			const validator = new Validator( [ formValues ] );

			expect( validator.validate() ).toStrictEqual( expectedResult );
		} );

		it( 'returns an error if no number was entered and a unit was searched for but none selected', () => {
			const formValues: ConditionValues = {
				property: {
					id: 'P31',
					label: 'population',
					datatype: 'quantity',
				},
				value: { value: NaN, unit: null, rawUnitInput: 'kittens' },
				propertyValueRelation: PropertyValueRelation.Matching,
			};

			const expectedResult: ValidationResult = {
				formErrors: [
					{
						type: 'error',
						message: 'query-builder-result-error-incomplete-form',
					},
				],
				fieldErrors: [ {
					property: null,
					value: {
						type: 'error',
						subproperty: 'both',
						message: 'query-builder-quantity-value-error-number-and-unit',
					},
				} ],
			};

			const validator = new Validator( [ formValues ] );

			expect( validator.validate() ).toStrictEqual( expectedResult );
		} );

		it( 'returns no error if number was entered and the unit is empty', () => {
			const formValues: ConditionValues = {
				property: {
					id: 'P31',
					label: 'population',
					datatype: 'quantity',
				},
				value: { value: 12, unit: null, rawUnitInput: '' },
				propertyValueRelation: PropertyValueRelation.Matching,
			};

			const expectedResult: ValidationResult = {
				formErrors: [],
				fieldErrors: [ {
					property: null,
					value: null,
				} ],
			};

			const validator = new Validator( [ formValues ] );

			expect( validator.validate() ).toStrictEqual( expectedResult );
		} );

		it( 'returns an error if both number and unit were selected', () => {
			const formValues: ConditionValues = {
				property: {
					id: 'P31',
					label: 'population',
					datatype: 'quantity',
				},
				value: { value: 12, unit: { id: 'Q123', label: 'Kitten' }, rawUnitInput: 'kitten' },
				propertyValueRelation: PropertyValueRelation.Matching,
			};

			const expectedResult: ValidationResult = {
				formErrors: [],
				fieldErrors: [ {
					property: null,
					value: null,
				} ],
			};

			const validator = new Validator( [ formValues ] );

			expect( validator.validate() ).toStrictEqual( expectedResult );
		} );
	} );

	describe( 'for time datatypes', () => {
		it( 'returns a missing value error if the value is plain missing', () => {
			const formValues: ConditionValues = {
				property: {
					id: 'P585',
					label: 'point in time',
					datatype: 'time',
				},
				value: null,
				propertyValueRelation: PropertyValueRelation.Matching,
			};
			const expectedResult: ValidationResult = {
				formErrors: [
					{
						message: 'query-builder-result-error-incomplete-form',
						type: 'error',
					},
				],
				fieldErrors: [ {
					property: null,
					value: {
						message: 'query-builder-result-error-missing-value',
						type: 'error',
					},
				} ],
			};

			const validator = new Validator( [ formValues ] );

			expect( validator.validate() ).toStrictEqual( expectedResult );
		} );

		it( 'returns and error with the API\'s error message if there is only formattedValue', () => {
			const apiError = 'The value is malformed.';
			const formValues: ConditionValues = {
				property: {
					id: 'P585',
					label: 'point in time',
					datatype: 'time',
				},
				value: { parseResult: null, formattedValue: apiError },
				propertyValueRelation: PropertyValueRelation.Matching,
			};
			const expectedResult: ValidationResult = {
				formErrors: [
					{
						message: 'query-builder-result-error-incomplete-form',
						type: 'error',
					},
				],
				fieldErrors: [ {
					property: null,
					value: {
						message: apiError,
						type: 'error',
					},
				} ],
			};

			const validator = new Validator( [ formValues ] );

			expect( validator.validate() ).toStrictEqual( expectedResult );
		} );

		it( 'returns null if the value is valid', () => {
			const formValues: ConditionValues = {
				property: {
					id: 'P585',
					label: 'point in time',
					datatype: 'time',
				},
				value: {
					parseResult: {
						value: {
							time: '+2012-03-02T00:00:00Z',
							timezone: 0,
							before: 0,
							after: 0,
							precision: 11,
							calendarmodel: 'http://www.wikidata.org/entity/Q1985727',
						},
						type: 'time',
					}, formattedValue: '2 March 2012',
				},
				propertyValueRelation: PropertyValueRelation.Matching,
			};
			const expectedResult: ValidationResult = {
				formErrors: [],
				fieldErrors: [ {
					property: null,
					value: null,
				} ],
			};

			const validator = new Validator( [ formValues ] );

			expect( validator.validate() ).toStrictEqual( expectedResult );
		} );

	} );

} );
