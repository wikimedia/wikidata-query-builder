import allowedDatatypes from '@/allowedDataTypes';
import RootState, {
	DEFAULT_LIMIT,
	ConditionRow,
	DateValue,
	ItemValue,
	LexemeValue,
	SenseValue,
	FormValue,
	QuantityValue,
	StringValue,
	Value,
	PropertyValue,
} from './RootState';
import QueryRepresentation, { ConditionValue } from '@/sparql/QueryRepresentation';
import Property from '@/data-model/Property';
import QueryBuilderError from '@/data-model/QueryBuilderError';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import ConditionRelation from '@/data-model/ConditionRelation';
import ReferenceRelation from '@/data-model/ReferenceRelation';

function getQueryValueFromStoreValue( datatype: string, storeValue: Value ): ConditionValue {
	if ( storeValue === null ) {
		return '';
	}
	if ( datatype === 'wikibase-item' ) {
		return ( storeValue as ItemValue ).id;
	}
	if ( datatype === 'wikibase-lexeme' ) {
		return ( storeValue as LexemeValue ).id;
	}
	if ( datatype === 'wikibase-sense' ) {
		return ( storeValue as SenseValue ).id;
	}
	if ( datatype === 'wikibase-form' ) {
		return ( storeValue as FormValue ).id;
	}
	if ( datatype === 'wikibase-property' ) {
		return ( storeValue as PropertyValue ).id;
	}
	if ( datatype === 'quantity' ) {
		return {
			value: ( storeValue as QuantityValue ).value,
			unit: ( storeValue as QuantityValue ).unit?.id || null,
		};
	}
	if ( datatype === 'time' ) {
		const dateValue = storeValue as DateValue;
		if ( dateValue.parseResult === null ) {
			throw new Error( 'invalid time value' );
		}
		return {
			value: dateValue.parseResult.value.time,
			precision: dateValue.parseResult.value.precision,
		};
	}
	return storeValue as StringValue;
}

export default {
	query( rootState: RootState ): QueryRepresentation {
		return {
			conditions: rootState.conditionRows.map( ( condition ) => {
				if ( condition.propertyData.datatype === null ) {
					throw new Error( 'missing datatype!' );
				}
				return {
					propertyId: condition.propertyData.id,
					value: getQueryValueFromStoreValue( condition.propertyData.datatype, condition.valueData.value ),
					referenceRelation: condition.referenceRelation,
					propertyValueRelation: condition.propertyValueRelationData.value,
					datatype: condition.propertyData.datatype,
					subclasses: condition.subclasses,
					conditionRelation: condition.conditionRelation,
					negate: condition.negate,
				};
			} ),
			...rootState.useLimit && { limit: rootState.limit ?? DEFAULT_LIMIT },
			omitLabels: rootState.omitLabels,
		};
	},
	getConditionRows( rootState: RootState ): ConditionRow[] {
		return rootState.conditionRows;
	},
	property( rootState: RootState ) {
		return ( conditionIndex: number ): ( Property | null ) => {
			if ( !rootState.conditionRows[ conditionIndex ].propertyData?.id ) {
				return null;
			}
			return rootState.conditionRows[ conditionIndex ].propertyData;
		};
	},
	propertyError( rootState: RootState ) {
		return ( conditionIndex: number ): ( QueryBuilderError | null ) => {
			return rootState.conditionRows[ conditionIndex ].propertyData.propertyError;
		};
	},
	datatype( rootState: RootState ) {
		return ( conditionIndex: number ): string | null => {
			return rootState.conditionRows[ conditionIndex ].propertyData.datatype;
		};
	},
	limitedSupport( rootState: RootState ) {
		return ( conditionIndex: number ): boolean => {
			if ( !rootState.conditionRows[ conditionIndex ].propertyData.isPropertySet ) {
				return false;
			}
			const datatype = rootState.conditionRows[ conditionIndex ].propertyData.datatype;
			return datatype !== null && !allowedDatatypes.includes( datatype );
		};
	},
	value( rootState: RootState ) {
		return ( conditionIndex: number ): Value => {
			return rootState.conditionRows[ conditionIndex ].valueData.value;
		};
	},
	valueError( rootState: RootState ) {
		return ( conditionIndex: number ): ( QueryBuilderError | null ) => {
			return rootState.conditionRows[ conditionIndex ].valueData.valueError;
		};
	},
	propertyValueRelation( rootState: RootState ) {
		return ( conditionIndex: number ): PropertyValueRelation => {
			return rootState.conditionRows[ conditionIndex ].propertyValueRelationData.value;
		};
	},
	referenceRelation( rootState: RootState ) {
		return ( conditionIndex: number ): ReferenceRelation => {
			return rootState.conditionRows[ conditionIndex ].referenceRelation;
		};
	},
	negate( rootState: RootState ) {
		return ( conditionIndex: number ): boolean => {
			return rootState.conditionRows[ conditionIndex ].negate;
		};
	},
	subclasses( rootState: RootState ) {
		return ( conditionIndex: number ): boolean => {
			return rootState.conditionRows[ conditionIndex ].subclasses;
		};
	},
	conditionRelation( rootState: RootState ) {
		return ( conditionIndex: number ): ConditionRelation | null => {
			return rootState.conditionRows[ conditionIndex ].conditionRelation;
		};
	},
};
