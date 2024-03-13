import { Checkbox } from '@wmde/wikit-vue-components';
import LabelOptout from '@/components/LabelOptout.vue';
import { shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-banana-i18n';
import { createStore } from 'vuex';

const i18n = createI18n( {
	messages: {},
	locale: 'en',
	wikilinks: true,
} );

describe( 'LabelOptout.vue', () => {
	it( 'updates the store when user checks label optout checkbox', async () => {
		const omitLabels = true;
		const omitLabelsGetter = (): boolean => false;
		const store = createStore( {
			getters: { omitLabels: omitLabelsGetter },
		} );

		const wrapper = shallowMount( LabelOptout, {
			global: {
				plugins: [ store, i18n ],
			},
		} );
		store.dispatch = jest.fn();

		wrapper.findComponent( Checkbox ).vm.$emit( 'update:checked', omitLabels );

		expect( store.dispatch ).toHaveBeenCalledWith( 'setOmitLabels', omitLabels );

	} );
} );
