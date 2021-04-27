import PatternBuilder from '@/sparql/PatternBuilder';
import QueryRepresentation, { Condition } from '@/sparql/QueryRepresentation';
import rdfNamespaces from '@/sparql/rdfNamespaces';
import { Pattern, SelectQuery } from 'sparqljs';

type RootNode = ( Condition | Condition[] )[];

export default class QueryObjectBuilder {
	private queryObject: SelectQuery;
	private patternBuilder: PatternBuilder;
	private conditionIndex = 0;

	public constructor() {
		this.queryObject = {
			queryType: 'SELECT',
			distinct: true,
			variables: [],
			where: [],
			type: 'query',
			prefixes: rdfNamespaces,
		};
		this.patternBuilder = new PatternBuilder();
	}

	public buildFromQueryRepresentation( queryRepresentation: QueryRepresentation ): SelectQuery {

		this.queryObject.variables = [
			{
				termType: 'Variable',
				value: 'item',
			},
		];

		const conditions = this.buildConditionTree( queryRepresentation.conditions );

		conditions.forEach( ( condition ) => {
			if ( Array.isArray( condition ) ) {
				this.buildUnion( condition );
				return;
			}
			this.buildFromQueryCondition( condition );
		} );

		if ( this.queryObject.where ) {
			// If it's a negate query only, we need to add "any item" to it otherwise it returns empty result.
			let isOnlyNegateQuery = true;
			for ( let i = 0; i < this.queryObject.where?.length; i++ ) {
				const type = this.queryObject.where[ i ].type;
				if ( type !== 'minus' ) {
					isOnlyNegateQuery = false;
					break;
				}
			}

			if ( isOnlyNegateQuery ) {
				this.queryObject.where.unshift( this.patternBuilder.buildAnyValuePattern() );
			}
		}

		if ( queryRepresentation.limit ) {
			this.queryObject.limit = queryRepresentation.limit;
		}

		if ( !queryRepresentation.omitLabels ) {
			return this.wrapQueryWithLabel();
		}

		return this.queryObject;
	}

	private buildConditionTree( conditions: Condition[] ): RootNode {
		const rootNode: RootNode = [];
		conditions.forEach( ( condition ) => {
			if ( condition.conditionRelation === 'and' || condition.conditionRelation === null ) {
				this.attachToRootWithAnd( rootNode, condition );
				return;
			}
			this.attachToPreviousConditionWithOr( rootNode, condition );
		} );

		return rootNode;
	}

	private attachToPreviousConditionWithOr( rootNode: RootNode, condition: Condition ): void {
		if ( this.lastElementIsSingleCondition( rootNode ) ) {
			this.makeLastElementIntoConditionGroup( rootNode );
		}

		this.attachToExistingConditionGroup( rootNode, condition );
	}

	private attachToExistingConditionGroup( rootNode: RootNode, condition: Condition ): void {
		( rootNode[ rootNode.length - 1 ] as Condition[] ).push( condition );
	}

	private lastElementIsSingleCondition( rootNode: RootNode ): boolean {
		return !Array.isArray( rootNode[ rootNode.length - 1 ] );
	}

	private makeLastElementIntoConditionGroup( rootNode: RootNode ): void {
		rootNode.push( [ rootNode.pop() as Condition ] );
	}

	private attachToRootWithAnd( rootNode: RootNode, condition: Condition ): void {
		rootNode.push( condition );
	}

	private buildUnion( conditions: Condition[] ): void {
		const unionConditions = [];
		for ( let i = 0; i < conditions.length; i++ ) {
			const unionConditionGroup: Pattern = {
				type: 'group',
				patterns: this.patternBuilder.buildValuePatternFromCondition( conditions[ i ], this.conditionIndex++ ),
			};
			unionConditions.push( unionConditionGroup );
		}
		const union: Pattern = {
			type: 'union',
			patterns: unionConditions,
		};
		if ( !this.queryObject.where ) {
			this.queryObject.where = [];
		}
		this.queryObject.where.push( union );
	}

	private buildFromQueryCondition( condition: Condition ): void {
		if ( !this.queryObject.where ) {
			this.queryObject.where = [];
		}
		this.queryObject.where.push(
			...this.patternBuilder.buildValuePatternFromCondition( condition, this.conditionIndex++ ),
		);
		return;
	}

	private wrapQueryWithLabel(): SelectQuery {
		const wrapperQuery: SelectQuery = {
			queryType: 'SELECT',
			distinct: true,
			variables: [
				{
					termType: 'Variable',
					value: 'item',
				},
				{
					termType: 'Variable',
					value: 'itemLabel',
				},
			],
			where: [
				{
					type: 'service',
					patterns: [ this.patternBuilder.buildLabelServicePattern() ],
					name: {
						termType: 'NamedNode',
						value: rdfNamespaces.wikibase + 'label',
					},
					silent: false,
				},
			],
			type: 'query',
			prefixes: rdfNamespaces,
		};

		if ( !wrapperQuery.where ) {
			wrapperQuery.where = [];
		}
		this.queryObject.prefixes = {};
		wrapperQuery.where.push( {
			type: 'group',
			patterns: [ this.queryObject ],
		} );

		return wrapperQuery;
	}
}
