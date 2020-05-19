import { Graph, ExecutionContext } from 'sparql-engine';
import { Bindings } from 'sparql-engine/dist/rdf/bindings';
import { Algebra } from 'sparqljs';
/**
 * A special operator used to evaluate a UNION query with a Sage server,
 * and then rewrite bindings generated and performs union with original bindings.
 * @author Thomas Minier
 * @private
 * @param  graph - Graph queried
 * @param  bgpBucket - List of BGPs to evaluate
 * @param  rewritingTable - Map <rewriting key -> original bindings>
 * @param  context - Query execution context
 * @return A pipeline stage which evaluates the query.
 */
export default function rewritingOp(graph: Graph, bgpBucket: Algebra.TripleObject[][], rewritingTable: Map<number, Bindings>, context: ExecutionContext): import("sparql-engine").PipelineStage<Bindings>;
