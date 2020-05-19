import { Graph } from 'sparql-engine';
import { Bindings } from 'sparql-engine/dist/rdf/bindings';
import ExecutionContext from 'sparql-engine/dist/engine/context/execution-context';
import { PipelineStage, PipelineInput } from 'sparql-engine/dist/engine/pipeline/pipeline-engine';
import { Algebra } from 'sparqljs';
import Spy from './spy';
/**
 * A SageGraph implements the Graph abstract class,
 * so it can be used to execute SPARQL queries
 * at a SaGe server using the sparl-engine framework.
 * @author Thomas Minier
 */
export default class SageGraph extends Graph {
    private readonly _url;
    private readonly _defaultGraph;
    private readonly _httpClient;
    private readonly _spy;
    constructor(url: string, defaultGraph: string, spy?: Spy);
    find(triple: Algebra.TripleObject, context: ExecutionContext): PipelineInput<Algebra.TripleObject>;
    evalBGP(bgp: Algebra.TripleObject[], context: ExecutionContext): PipelineStage<Bindings>;
    evalUnion(patterns: Array<Algebra.TripleObject[]>, options: ExecutionContext): PipelineStage<Bindings>;
    evalQuery(variables: Array<string>, prefixes: any, nodes: Array<Algebra.BGPNode | Algebra.BindNode | Algebra.FilterNode | Algebra.GroupNode>, context: ExecutionContext): PipelineStage<Bindings>;
    open(): void;
    close(): void;
    insert(): Promise<void>;
    delete(): Promise<void>;
    clear(): Promise<void>;
}
