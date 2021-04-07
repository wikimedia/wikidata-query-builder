import RootState, { ConditionRow, ItemValue, QuantityValue } from '@/store/RootState';
import SerializedObject, { SerializedValue } from '@/data-model/SerializedObject';

export default class QuerySerializer {
	public serialize( state: RootState ): string {
		const conditions: SerializedObject[] = [];
		state.conditionRows.forEach( ( condition: ConditionRow ) => {
			conditions.push(
				{
					propertyId: condition.propertyData.isPropertySet ? condition.propertyData.id : '',
					propertyDataType: condition.propertyData.datatype,
					propertyValueRelation: condition.propertyValueRelationData.value,
					referenceRelation: condition.referenceRelation,
					value: this.getValueFromCondition( condition ),
					subclasses: condition.subclasses,
					conditionRelation: condition.conditionRelation,
					negate: condition.negate,
				},
			);
		} );
		return JSON.stringify( {
			conditions,
			limit: state.limit,
			useLimit: state.useLimit,
			omitLabels: state.omitLabels,
		} );
	}

	private getValueFromCondition( condition: ConditionRow ): SerializedValue {
		if ( !condition.valueData.value ) {
			return ''; // maybe better return null?
		}
		if ( condition.propertyData.datatype === 'wikibase-item' ) {
			return ( condition.valueData.value as ItemValue ).id;
		}
		if ( condition.propertyData.datatype === 'quantity' ) {
			const quantityValue: QuantityValue = condition.valueData.value as QuantityValue;
			return {
				value: quantityValue.value,
				unit: quantityValue.unit ? quantityValue.unit.id : null,
			};
		}
		return condition.valueData.value as string;
	}
}
