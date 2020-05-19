/* file : client.ts
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

import { Pipeline, PipelineStage, ExecutionContext, QueryOutput, Consumable } from 'sparql-engine'
import SageGraph from './sage-graph'
import Spy from './spy'
import { Parser, Algebra } from 'sparqljs'
import utils from './utils'

/**
 * A DirectSageClient is used to evaluate SPARQL queries againt a SaGe server
 * without using the smart client
 * 
 * WEARNING: Only mapping-at-a-time operators are allowed (AND, FILTER, BIND, UNION, SELECT)
 * 
 * @author Julien AIMONIER-DAVAT
 * @example
 * 'use strict'
 * const DirectSageClient = require('sage-client')
 *
 * // Create a client to query the DBpedia dataset hosted at http://localhost:8000
 * const url = 'http://localhost:8000/sparql/dbpedia2016'
 * const client = new DirectSageClient(url)
 *
 * const query = `
 *  PREFIX dbp: <http://dbpedia.org/property/> .
 *  PREFIX dbo: <http://dbpedia.org/ontology/> .
 *  SELECT * WHERE {
 *    ?s dbp:birthPlace ?place .
 *    ?s a dbo:Architect .
 *  }`
 * const iterator = client.execute(query)
 *
 * iterator.subscribe(console.log, console.error, () => {
 *  console.log('Query execution finished')
 * })
 */
export default class DirectSageClient {
  private readonly _url: string
  private readonly _defaultGraph: string
  private readonly _graph: SageGraph
  private readonly _spy: Spy | undefined

  /**
   * Constructor
   * @param {string} url - The url of the dataset to query
   */
  constructor (url: string, defaultGraph: string, spy?: Spy) {
    this._url = url
    this._defaultGraph = defaultGraph
    this._spy = spy
    this._graph = new SageGraph(this._url, this._defaultGraph, this._spy)
  }

  extractVariable(queryPlan: Algebra.RootNode): Array<string> {
    let variables = new Array<string>()
    if (!queryPlan.variables) {
      variables.push('*')
      return variables
    }
    for (let variable of queryPlan.variables) {
      if (utils.isAggregation(variable)) {
        throw new Error(`Aggregation are not supported`)
      }
      variables.push(variable)
    }
    return variables
  }

  extractNodes(queryPlan: Algebra.RootNode): Array<Algebra.BindNode|Algebra.BGPNode|Algebra.FilterNode|Algebra.GroupNode> {
    let nodes = new Array<Algebra.BindNode|Algebra.BGPNode|Algebra.FilterNode|Algebra.GroupNode>()
    for (let node of queryPlan.where) {
      if (!(utils.isBGPNode(node) || utils.isBindNode(node) || utils.isFilterNode(node) || utils.isGroupNode(node))) {
        throw new Error(`This operator is not supported: ${node.type}`)
      }
      nodes.push(node)
    }
    return nodes
  }

  /**
   * Build an iterator used to evaluate a SPARQL query against a SaGe server
   * @param  query - SPARQL query to evaluate
   * @return An iterator used to evaluates the query
   */
  execute (query: string): PipelineStage<QueryOutput> | Consumable {
    this._graph.open()
    let queryPlan: Algebra.RootNode = new Parser().parse(query)
    let variables: Array<string> = this.extractVariable(queryPlan)
    let prefixes: any = queryPlan.prefixes
    let nodes: Array<Algebra.BindNode|Algebra.BGPNode|Algebra.FilterNode|Algebra.GroupNode> = this.extractNodes(queryPlan)
    const pipeline: any = this._graph.evalQuery(variables, prefixes, nodes, new ExecutionContext())
    return Pipeline.getInstance().finalize(pipeline, () => this._graph.close())
  }
}
