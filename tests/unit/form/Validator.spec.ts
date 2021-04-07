import ConditionValues from '@/form/ConditionValues';
import Validator, { ValidationResult } from '@/form/Validator';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';

describe( 'validator', () => {
	it( 'returns no errors with a complete form', () => {
		const formValues: ConditionValues = {
			property: {
				id: 'P31',
				label: 'instance of',
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
			property: { id: '', label: '' },
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
} );
