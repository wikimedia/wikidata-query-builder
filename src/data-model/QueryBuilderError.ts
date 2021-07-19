interface BaseError {
	message: string;
	type: 'error' | 'warning' | 'notice';
}

export interface QuantityError extends BaseError {
	subproperty: 'number' | 'unit' | 'both' | null;
}

type QueryBuilderError = BaseError | QuantityError;

export default QueryBuilderError;
