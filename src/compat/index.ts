import { defineComponent as defaultDefineComponent, ComponentOptions } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defineComponent: any = ( obj: ComponentOptions ) =>
	defaultDefineComponent( {
		...obj,
		compatConfig: {
			MODE: 3,
			RENDER_FUNCTION: 'suppress-warning',
			GLOBAL_MOUNT: false,
		},
	} );
