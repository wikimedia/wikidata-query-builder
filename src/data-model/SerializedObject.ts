import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import ConditionRelation from './ConditionRelation';
import ReferenceRelation from '@/data-model/ReferenceRelation';

export interface SerializedQuantityValue {
	value: number;
	unit: null | string;
}

export interface SerializedDateValue {
	value: string;
	precision: number;
}

export type SerializedValue = string | SerializedQuantityValue | SerializedDateValue;

export default interface SerializedCondition {
	propertyId: string;
	propertyDataType: string | null;
	propertyValueRelation: PropertyValueRelation;
	referenceRelation: ReferenceRelation;
	value: SerializedValue;
	subclasses: boolean;
	conditionRelation: ConditionRelation | null;
	negate: boolean;
}
