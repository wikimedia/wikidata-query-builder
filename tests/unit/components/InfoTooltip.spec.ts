import InfoTooltip from '@/components/InfoTooltip.vue';
import { mount } from '@vue/test-utils';
import { CdxButton } from '@wikimedia/codex';

describe( 'InfoTooltip component', () => {
	// There's not much we can test here
	it( 'shows the icon and shows the text on hover', () => {
		const props = {
			message: 'The popover text.',
			position: 'top',
		};
		const wrapper = mount( InfoTooltip, {
			props: props,
		} );

		expect( wrapper.findAllComponents( CdxButton ) ).toHaveLength( 1 );
		expect( wrapper.vm.$props ).toStrictEqual( props );
	} );
} );
