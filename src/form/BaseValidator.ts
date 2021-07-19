import QueryBuilderError from '@/data-model/QueryBuilderError';

export default class BaseValidator {

	public static readonly VALUE_MISSING_ERROR: QueryBuilderError = {
		message: 'query-builder-result-error-missing-value',
		type: 'error',
	};

	public validateValue( value: unknown ): null | QueryBuilderError {
		if ( !value ) {
			return BaseValidator.VALUE_MISSING_ERROR;
		}
		return null;
	}
}
