export default class PrecisionError extends Error {
	public constructor() {
		super();

		this.message = 'Precision not supported. Supported precisions: years, months, days';
		this.name = 'PrecisionError';
	}
}
