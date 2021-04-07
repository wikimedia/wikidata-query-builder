import DateValuePatternBuilder from '@/sparql/DateValuePatternBuilder';
import ItemValueBuilder from '@/sparql/ItemValueBuilder';
import LimitedSupportPatternBuilder from '@/sparql/LimitedSupportPatternBuilder';
import QuantityValuePatternBuilder from '@/sparql/QuantityValuePatternBuilder';
import { Condition } from '@/sparql/QueryRepresentation';
import StringValuePatternBuilder from '@/sparql/StringValuePatternBuilder';
import TripleBuilder from '@/sparql/TripleBuilder';
import ValuePatternBuilder from '@/sparql/ValuePatternBuilder';
import { Pattern } from 'sparqljs';

export default class PatternBuilder implements ValuePatternBuilder {
	private tripleBuilder: TripleBuilder;

	public constructor() {
		this.tripleBuilder = new TripleBuilder();
	}

	public buildValuePatternFromCondition( condition: Condition, conditionIndex: number ): Pattern[] {
		return this.getValuePatternBuilderForDatatype( condition.datatype )
			.buildValuePatternFromCondition( condition, conditionIndex );
	}

	private getValuePatternBuilderForDatatype( datatype: string ): ValuePatternBuilder {
		switch ( datatype ) {
			case 'string':
			case 'external-id':
				return new StringValuePatternBuilder();
			case 'wikibase-item':
				return new ItemValueBuilder();
			case 'quantity':
				return new QuantityValuePatternBuilder();
			case 'time':
				return new DateValuePatternBuilder();
			default:
				return new LimitedSupportPatternBuilder();
		}
	}

	public buildLabelServicePattern(): Pattern {
		return {
			type: 'bgp',
			triples: [ this.tripleBuilder.buildLabelServiceTriple() ],
		};
	}

	public buildAnyValuePattern(): Pattern {
		return {
			type: 'bgp',
			triples: [ this.tripleBuilder.buildAnyValueTripe() ],
		};
	}
}
