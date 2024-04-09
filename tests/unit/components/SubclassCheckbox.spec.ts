import { Checkbox } from '@wmde/wikit-vue-components';
import SubclassCheckbox from '@/components/SubclassCheckbox.vue';
import { shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-banana-i18n';
import { createStore } from 'vuex';

const i18n = createI18n( {
	messages: {},
	locale: 'en',
	wikilinks: true,
} );

describe( 'SubclassCheckbox.vue', () => {
	it( 'updates the store when user checks include subclasses checkbox', async () => {
		const subclasses = true;
		const subclassesGetter = () => () => ( subclasses );
		const store = createStore( { getters: { subclassesGetter } } );

		const wrapper = shallowMount( SubclassCheckbox, {
			global: {
				plugins: [ store, i18n ],
			},
			props: {
				'condition-index': 0,
				isChecked: false,
			},
		} );

		store.dispatch = jest.fn();

		wrapper.findComponent( Checkbox ).vm.$emit( 'update:checked', true );

		expect( wrapper.emitted( 'subclass-check' ) ).toBeTruthy();
		expect( wrapper.emitted( 'subclass-check' ) ).toStrictEqual( [ [ true ] ] );
	} );
} );
