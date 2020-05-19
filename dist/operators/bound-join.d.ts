import { Graph, ExecutionContext } from 'sparql-engine';
import { Bindings } from 'sparql-engine/dist/rdf/bindings';
import { PipelineStage } from 'sparql-engine/dist/engine/pipeline/pipeline-engine';
import { Algebra } from 'sparqljs';
/**
 * Join the set of bindings produced by a pipeline stage
 * with a BGP using the Bound Join algorithm
 * @author Thomas Minier
 * @param  source - Source of bindings
 * @param  bgp - Basic Pattern to join with
 * @param  graph - Graphe queried
 * @param  Context - Query execution context
 * @return A pipeline stage which evaluates the bound join
 */
export default function boundJoin(source: PipelineStage<Bindings>, bgp: Algebra.TripleObject[], graph: Graph, context: ExecutionContext): PipelineStage<Bindings>;
