import Property from '@/data-model/Property';
import Error from '@/data-model/Error';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import { Value } from '@/store/RootState';

export default interface ConditionValues {
	property: Property | null;
	value: Value;
	propertyValueRelation: PropertyValueRelation;
}

export interface ConditionErrors {
	property: Error | null;
	value: Error | null;
}
