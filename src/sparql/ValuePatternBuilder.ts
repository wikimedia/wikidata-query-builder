import { Condition } from '@/sparql/QueryRepresentation';
import { Pattern } from 'sparqljs';

export default interface ValuePatternBuilder {
	buildValuePatternFromCondition(
		condition: Condition,
		conditionIndex: number,
		repeatingPropertyIndex: string
	): Pattern[];
}
