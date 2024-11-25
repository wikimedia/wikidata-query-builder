export interface ErrorProp { type: 'error'|'warning'; message: string }

export type MenuItem = {
	label: string;
	description: string;
	tag?: string; // for internal use
};
