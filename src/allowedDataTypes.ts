const allowedDataTypes = [
	/* string typed datatypes */
	'string',
	'external-id',
	'url',
	'wikibase-item',
	'wikibase-lexeme',
	'quantity',
	'time',
	'wikibase-sense',
	'wikibase-form',
	'wikibase-property',
	/* other (non-string) typed datatypes - TODO: add support
	'commonsMedia',
	'geo-shape',
	'tabular-data',
	'math',
	'musical-notation',
	'globe-coordinate',
	'monolingualtext',
    */
];

export default allowedDataTypes;
