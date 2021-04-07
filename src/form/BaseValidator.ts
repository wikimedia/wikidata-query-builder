import Error from '@/data-model/Error';

export default class BaseValidator {

	public static readonly VALUE_MISSING_ERROR: Error = {
		message: 'query-builder-result-error-missing-value',
		type: 'error',
	};

	public validateValue( value: unknown ): null | Error {
		if ( !value ) {
			return BaseValidator.VALUE_MISSING_ERROR;
		}
		return null;
	}
}
