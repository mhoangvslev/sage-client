import { Algebra, Generator } from 'sparqljs';
/**
 * Create a SPARQL query (in string format) from a Basic Graph Pattern
 * @param  triples - Set of triple patterns
 * @return A conjunctive SPARQL query
 */
export declare function formatBGPQuery(generator: Generator, triples: Algebra.TripleObject[]): string;
/**
 * Create a SPARQL query (in string format) from a set of Basic Graph Patterns
 * @param  bgps - Set of Basic Graph Patterns, i.e., a set of set of triple patterns
 * @return A SPARQL query
 */
export declare function formatManyBGPQuery(generator: Generator, bgps: Array<Algebra.TripleObject[]>): string;
/**
 * Create a SPARQL query (in string format) from a set of Basic Graph Patterns, Filters and Binds
 * @param  variables - Set of variables to project
 * @param  nodes - Set of Basic Graph Patterns (i.e., a set of set of triple patterns), Filters and Binds
 * @return A SPARQL query
 */
export declare function formatManyBGPWithFiltersAndBindsQuery(generator: Generator, variables: Array<string> | undefined, prefixes: any, nodes: Array<Algebra.BGPNode | Algebra.BindNode | Algebra.FilterNode | Algebra.GroupNode>): string;
