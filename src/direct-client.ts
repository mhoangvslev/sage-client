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

import { Pipeline } from 'sparql-engine'
import Spy from './spy'
import { querySage } from './operators/sage-operators'
import { SageRequestClient } from './sage-async-queue-http-client'

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
  private readonly _spy: Spy | undefined
  private readonly _httpClient: SageRequestClient

  /**
   * Constructor
   * @param {string} url - The url of the dataset to query
   */
  constructor (url: string, defaultGraph: string, spy?: Spy) {
    this._url = url
    this._defaultGraph = defaultGraph
    this._spy = spy
    this._httpClient = new SageRequestClient(this._url, this._spy)
  }

  /**
   * Build an iterator used to evaluate a SPARQL query against a SaGe server
   * Only BGP, Filter and Bind nodes are supported.
   * @param  query - SPARQL query to evaluate
   * @return An iterator used to evaluates the query
   */
  execute (query: string, timeout?: number) {
    if (timeout) {
      let httpClient = this._httpClient
      let subscription = setTimeout(function() {
        httpClient.close()
      }, timeout * 1000)
      httpClient.open()
      return Pipeline.getInstance().fromAsync(input => {
        querySage(query, this._defaultGraph, httpClient, input)
          .then(() => {
            clearTimeout(subscription)
            input.complete()
          })
          .catch(err => input.error(err))
      })
    }
    return Pipeline.getInstance().fromAsync(input => {
      querySage(query, this._defaultGraph, this._httpClient, input)
        .then(() => input.complete())
        .catch(err => input.error(err))
    })
  }
}
