import ConditionRelation from '@/data-model/ConditionRelation';
import TimeValue from '@/data-model/TimeValue';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import ReferenceRelation from '@/data-model/ReferenceRelation';
import UnitValue from '@/data-model/UnitValue';

export type ConditionValue = string | UnitValue | TimeValue;

export type Condition = {
	propertyId: string;
	value: ConditionValue;
	datatype: string; // FIXME: make enum?
	propertyValueRelation: PropertyValueRelation;
	referenceRelation: ReferenceRelation;
	subclasses: boolean;
	conditionRelation: ConditionRelation | null;
	negate: boolean;
};

export default interface QueryRepresentation {
	conditions: Condition[];
	limit?: number;
	omitLabels: boolean;
}
