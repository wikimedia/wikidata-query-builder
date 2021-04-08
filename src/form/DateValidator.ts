import Error from '@/data-model/Error';
import BaseValidator from '@/form/BaseValidator';
import { DateValue } from '@/store/RootState';

export default class DateValidator {
	public validateValue( value: DateValue | null ): null | Error {
		if ( !value || ( !value.parseResult && !value.formattedValue ) ) {
			return BaseValidator.VALUE_MISSING_ERROR;
		}
		if ( !value.parseResult && value.formattedValue ) {
			return { type: 'error', message: value.formattedValue };
		}
		return null;
	}
}
