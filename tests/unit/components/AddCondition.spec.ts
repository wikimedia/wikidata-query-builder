import AddCondition from '@/components/AddCondition.vue';
import { CdxButton } from '@wikimedia/codex';
import { shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-banana-i18n';

const i18n = createI18n( {
	messages: {},
	locale: 'en',
	wikilinks: true,
} );

describe( 'AddCondition.vue', () => {
	it( 'emits an `add-condition` event when Add Condition button is clicked', async () => {
		const wrapper = shallowMount( AddCondition, {
			global: {
				plugins: [ i18n ],
			},
		} );

		await wrapper.findComponent( CdxButton ).trigger( 'click' );

		expect( wrapper.emitted( 'add-condition' ) ).toBeTruthy();
	} );
} );
