import ConditionValues, { ConditionErrors } from '@/form/ConditionValues';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import Error from '@/data-model/Error';

export interface ValidationResult {
	formErrors: Error[];
	fieldErrors: ConditionErrors[];
}

export default class Validator {
	private readonly formValues: ConditionValues[];
	public constructor( formValues: ConditionValues[] ) {
		this.formValues = formValues;
	}

	public validate(): ValidationResult {
		const validationResult: ValidationResult = {
			formErrors: [],
			fieldErrors: [],
		};

		if ( this.isEmpty() ) {
			validationResult.formErrors.push( {
				message: 'query-builder-result-error-empty-form',
				type: 'notice',
			} );
			validationResult.fieldErrors.push( {
				property: null,
				value: null,
			} );
			return validationResult;
		}

		validationResult.fieldErrors = this.formValues.map(
			( conditionValues ) => this.validateCondition( conditionValues ),
		);

		if ( validationResult.fieldErrors.some( ( { property, value } ) =>
			property !== null || value !== null,
		) ) {
			validationResult.formErrors.push( {
				message: 'query-builder-result-error-incomplete-form',
				type: 'error',
			} );
		}

		return validationResult;
	}

	private validateCondition( conditionValues: ConditionValues ): ConditionErrors {
		const fieldErrors: ConditionErrors = {
			property: null,
			value: null,
		};
		if ( !conditionValues.property?.id ) {
			fieldErrors.property = {
				message: 'query-builder-result-error-missing-property',
				type: 'error',
			};
		}
		if (
			conditionValues.propertyValueRelation !== PropertyValueRelation.Regardless &&
			!conditionValues.value
		) {
			fieldErrors.value = {
				message: 'query-builder-result-error-missing-value',
				type: 'error',
			};
		}

		return fieldErrors;
	}

	private isEmpty(): boolean {
		if ( this.formValues.length === 0 ) {
			return true;
		}

		return this.formValues.length === 1 &&
			!this.formValues[ 0 ].property?.id &&
			!this.formValues[ 0 ].value;
	}
}
