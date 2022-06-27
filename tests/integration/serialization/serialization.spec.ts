import QueryDeserializer from '@/serialization/QueryDeserializer';
import QuerySerializer from '@/serialization/QuerySerializer';
import { getFreshConditionRow, getInitialState, newEmptyPropertyData } from '@/store';
import RootState, { ConditionRow } from '@/store/RootState';

function unsetStateConditionIds( state: RootState ): void {
	state.conditionRows.forEach( ( row ) => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		row.conditionId = null;
	} );
}

function replaceLabelsWithId( state: RootState ): void {
	state.conditionRows.forEach( ( row ) => {
		if ( row.propertyData.id ) {
			row.propertyData.label = row.propertyData.id;
		}

		if ( typeof row.valueData?.value !== 'string' ) {
			if ( row.valueData?.value && 'id' in row.valueData?.value ) {
				row.valueData.value.label = row.valueData.value.id;
			}
		}
	} );
}

describe( 'serialization', () => {
	it( 'serializes and deserializes the initial state', () => {
		const initialState = getInitialState();
		const serializer = new QuerySerializer();
		const deserializer = new QueryDeserializer();

		const serializedState = serializer.serialize( initialState );

		expect( serializedState ).toBe( `{"conditions":[{
				"propertyId":"",
				"propertyDataType":null,
				"propertyValueRelation":"matching",
				"referenceRelation":"regardless",
				"value":"",
				"subclasses":false,
				"conditionRelation": null,
				"negate":false}],
			"limit":100,
			"useLimit":true,
			"omitLabels":false}`.replace( /\s+/g, '' ) );

		const deserializedState = deserializer.deserialize( serializedState );

		unsetStateConditionIds( initialState );
		unsetStateConditionIds( deserializedState );
		expect( deserializedState ).toStrictEqual( initialState );
	} );

	it( 'serializes and deserializes a condition with wikibase-item property and value', () => {
		const testState = getInitialState();
		const itemConditionRow: ConditionRow = {
			...getFreshConditionRow( true ),
			propertyData: {
				...newEmptyPropertyData(),
				id: 'P31',
				datatype: 'wikibase-item',
				label: 'instance of',
				isPropertySet: true,
			},
		};
		itemConditionRow.valueData.value = {
			id: 'Q5',
			label: 'human',
		};
		testState.conditionRows = [ itemConditionRow ];
		const serializer = new QuerySerializer();
		const deserializer = new QueryDeserializer();

		const serializedState = serializer.serialize( testState );

		expect( serializedState ).toBe( `{"conditions":[{
				"propertyId":"P31",
				"propertyDataType":"wikibase-item",
				"propertyValueRelation":"matching",
				"referenceRelation":"regardless",
				"value":"Q5",
				"subclasses":false,
				"conditionRelation": null,
				"negate":false}],
			"limit":100,
			"useLimit":true,
			"omitLabels":false}`.replace( /\s+/g, '' ) );

		const deserializedState = deserializer.deserialize( serializedState );

		unsetStateConditionIds( testState );
		unsetStateConditionIds( deserializedState );
		replaceLabelsWithId( testState );
		expect( deserializedState ).toStrictEqual( testState );
	} );

	it( 'serializes and deserializes a condition with wikibase-item property that has been unset.', () => {
		const testState = getInitialState();
		const itemConditionRow: ConditionRow = {
			...getFreshConditionRow( true ),
			propertyData: {
				...newEmptyPropertyData(),
				id: 'P31',
				datatype: 'wikibase-item',
				label: 'instance of',
				isPropertySet: false,
			},
		};
		itemConditionRow.valueData.value = {
			id: 'Q5',
			label: 'human',
		};
		testState.conditionRows = [ itemConditionRow ];
		const serializer = new QuerySerializer();
		const deserializer = new QueryDeserializer();

		const serializedState = serializer.serialize( testState );

		expect( serializedState ).toBe( `{"conditions":[{
				"propertyId":"",
				"propertyDataType":"wikibase-item",
				"propertyValueRelation":"matching",
				"referenceRelation":"regardless",
				"value":"Q5",
				"subclasses":false,
				"conditionRelation": null,
				"negate":false}],
			"limit":100,
			"useLimit":true,
			"omitLabels":false}`.replace( /\s+/g, '' ) );

		const deserializedState = deserializer.deserialize( serializedState );

		unsetStateConditionIds( testState );
		unsetStateConditionIds( deserializedState );
		replaceLabelsWithId( testState );
		testState.conditionRows[ 0 ].propertyData.id = '';
		testState.conditionRows[ 0 ].propertyData.label = '';
		expect( deserializedState ).toStrictEqual( testState );
	} );

	it( 'serializes and deserializes a state with omit labels and limit changed', () => {
		const initialState = getInitialState();
		initialState.omitLabels = true;
		initialState.limit = 42;
		initialState.useLimit = false;
		const serializer = new QuerySerializer();
		const deserializer = new QueryDeserializer();

		const serializedState = serializer.serialize( initialState );

		expect( serializedState ).toBe( `{"conditions":[{
				"propertyId":"",
				"propertyDataType":null,
				"propertyValueRelation":"matching",
				"referenceRelation":"regardless",
				"value":"",
				"subclasses":false,
				"conditionRelation": null,
				"negate":false}],
			"limit":42,
			"useLimit":false,
			"omitLabels":true}`.replace( /\s+/g, '' ) );

		const deserializedState = deserializer.deserialize( serializedState );

		unsetStateConditionIds( initialState );
		unsetStateConditionIds( deserializedState );
		expect( deserializedState ).toStrictEqual( initialState );
	} );
} );
