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

import * as request from 'request'
import Spy from './spy'

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
 * @author Thomas Minier
 */
export class SageRequestClient {
  private readonly _url: string
  private readonly _httpClient: request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl>
  private readonly _spy: Spy | undefined
  private readonly _retryDelay: number
  private readonly _maxAttemps: number
  private _isClosed: boolean

  /**
   * Constructor
   * @param {string} url - URL of the Sage server to use
   * @param {Spy} [spy=null] - SPy used to gather metadata about query execution
   */
  constructor (url: string, spy?: Spy) {
    this._url = url
    this._spy = spy
    // TODO check if this really enable http multi-sockets and speed up query exec.
    // request.forever({ timeout: 5000, minSockets: 10 }, null)
    this._httpClient = request.defaults({
      method: 'POST',
      json: true,
      gzip: true,
      time: true
    })
    this._retryDelay = 1000
    this._maxAttemps = 1000
    this._isClosed = false
  }

  /**
   * Open the HTTP client, allowing the execution of HTTP requests
   */
  open (): void {
    this._isClosed = false
  }

  /**
   * Close the HTTP client, preventing the execution of more HTTP requests
   */
  close (): void {
    this._isClosed = true
  }

  /**
   * Send a SPARQL query to the SaGe server using an HTTP request
   * @param  query        - SPARQL query to execute
   * @param  defaultGraph - Default Graph IRI
   * @param  next         - (optional) Next link
   * @return The HTTP response as sent by the SaGe server
   */
  query (query: string, defaultGraph: string, next: string | null = null): Promise<SageResponseBody> {
    const self = this
    const queryBody: SageQueryBody = {
      query,
      defaultGraph,
      next
    }
    
    function attempt(): Promise<SageResponseBody> {
      return new Promise((resolve, reject) => {
        let requestBody: (request.UrlOptions & request.CoreOptions) = {
          url: self._url,
          body: queryBody
        }
        self._httpClient.post(requestBody, (err, res, body) => {
          if (err || res.statusCode !== 200) {
            if (err) {
              reject(err)
            } else {
              reject(new Error(JSON.stringify(res.body)))
            }
          } else if (self._isClosed) {
            if (self._spy) {
              self._spy.reportQueryState('timeout')
            }
            resolve({ bindings: [], hasNext: false, next: null })
          } else {
            if (self._spy) {
              self._spy.reportHTTPRequest()
              self._spy.reportSolution(body.bindings.length)
              self._spy.reportHTTPTransferSize(Buffer.byteLength(JSON.stringify(body), 'utf8'))
              self._spy.reportImportTime(body.stats.import)
              self._spy.reportExportTime(body.stats.export)
              self._spy.reportOverhead(body.stats.import + body.stats.export)
              if (res && res.timingPhases) {
                self._spy.reportHTTPResponseTime(res.timingPhases.firstByte)
              }
            }
            resolve(body)
          }
        })
      })
    }

    return new Promise((resolve, reject) => {
      let counter = 1
      const sendQueryWithRetryPolicy = function() {
        if (self._isClosed) {
          if (self._spy) {
            self._spy.reportQueryState('timeout')
          }
          resolve({ bindings: [], hasNext: false, next: null })
        } else if (counter > self._maxAttemps) {
          if (self._spy) {
            self._spy.reportQueryState('error')
          }
          reject('Error: maximum number of attemps reached')
        } else {
          attempt().then((result) => {
            resolve(result)
          }).catch((error) => {
            if (error.code === 'ECONNREFUSED' || !error.code) {
              if (self._spy) {
                self._spy.reportQueryState('error')
              }
              reject(error)
            } else {
              counter++
              setTimeout(sendQueryWithRetryPolicy, self._retryDelay)
            }
          })
        }
      }
      sendQueryWithRetryPolicy()      
    })
  }
}
