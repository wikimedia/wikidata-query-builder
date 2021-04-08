export enum BasePropertyValueRelation {
	Matching = 'matching',
	NotMatching = 'without',
	Regardless = 'regardless-of-value',
}

enum RangePropertyValueRelation {
	LessThan = 'less-than',
	MoreThan = 'more-than',
}

const PropertyValueRelation = {
	...BasePropertyValueRelation,
	...RangePropertyValueRelation,
};

type PropertyValueRelation = BasePropertyValueRelation | RangePropertyValueRelation;

export default PropertyValueRelation;
