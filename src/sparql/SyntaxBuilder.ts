import {
	BgpPattern,
	BlankTerm,
	Expression,
	FilterPattern,
	IriTerm,
	LiteralTerm,
	OperationExpression,
	PropertyPath,
	QuadTerm,
	Term,
	Triple,
	VariableTerm,
} from 'sparqljs';

export default class SyntaxBuilder {

	public buildSimpleTriple(
		subject: IriTerm | BlankTerm | VariableTerm | QuadTerm,
		predicateValue: string,
		object: Term,
	): Triple {
		return {
			subject,
			predicate: {
				termType: 'NamedNode',
				value: predicateValue,
			},
			object,
		};
	}

	public buildPathTriple(
		subject: IriTerm | BlankTerm | VariableTerm | QuadTerm,
		pathItems: ( string | PropertyPath )[],
		object: Term,
	): Triple {
		return {
			subject,
			predicate: this.buildPropertyPath(
				'/',
				pathItems.map( ( predicateItem ): IriTerm | PropertyPath => {
					if ( typeof predicateItem === 'string' ) {
						return {
							termType: 'NamedNode',
							value: predicateItem,
						};
					}
					return predicateItem;
				} ) ),
			object,
		};
	}

	public buildPropertyPath(
		pathType: '|' | '/' | '^' | '+' | '*' | '!',
		pathItems: ( IriTerm | PropertyPath )[],
	): PropertyPath {
		return {
			type: 'path',
			pathType,
			items: pathItems,
		};
	}

	public buildVariableTermFromName( name: string ): VariableTerm {
		return {
			termType: 'Variable',
			value: name,
		};
	}

	public buildBgpPattern( triples: Triple[] ): BgpPattern {
		return {
			type: 'bgp',
			triples,
		};
	}

	public buildOperatorFilterPattern(
		leftSideTerm: Expression, operator: string, rightSideTerm: Expression,
	): FilterPattern {
		return {
			type: 'filter',
			expression: this.buildOperationsExpression(
				leftSideTerm,
				operator,
				rightSideTerm,
			),
		};
	}

	public buildOperationsExpression(
		leftSide: Expression,
		operator: string,
		rightSide: Expression,
	): OperationExpression {
		return {
			type: 'operation',
			operator,
			args: [
				leftSide,
				rightSide,
			],
		};
	}

	public buildLiteralTermForDecimalNumber( numericValue: number ): LiteralTerm {
		return {
			termType: 'Literal',
			value: String( numericValue ),
			datatype: {
				termType: 'NamedNode',
				value: 'http://www.w3.org/2001/XMLSchema#decimal',
				// Todo: should we add equals method?
			},
		} as LiteralTerm;
	}

	public buildLiteralTermForDateTime( dateTime: string ): LiteralTerm {
		return {
			termType: 'Literal',
			value: dateTime,
			datatype: {
				termType: 'NamedNode',
				value: 'http://www.w3.org/2001/XMLSchema#dateTime',
			},
		} as LiteralTerm;
	}
}
