import QuerySerializer from '@/serialization/QuerySerializer';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import RootState, { ConditionRow, Value } from '@/store/RootState';
import ReferenceRelation from '@/data-model/ReferenceRelation';
import ParseResult from '@/data-access/ParseResult';

function getStateConditionRow( propertyId: string, value: Value, datatype = 'string' ): ConditionRow {
	const simpleCondition =
		{
			propertyData: {
				id: propertyId,
				label: 'some string',
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
			conditionId: '123',
		};

	return simpleCondition;
}

describe( 'QuerySerializer', () => {

	it( 'serializes a serialized object for sharing in a URL', () => {
		const propertyId = 'P666';
		const value = 'blah';
		const propertyDataType = 'string';
		const limit = 10;
		const useLimit = true;
		const serializer = new QuerySerializer();
		const givenStore: RootState = {
			conditionRows: [ getStateConditionRow( propertyId, value ) ],
			limit,
			useLimit,
			errors: [],
			omitLabels: false,
		};
		const expectedSerialization = `
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
			"omitLabels": false}
		`;
		expect( serializer.serialize( givenStore ) ).toEqual( expectedSerialization.replace( /\s+/g, '' ) );
	} );

	it( 'serializes a condition with datatype wikibase-item', () => {
		const givenState: RootState = {
			conditionRows: [ getStateConditionRow( 'P31', { id: 'Q5', label: 'human' }, 'wikibase-item' ) ],
			limit: 100,
			useLimit: true,
			errors: [],
			omitLabels: false,
		};
		const serializer = new QuerySerializer();

		const actualSerialization = serializer.serialize( givenState );

		const expectedSerialization = `
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
		expect( actualSerialization ).toEqual( expectedSerialization.replace( /\s+/g, '' ) );
	} );

	it( 'serializes a condition with unset property and without value', () => {
		const testCondition = getStateConditionRow( 'P31', null, 'string' );
		testCondition.propertyData.isPropertySet = false;
		const givenState: RootState = {
			conditionRows: [ testCondition ],
			limit: 100,
			useLimit: true,
			errors: [],
			omitLabels: false,
		};
		const serializer = new QuerySerializer();

		const actualSerialization = serializer.serialize( givenState );

		const expectedSerialization = `
			{"conditions":[{
				"propertyId":"",
				"propertyDataType":"string",
				"propertyValueRelation":"matching",
				"referenceRelation":"regardless",
				"value":"",
				"subclasses":false,
				"conditionRelation":null,
				"negate":false}],
			"limit":100,
			"useLimit":true,
			"omitLabels": false}
		`;
		expect( actualSerialization ).toEqual( expectedSerialization.replace( /\s+/g, '' ) );
	} );

	it( 'serializes a condition with datatype quantity and only amount but no unit set', () => {
		const givenState: RootState = {
			conditionRows: [ getStateConditionRow(
				'P2044',
				{ value: 4800, unit: null, rawUnitInput: '' },
				'quantity',
			) ],
			limit: 100,
			useLimit: true,
			errors: [],
			omitLabels: false,
		};
		const serializer = new QuerySerializer();

		const actualSerialization = serializer.serialize( givenState );

		const expectedSerialization = `
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
		expect( actualSerialization ).toEqual( expectedSerialization.replace( /\s+/g, '' ) );
	} );

	it( 'serializes a condition with datatype quantity and both amount and unit set', () => {
		const givenState: RootState = {
			conditionRows: [ getStateConditionRow(
				'P2044',
				{ value: 4800, unit: { id: 'Q123', label: 'metre' }, rawUnitInput: '' },
				'quantity',
			) ],
			limit: 100,
			useLimit: true,
			errors: [],
			omitLabels: false,
		};
		const serializer = new QuerySerializer();

		const actualSerialization = serializer.serialize( givenState );

		const expectedSerialization = `
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
		expect( actualSerialization ).toEqual( expectedSerialization.replace( /\s+/g, '' ) );
	} );

	it( 'serializes a condition with datatype time', () => {
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
		const givenState: RootState = {
			conditionRows: [ getStateConditionRow(
				'P2044',
				{ parseResult: parseResult, formattedValue: '+1994-02-08T00:00:00Z', precision: 11 },
				'time',
			) ],
			limit: 100,
			useLimit: true,
			errors: [],
			omitLabels: false,
		};
		const serializer = new QuerySerializer();
		const actualSerialization = serializer.serialize( givenState );
		const expectedSerialization = `
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
		expect( actualSerialization ).toEqual( expectedSerialization.replace( /\s+/g, '' ) );
	} );
} );
