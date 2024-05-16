import getters from '@/store/getters';
import QueryRepresentation from '@/sparql/QueryRepresentation';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import ReferenceRelation from '@/data-model/ReferenceRelation';
import { setActivePinia, createPinia } from 'pinia';
import { useStore } from '@/store/index';
import { createTestingPinia } from '@pinia/testing';
import { getFreshRootState } from '../../util/store';

beforeEach( () => {
	setActivePinia( createPinia() );
} );

describe( 'getters', () => {

	describe( 'limitedSupport', () => {
		it( 'returns false if the datatype is supported', () => {
			const pinia = createTestingPinia( {
				initialState: {
					store: getFreshRootState(),
				},
			} );
			const store = useStore( pinia );
			const state = store.$state;

			expect( getters.limitedSupport( state )( 0 ) ).toBe( false );
		} );

		it( 'returns false the property is empty', () => {
			const pinia = createTestingPinia( {
				initialState: {
					store: getFreshRootState(),
				},
			} );
			const store = useStore( pinia );
			const state = store.$state;

			expect( getters.limitedSupport( state )( 0 ) ).toBe( false );
		} );

		it( 'returns true the datatype is unsupported', () => {

			const pinia = createTestingPinia( {
				initialState: {
					store: getFreshRootState(),
				},
			} );

			const store = useStore( pinia );
			const state = store.$state;
			state.conditionRows[ 0 ].propertyData.datatype = 'I am not supported';

			expect( getters.limitedSupport( state )( 0 ) ).toBe( true );
		} );
	} );

	describe( 'conditionRelation', () => {
		it( 'returns conditionRelation null if conditionRows.length === 1', () => {
			const pinia = createTestingPinia( {
				initialState: {
					store: getFreshRootState(),
				},
			} );

			const store = useStore( pinia );
			const state = store.$state;

			expect( getters.conditionRelation( state )( 0 ) ).toBe( null );
		} );
	} );

	describe( 'referenceRelation', () => {
		it( 'returns referenceRelation "regardless" by default', () => {
			const pinia = createTestingPinia( {
				initialState: {
					store: getFreshRootState(),
				},
			} );

			const store = useStore( pinia );
			const state = store.$state;

			expect( getters.referenceRelation( state )( 0 ) ).toBe( ReferenceRelation.Regardless );
		} );
	} );

	describe( 'query', () => {
		it( 'returns the QueryRepresentation of the RootState', () => {

			const expectedValue: QueryRepresentation = {
				conditions: [
					{
						propertyId: 'P123',
						value: 'foo',
						propertyValueRelation: PropertyValueRelation.Matching,
						referenceRelation: ReferenceRelation.Regardless,
						datatype: 'string',
						subclasses: false,
						conditionRelation: null,
						negate: false,
					},
				],
				omitLabels: true,
			};

			const pinia = createTestingPinia( {
				initialState: {
					store: getFreshRootState(),
				},
			} );

			const store = useStore( pinia );
			const state = store.$state;

			expect( getters.query( state ) ).toStrictEqual( expectedValue );
		} );

		it( 'returns the QueryRepresentation of the RootState with a unit value', () => {

			const pinia = createTestingPinia( {
				initialState: {
					store: getFreshRootState(),
				},
			} );

			const store = useStore( pinia );
			const state = store.$state;

			state.conditionRows[ 0 ].propertyData.datatype = 'quantity';
			state.conditionRows[ 0 ].valueData.value = { value: 10, unit: { id: 'mts', label: 'Meters ' } };

			const expectedValue: QueryRepresentation = {
				conditions: [
					{
						propertyId: 'P123',
						value: { value: 10, unit: 'mts' },
						propertyValueRelation: PropertyValueRelation.Matching,
						referenceRelation: ReferenceRelation.Regardless,
						datatype: 'quantity',
						subclasses: false,
						conditionRelation: null,
						negate: false,
					},
				],
				omitLabels: true,
			};

			expect( getters.query( state ) ).toStrictEqual( expectedValue );
		} );

		it.each( [
			'wikibase-item',
			'wikibase-lexeme',
			'wikibase-sense',
			'wikibase-form',
			'wikibase-property',
		] )( 'returns the QueryRepresentation of the RootState with an entity value (%s)', ( dataType ) => {
			const pinia = createTestingPinia( {
				initialState: {
					store: getFreshRootState(),
				},
			} );

			const store = useStore( pinia );
			const state = store.$state;
			state.conditionRows[ 0 ].propertyData.datatype = dataType;
			state.conditionRows[ 0 ].valueData.value = { id: 'X0', label: 'fake entity' };

			const expectedValue: QueryRepresentation = {
				conditions: [
					{
						propertyId: 'P123',
						value: 'X0',
						propertyValueRelation: PropertyValueRelation.Matching,
						referenceRelation: ReferenceRelation.Regardless,
						datatype: dataType,
						subclasses: false,
						conditionRelation: null,
						negate: false,
					},
				],
				omitLabels: true,
			};

			expect( getters.query( state ) ).toStrictEqual( expectedValue );
		} );

		it( 'returns the QueryRepresentation of the RootState with a limit', () => {
			const pinia = createTestingPinia( {
				initialState: {
					store: getFreshRootState(),
				},
			} );

			const store = useStore( pinia );
			const state = store.$state;
			state.limit = 20;
			state.useLimit = true;

			const expectedValue: QueryRepresentation = {
				conditions: [
					{
						propertyId: 'P123',
						value: 'foo',
						propertyValueRelation: PropertyValueRelation.Matching,
						referenceRelation: ReferenceRelation.Regardless,
						datatype: 'string',
						subclasses: false,
						conditionRelation: null,
						negate: false,
					},
				],
				omitLabels: true,
				limit: 20,
			};

			expect( getters.query( state ) ).toStrictEqual( expectedValue );
		} );

		it( 'returns the QueryRepresentation of the RootState with subclasses', () => {
			const pinia = createTestingPinia( {
				initialState: {
					store: getFreshRootState(),
				},
			} );

			const store = useStore( pinia );
			const state = store.$state;

			state.conditionRows[ 0 ].subclasses = true;

			const expectedValue: QueryRepresentation = {
				conditions: [
					{
						propertyId: 'P123',
						value: 'foo',
						propertyValueRelation: PropertyValueRelation.Matching,
						referenceRelation: ReferenceRelation.Regardless,
						datatype: 'string',
						subclasses: true,
						conditionRelation: null,
						negate: false,
					},
				],
				omitLabels: true,
			};

			expect( getters.query( state ) ).toStrictEqual( expectedValue );
		} );

		it( 'returns the QueryRepresentation of the RootState with negate = true', () => {
			const pinia = createTestingPinia( {
				initialState: {
					store: getFreshRootState(),
				},
			} );

			const store = useStore( pinia );
			const state = store.$state;
			state.conditionRows[ 0 ].negate = true;

			state.conditionRows[ 0 ].subclasses = false;

			const expectedValue: QueryRepresentation = {
				conditions: [
					{
						propertyId: 'P123',
						value: 'foo',
						propertyValueRelation: PropertyValueRelation.Matching,
						referenceRelation: ReferenceRelation.Regardless,
						datatype: 'string',
						subclasses: false,
						conditionRelation: null,
						negate: true,
					},
				],
				omitLabels: true,
			};

			expect( getters.query( state ) ).toStrictEqual( expectedValue );
		} );

	} );
} );
