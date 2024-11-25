import { ErrorProp } from './types';

export function generateUid( componentName: string ): string {
	return `${componentName}-${Math.floor( Math.random() * 1000000 )}`;
}

export function validateExtendedNumberInput( value: string ): boolean {
	const numberRegex = '(?:[-+]\\s*)?(?:[\\d,]+\\.\\d*|\\.\\d+|[\\d,]+)(?:[eE][-+]?\\d+)?';
	const mainRegex = '^\\s*' + numberRegex + '([~!]|(?:\\+\\/?-|±)' + numberRegex + '|)\\s*$';
	const regex = RegExp( mainRegex );
	return regex.test( value );
}

export function getFeedbackTypeFromProps( props: { error: ErrorProp } ): () => string | null {
	return () => {
		return props.error && props.error.type || null;
	};
}
