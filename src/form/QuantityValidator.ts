import { QuantityError } from '@/data-model/QueryBuilderError';
import { QuantityValue } from '@/store/RootState';

export default class QuantityValidator {

	public static readonly NUMBER_ERROR: QuantityError = {
		type: 'error',
		message: 'query-builder-quantity-value-error-number',
		subproperty: 'number',
	};

	public static readonly UNIT_ERROR: QuantityError = {
		type: 'error',
		message: 'query-builder-quantity-value-error-unit',
		subproperty: 'unit',
	};

	public static readonly COMBINED_ERROR: QuantityError = {
		type: 'error',
		message: 'query-builder-quantity-value-error-number-and-unit',
		subproperty: 'both',
	};

	public isValidNumberValue( $rawInput: string | null ): boolean {
		if ( $rawInput === null ) {
			return false;
		}
		return !isNaN( Number( $rawInput ) );
	}

	public validateQuantityValue( value: QuantityValue | null ): null | QuantityError {
		if ( !value ) {
			return QuantityValidator.NUMBER_ERROR;
		}

		if ( !value.value && value.rawUnitInput && !value.unit ) {
			return QuantityValidator.COMBINED_ERROR;
		}

		if ( !value.value ) {
			return QuantityValidator.NUMBER_ERROR;
		}

		if ( value.rawUnitInput && !value.unit ) {
			return QuantityValidator.UNIT_ERROR;
		}

		return null;
	}
}
