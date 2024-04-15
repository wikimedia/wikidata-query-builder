import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import ReferenceRelation from '@/data-model/ReferenceRelation';
import RootState from '@/store/RootState';
// import newMockServiceContainer from '../../util/newMockServiceContainer';

import { setActivePinia, createPinia } from 'pinia';
import { useStore } from '@/store';

describe( 'createStore', () => {

	beforeEach( () => {
		// creates a fresh pinia and makes it active
		// so it's automatically picked up by any useStore() call
		// without having to pass it to it: `useStore(pinia)`
		setActivePinia( createPinia() );
	} );

	it( 'creates the initial state', () => {
		const store = useStore();

		const expectedInitialState: RootState = {
			conditionRows: [ {
				negate: false,
				propertyData: {
					id: '',
					label: '',
					datatype: null,
					propertyError: null,
					isPropertySet: false,
				},
				valueData: {
					value: null,
					valueError: null,
				},
				propertyValueRelationData: {
					value: PropertyValueRelation.Matching,
				},
				referenceRelation: ReferenceRelation.Regardless,
				conditionRelation: null,
				subclasses: false,
				conditionId: store.conditionRows[ 0 ].conditionId, // this is auto-generated and random
			} ],
			errors: [],
			limit: 100,
			omitLabels: false,
			useLimit: true,
		};
		expect( store ).toBeDefined();
		expect( store.$state ).toStrictEqual( expectedInitialState );
	} );
} );
