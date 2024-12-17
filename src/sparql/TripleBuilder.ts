import ReferenceRelation from '@/data-model/ReferenceRelation';
import SyntaxBuilder from '@/sparql/SyntaxBuilder';
import { FilterPattern, Triple, VariableTerm } from 'sparqljs';
import rdfNamespaces from '@/sparql/rdfNamespaces';

export default class TripleBuilder {

	private readonly syntaxBuilder: SyntaxBuilder;

	public constructor() {
		this.syntaxBuilder = new SyntaxBuilder();
	}

	public buildReferenceFilterPattern(
		referenceRelation: ReferenceRelation,
		statementVariable: VariableTerm,
	): FilterPattern | null {
		if ( referenceRelation === ReferenceRelation.Regardless ) {
			return null;
		}
		const referencePattern = this.syntaxBuilder.buildSimpleTriple(
			statementVariable,
			rdfNamespaces.prov + 'wasDerivedFrom',
			{
				termType: 'Variable',
				value: 'reference',
			},
		);
		return {
			type: 'filter',
			expression: {
				type: 'operation',
				operator: referenceRelation === ReferenceRelation.With ? 'exists' : 'notexists',
				args: [ this.syntaxBuilder.buildBgpPattern( [ referencePattern ] ) ],
			},
		} as FilterPattern;
	}

	public buildAnyValueTripe(): Triple {
		return {
			subject: {
				termType: 'Variable',
				value: 'item',
			},
			predicate: {
				termType: 'NamedNode',
				value: rdfNamespaces.wikibase + 'sitelinks',
			},
			object: {
				termType: 'BlankNode',
				value: 'anyValue',
			},
		};
	}

	public buildLabelServiceTriple(): Triple {
		return {
			subject: {
				termType: 'NamedNode',
				value: rdfNamespaces.bd + 'serviceParam',
			},
			predicate: {
				termType: 'NamedNode',
				value: rdfNamespaces.wikibase + 'language',
			},
			object: {
				termType: 'Literal',
				value: '[AUTO_LANGUAGE],mul,en',
			},
		};
	}

}
