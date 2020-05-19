import { Bindings } from 'sparql-engine/dist/rdf/bindings';
import { PipelineStage } from 'sparql-engine/dist/engine/pipeline/pipeline-engine';
import { SageRequestClient } from '../sage-http-client';
import { Algebra } from 'sparqljs';
/**
 * An operator used to evaluate a SPARQL BGP query
 * @author Thomas Minier
 * @param bgp  - BGP to evaluate
 * @param sageClient - HTTP client used to query a Sage server
 * @return A stage of the pipeline which produces the query results
 */
export declare function SageBGPOperator(bgp: Algebra.TripleObject[], defaultGraph: string, sageClient: SageRequestClient): PipelineStage<Bindings>;
/**
 * An operator used to evaluate a SPARQL query with a set of BGPs
 * @author Thomas Minier
 * @param bgps  - Set of BGPs to evaluate, i.e., a set of set of triple patterns
 * @param sageClient - HTTP client used to query a Sage server
 * @return A stage of the pipeline which produces the query results
 */
export declare function SageManyBGPOperator(bgps: Array<Algebra.TripleObject[]>, defaultGraph: string, sageClient: SageRequestClient): PipelineStage<Bindings>;
/**
 * An operator used to evaluate a SPARQL query with a set of BGPs, Filters and Binds
 * @author Julien AIMONIER-DAVAT
 * @param variables - Set of variables to select
 * @param prefixes - Prefixes used in the query
 * @param nodes  - Set of BGPs, Filters and Binds to evaluate
 * @param sageClient - HTTP client used to query a Sage server
 * @return A stage of the pipeline which produces the query results
 */
export declare function SageManyBGPWithFiltersAndBindsOperator(variables: Array<string>, prefixes: any, nodes: Array<Algebra.BindNode | Algebra.BGPNode | Algebra.FilterNode | Algebra.GroupNode>, defaultGraph: string, sageClient: SageRequestClient): PipelineStage<Bindings>;
