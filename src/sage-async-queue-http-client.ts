/* file : sage-http-client.ts
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

const axiosRetry = require('axios-retry')

import Spy from './spy'
import axios from 'axios'
import { AxiosInstance } from 'axios'
import * as async from 'async'

/**
 * An HTTP request sent to the SaGe server,
 * according to the SaGe extended SPARQL query protocol.
 * @author Thomas Minier
 */
export interface SageQueryBody {
  query: string,
  defaultGraph: string,
  next: string | null
}

/**
 * An HTTP response recevied from the SaGe server,
 * according to the SaGe extended SPARQL query protocol.
 * @author Thomas Minier
 */
export interface SageResponseBody {
  bindings: string[],
  next: string | null,
  hasNext: boolean,
  stats?: any
}

/**
 * An HTTP client used to query a SaGe server using the SPARQL query protocol
 * @author Julien AIMONIER-DAVAT
 */
export class SageRequestClient {
  private readonly _url: string
  private readonly _httpClient: AxiosInstance
  private readonly _spy: Spy | undefined
  private _isClosed: boolean
  private _queue: async.QueueObject<SageQueryBody>

  /**
   * Constructor
   * @param {string} url - URL of the Sage server to use
   * @param {Spy} [spy=null] - SPy used to gather metadata about query execution
   */
  constructor (url: string, spy?: Spy) {
    this._url = url
    this._spy = spy
    this._httpClient = axios.create({
      url: url,
      method: 'post',
      headers: {'ContentType': 'application/json'}
    })
    // Setup the retry policy
    let self = this
    axiosRetry(this._httpClient, { retries: 1000, retryDelay: function(count: number, error: any) {
      console.log(`Network error: retry n°${count}`)
      return axiosRetry.exponentialDelay(count % 10)
    }})
    // Setup the waiting list
    this._queue = async.queue(async function(task: SageQueryBody, callback: async.AsyncResultCallback<SageResponseBody, Error>) {
      try {
        let response: SageResponseBody = await self.execute(task)
        callback(null, response)
      } catch (error) {
        callback(new Error(error))
      }
    }, 4)
    this._isClosed = false
  }

  /**
   * Open the HTTP client, allowing the execution of HTTP requests
   */
  public open (): void {
    this._isClosed = false
  }

  /**
   * Close the HTTP client, preventing the execution of more HTTP requests
   */
  public close (): void {
    this._isClosed = true
  }

  /**
   * Send a SPARQL query to the SaGe server using an HTTP request
   * @param queryBody - The body of an HTTP query to evaluate a SPARQL query
   * @return The HTTP response as sent by the SaGe server
   */
  private execute(queryBody: SageQueryBody): Promise<SageResponseBody> {   
    return new Promise((resolve, reject) => {
      if (this._isClosed) {
        if (this._spy) {
          this._spy.reportQueryState('timeout')
        }
        resolve({bindings: [], hasNext: false, next: null})
      }
      this._httpClient.post(this._url, queryBody).then((result) => {
        let body = result.data as SageResponseBody
        if (this._spy) {
          this._spy.reportHTTPRequest()
          this._spy.reportSolution(body.bindings.length)
          this._spy.reportHTTPTransferSize(Buffer.byteLength(JSON.stringify(body), 'utf8'))
          this._spy.reportImportTime(body.stats.import)
          this._spy.reportExportTime(body.stats.export)
          this._spy.reportOverhead(body.stats.import + body.stats.export)
        }
        resolve(body)
      }).catch((error) => {
        if (this._spy) {
          this._spy.reportQueryState('error')
          this._spy.reportHTTPError(error)
        }
        reject(error)
      })
    })
  }

  /**
   * Add an HTTP request to evaluate a SPARQL query in the waiting list
   * @param  query        - SPARQL query to execute
   * @param  defaultGraph - Default Graph IRI
   * @param  next         - (optional) Next link
   * @return The HTTP response as sent by the SaGe server
   */
  public query (query: string, defaultGraph: string, next: string | null = null): Promise<SageResponseBody> {
    const queryBody: SageQueryBody = {
      query,
      defaultGraph,
      next
    }
    return new Promise((resolve, reject) => {
      if (this._isClosed) {
        if (this._spy) {
          this._spy.reportQueryState('timeout')
        }
        resolve({bindings: [], hasNext: false, next: null})
      } else {
        this._queue.push(queryBody, function(error?: Error | null, result?: SageResponseBody) {
          if (result) {
            resolve(result)
          } else {
            reject(error)
          }
        })
      }
    })
  }
}
