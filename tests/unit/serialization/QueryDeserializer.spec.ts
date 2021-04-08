import QueryDeserializer from '@/serialization/QueryDeserializer';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import RootState, { ConditionRow, Value } from '@/store/RootState';
import ReferenceRelation from '@/data-model/ReferenceRelation';
import ParseResult from '@/data-access/ParseResult';

function getStateConditionRow( propertyId: string, value: Value, datatype = 'string' ): ConditionRow {
	const simpleCondition =
		{
			propertyData: {
				id: propertyId,
				label: propertyId,
				datatype,
				isPropertySet: true,
				propertyError: null,
			},
			valueData: {
				value,
				valueError: null,
			},
			propertyValueRelationData: {
				value: PropertyValueRelation.Matching,
			},
			referenceRelation: ReferenceRelation.Regardless,
			conditionRelation: null,
			subclasses: false,
			negate: false,
			conditionId: '1',
		};

	return simpleCondition;
}

describe( 'QueryDeserializer', () => {

	it( 'deserializes the serializedObject and converts it to Rootstate', () => {
		const propertyId = 'P666';
		const value = 'blah';
		const propertyDataType = 'string';
		const limit = 10;
		const useLimit = true;
		const deserializer = new QueryDeserializer();
		const expectedRootState: RootState = {
			conditionRows: [ getStateConditionRow( propertyId, value ) ],
			limit,
			useLimit,
			errors: [],
			omitLabels: false,
		};
		const givenSerializedString = `
			{"conditions":[{
				"propertyId":"${propertyId}",
				"propertyDataType":"${propertyDataType}",
				"propertyValueRelation":"matching",
				"referenceRelation":"regardless",
				"value":"${value}",
				"subclasses":false,
				"conditionRelation":null,
				"negate":false}],
			"limit":${limit},
			"useLimit":${useLimit},
			"omitLabels":false}
		`;
		expect( deserializer.deserialize( givenSerializedString ) ).toEqual( expectedRootState );
	} );

	it( 'deserializes a condition with wikibase-item property datatype and value', () => {
		const givenSerialization = `
			{"conditions":[{
				"propertyId":"P31",
				"propertyDataType":"wikibase-item",
				"propertyValueRelation":"matching",
				"referenceRelation":"regardless",
				"value":"Q5",
				"subclasses":false,
				"conditionRelation":null,
				"negate":false}],
			"limit":100,
			"useLimit":true,
			"omitLabels": false}
		`;
		const deserializer = new QueryDeserializer();

		const deserializedState = deserializer.deserialize( givenSerialization );

		const expectedState: RootState = {
			conditionRows: [
				getStateConditionRow( 'P31', { label: 'Q5', id: 'Q5' }, 'wikibase-item' ),
			],
			limit: 100,
			useLimit: true,
			omitLabels: false,
			errors: [],
		};
		expect( deserializedState ).toStrictEqual( expectedState );
	} );

	it( 'throws an exception for an invalid query string', () => {
		const deserializer = new QueryDeserializer();
		expect( () => deserializer.deserialize( '{"foo":"bar"}' ) ).toThrow();
	} );

	it( 'throws an exception for a query string that is not valid JSON', () => {
		const deserializer = new QueryDeserializer();
		expect( () => deserializer.deserialize( 'foo=bar' ) ).toThrow();
	} );

	it( 'deserializes a condition with datatype quantity and only amount but no unit set', () => {
		const givenSerialization = `
			{"conditions":[{
				"propertyId":"P2044",
				"propertyDataType":"quantity",
				"propertyValueRelation":"matching",
				"referenceRelation":"regardless",
				"value": { "value":4800, "unit":null},
				"subclasses":false,
				"conditionRelation":null,
				"negate":false}],
			"limit":100,
			"useLimit":true,
			"omitLabels": false}
		`;
		const deserializer = new QueryDeserializer();

		const deserializedState = deserializer.deserialize( givenSerialization );

		const expectedState: RootState = {
			conditionRows: [
				getStateConditionRow( 'P2044', { value: 4800, unit: null, rawUnitInput: '' }, 'quantity' ),
			],
			limit: 100,
			useLimit: true,
			omitLabels: false,
			errors: [],
		};
		expect( deserializedState ).toStrictEqual( expectedState );
	} );

	it( 'deserializes a condition with datatype quantity and both amount and unit set', () => {
		const givenSerialization = `
			{"conditions":[{
				"propertyId":"P2044",
				"propertyDataType":"quantity",
				"propertyValueRelation":"matching",
				"referenceRelation":"regardless",
				"value": { "value":4800, "unit":"Q123"},
				"subclasses":false,
				"conditionRelation":null,
				"negate":false}],
			"limit":100,
			"useLimit":true,
			"omitLabels": false}
		`;
		const deserializer = new QueryDeserializer();

		const deserializedState = deserializer.deserialize( givenSerialization );

		const expectedState: RootState = {
			conditionRows: [
				getStateConditionRow(
					'P2044',
					{ value: 4800, unit: { id: 'Q123', label: 'Q123' }, rawUnitInput: '' },
					'quantity',
				),
			],
			limit: 100,
			useLimit: true,
			omitLabels: false,
			errors: [],
		};
		expect( deserializedState ).toStrictEqual( expectedState );
	} );

	it( 'deserializes a condition with datatype time', () => {
		const givenSerialization = `
			{"conditions":[{
				"propertyId":"P2044",
				"propertyDataType":"time",
				"propertyValueRelation":"matching",
				"referenceRelation":"regardless",
				"value": { "value":"+1994-02-08T00:00:00Z", "precision":11 },
				"subclasses":false,
				"conditionRelation":null,
				"negate":false}],
			"limit":100,
			"useLimit":true,
			"omitLabels": false}
		`;
		const deserializer = new QueryDeserializer();

		const deserializedState = deserializer.deserialize( givenSerialization );

		const parseResult: ParseResult = {
			value: {
				time: '+1994-02-08T00:00:00Z',
				timezone: 0,
				before: 0,
				after: 0,
				precision: 11,
				calendarmodel: '',
			},
			type: 'time',
		};

		const expectedState: RootState = {
			conditionRows: [
				getStateConditionRow(
					'P2044',
					{ parseResult, formattedValue: '+1994-02-08T00:00:00Z', precision: 11 },
					'time',
				),
			],
			limit: 100,
			useLimit: true,
			omitLabels: false,
			errors: [],
		};
		expect( deserializedState ).toStrictEqual( expectedState );
	} );

} );
