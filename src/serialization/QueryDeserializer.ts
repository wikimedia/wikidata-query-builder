import DeserializationError from '@/serialization/DeserializationError';
import RootState, { ConditionRow, PropertyData, Value } from '@/store/RootState';
import SerializedCondition, { SerializedQuantityValue,
	SerializedDateValue, SerializedValue } from '@/data-model/SerializedObject';

export default class QueryDeserializer {
	public deserialize( queryString: string ): RootState {
		let queryObject;
		try {
			queryObject = JSON.parse( queryString );
		} catch ( e ) {
			throw new DeserializationError( 'query URL parameter is not valid JSON' );
		}
		const conditions: ConditionRow[] = [];
		let conditionId = 1;
		try {
			queryObject.conditions.forEach( ( condition: SerializedCondition ) => {
				conditions.push(
					{
						propertyData: this.getPropertyData( condition ),
						valueData: {
							value: this.getConditionValue( condition ),
							valueError: null,
						},
						propertyValueRelationData: {
							value: condition.propertyValueRelation,
						},
						referenceRelation: condition.referenceRelation,
						subclasses: condition.subclasses,
						conditionRelation: condition.conditionRelation,
						negate: condition.negate,
						conditionId: conditionId.toString(),
					},
				);
				conditionId++;
			} );
			return {
				conditionRows: conditions,
				useLimit: queryObject.useLimit,
				limit: queryObject.limit,
				errors: [],
				omitLabels: queryObject.omitLabels,
			};
		} catch ( e ) {
			throw new DeserializationError( 'invalid query URL parameter' );
		}
	}

	private getPropertyData( condition: SerializedCondition ): PropertyData {
		return {
			id: condition.propertyId,
			label: condition.propertyId,
			datatype: condition.propertyDataType,
			isPropertySet: condition.propertyId !== '',
			propertyError: null,
		};
	}

	private getConditionValue( condition: SerializedCondition ): Value {
		if ( condition.value === '' || condition.value === null ) {
			return null;
		}
		if ( this.isQuantityValue( condition, condition.value ) ) {
			return {
				value: condition.value.value,
				unit: condition.value.unit ? {
					id: condition.value.unit,
					label: condition.value.unit,
				} : null,
				rawUnitInput: '',
			};
		}
		if ( this.isDateValue( condition, condition.value ) ) {
			return {
				parseResult: {
					value: {
						time: condition.value.value,
						after: 0,
						before: 0,
						calendarmodel: '',
						precision: condition.value.precision,
						timezone: 0,
					},
					type: 'time',
				},
				formattedValue: condition.value.value,
				precision: condition.value.precision,
			};
		}
		if ( condition.propertyDataType === 'wikibase-item' ) {
			return {
				id: condition.value,
				label: condition.value,
			};
		}
		return condition.value;
	}

	private isQuantityValue( condition: SerializedCondition, _conditionValue: SerializedValue ):
		_conditionValue is SerializedQuantityValue {
		return condition.propertyDataType === 'quantity';
	}

	private isDateValue( condition: SerializedCondition, _conditionValue: SerializedValue ):
		_conditionValue is SerializedDateValue {
		return condition.propertyDataType === 'time';
	}
}
