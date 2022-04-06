/* file : sage-operator.ts
MIT License

Copyright (c) 2018-2020 Thomas Minier

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict'

import { BindingBase, Pipeline, Bindings, StreamPipelineInput, PipelineStage } from 'sparql-engine'
import { SageRequestClient, SageResponseBody } from '../sage-async-queue-http-client'
import { formatBGPQuery, formatManyBGPQuery, formatQuery } from './utils'
import { Algebra, Generator } from 'sparqljs'

/**
 * Async. function used to evaluate a SPARQL query at a sage server,
 * fetch all query results and insert them in steam fashion
 * into a pipeline of iterators.
 * @author Thomas Minier
 * @param  query        - SPARQL query to evaluate
 * @param  sageClient   - Client used to query the SaGe server
 * @param  streamInput  - Input of the pipeline of iterators (where results are injected)
 * @return A Promise that resolves when all query results have been fetched & processed
 */
export async function querySage (query: string, defaultGraph: string, sageClient: SageRequestClient, streamInput: StreamPipelineInput<Bindings>) {
  let hasNext = true
  let next: string | null = null
  while (hasNext) {
    try {
      const body: SageResponseBody = await sageClient.query(query, defaultGraph, next)
      body.bindings
        .forEach(b => streamInput.next(BindingBase.fromObject(b)))
      hasNext = body.hasNext
      if (hasNext) {
        next = body.next
      }
    } catch (e) {
      hasNext = false
      streamInput.error(e)
    }
  }
}

/**
 * An operator used to evaluate a SPARQL BGP query
 * @author Thomas Minier
 * @param bgp  - BGP to evaluate
 * @param sageClient - HTTP client used to query a Sage server
 * @return A stage of the pipeline which produces the query results
 */
export function SageBGPOperator (bgp: Algebra.TripleObject[], defaultGraph: string, sageClient: SageRequestClient): PipelineStage<Bindings> {
  const generator = new Generator()
  const query = formatBGPQuery(generator, bgp)
  return Pipeline.getInstance().fromAsync((input: StreamPipelineInput<Bindings>) => {
    querySage(query, defaultGraph, sageClient, input)
      .then(() => input.complete())
      .catch(err => input.error(err))
  })
}

/**
 * An operator used to evaluate a SPARQL query with a set of BGPs
 * @author Thomas Minier
 * @param bgps  - Set of BGPs to evaluate, i.e., a set of set of triple patterns
 * @param sageClient - HTTP client used to query a Sage server
 * @return A stage of the pipeline which produces the query results
 */
export function SageManyBGPOperator (bgps: Array<Algebra.TripleObject[]>, defaultGraph: string, sageClient: SageRequestClient): PipelineStage<Bindings> {
  const generator = new Generator()
  const query = formatManyBGPQuery(generator, bgps)
  return Pipeline.getInstance().fromAsync((input: StreamPipelineInput<Bindings>) => {
    querySage(query, defaultGraph, sageClient, input)
      .then(() => input.complete())
      .catch(err => input.error(err))
  })
}

/**
 * An operator used to evaluate a SPARQL query.
 * Wearning: Only BGP, Filter and Bind nodes are supported by a SaGe server.
 * @author Julien AIMONIER-DAVAT
 * @param root - Root node of a SPARQL query plan
 * @param sageClient - HTTP client used to query a Sage server
 * @return A stage of the pipeline which produces the query results
 */
export function SageQueryOperator (root: Algebra.RootNode, defaultGraph: string, sageClient: SageRequestClient): PipelineStage<Bindings> {
  const generator = new Generator()
  const query = formatQuery(generator, root)
  return Pipeline.getInstance().fromAsync((input: StreamPipelineInput<Bindings>) => {
    querySage(query, defaultGraph, sageClient, input)
      .then(() => input.complete())
      .catch(err => input.error(err))
  })
}
