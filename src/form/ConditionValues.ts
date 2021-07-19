import Property from '@/data-model/Property';
import QueryBuilderError from '@/data-model/QueryBuilderError';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import { Value } from '@/store/RootState';

export default interface ConditionValues {
	property: Property | null;
	value: Value;
	propertyValueRelation: PropertyValueRelation;
}

export interface ConditionErrors {
	property: QueryBuilderError | null;
	value: QueryBuilderError | null;
}
