import QueryBuilderError from '@/data-model/QueryBuilderError';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import ConditionRelation from '@/data-model/ConditionRelation';
import ReferenceRelation from '@/data-model/ReferenceRelation';
import ParseResult from '@/data-access/ParseResult';

export const DEFAULT_LIMIT = 100;

export interface ItemValue {
	id: string;
	label: string;
}

export interface LexemeValue {
	id: string;
	label: string;
}

export interface SenseValue {
	id: string;
	label: string;
}

export interface FormValue {
	id: string;
	label: string;
}

export interface PropertyValue {
	id: string;
	label: string;
}

export type StringValue = string;

export interface QuantityValue {
	value: number;
	precision?: number;
	unit: ItemValue | null;
	rawUnitInput?: string;
}

export interface DateValue {
	parseResult: ParseResult | null;
	formattedValue: string | null;
}

export type Value = ItemValue | LexemeValue | SenseValue | FormValue | PropertyValue |
StringValue | QuantityValue | DateValue | null;

export interface PropertyData {
	id: string;
	label: string;
	datatype: string|null;
	propertyError: QueryBuilderError|null;
	isPropertySet: boolean;
}

export interface ConditionRow {
	propertyData: PropertyData;
	valueData: {
		value: Value;
		valueError: QueryBuilderError|null;
	};
	propertyValueRelationData: {
		value: PropertyValueRelation;
	};
	referenceRelation: ReferenceRelation;
	subclasses: boolean;
	// conditionRelation between the current condition and the condition above.
	// If there is only one condition this property = null
	conditionRelation: ConditionRelation | null;
	negate: boolean;
	readonly conditionId: string;
}

export default interface RootState {
	conditionRows: ConditionRow[];
	errors: QueryBuilderError[];
	limit: number | null | undefined;
	useLimit: boolean;
	omitLabels: boolean;
}
