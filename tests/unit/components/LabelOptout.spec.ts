import { CdxCheckbox } from '@wikimedia/codex';
import LabelOptout from '@/components/LabelOptout.vue';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-banana-i18n';
import { createTestingPinia } from '@pinia/testing';
import { useStore } from '@/store';

const i18n = createI18n( {
	messages: {},
	locale: 'en',
	wikilinks: true,
} );

describe( 'LabelOptout.vue', () => {
	it( 'updates the store when user checks label optout checkbox', async () => {
		const omitLabels = true;
		const omitLabelsGetter = (): boolean => false;

		const wrapper = mount( LabelOptout, {
			global: {
				plugins: [ createTestingPinia( {
					initialState: {
						omitLabels: omitLabelsGetter,
					},
				} ), i18n ],
			},
		} );

		const store = useStore();
		store.omitLabels = true;

		wrapper.findComponent( CdxCheckbox ).vm.$emit( 'update:modelValue', omitLabels );

		expect( store.setOmitLabels ).toHaveBeenCalledWith( omitLabels );

	} );
} );
