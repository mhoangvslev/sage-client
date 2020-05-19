import { ExecutionContext, Graph, stages } from 'sparql-engine';
import { Bindings } from 'sparql-engine/dist/rdf/bindings';
import { PipelineStage } from 'sparql-engine/dist/engine/pipeline/pipeline-engine';
import { Algebra } from 'sparqljs';
/**
 * Evaluate Basic Graph patterns using a Sage server.
 * Contrary to the regular BGPStageBuilder,
 * this subclass rely on the Bound Join algorithm to execute joins between BGPs.
 * As the Sage server as a native support for UNION evaluation, it speeds up
 * drastically the query execution by reducing the communication overhead.
 * @extends BGPExecutor
 * @author Thomas Minier
 * @author Corentin Marionneau
 */
export default class SageBGPStageBuilder extends stages.BGPStageBuilder {
    _buildIterator(source: PipelineStage<Bindings>, graph: Graph, patterns: Algebra.TripleObject[], context: ExecutionContext): PipelineStage<Bindings>;
}
