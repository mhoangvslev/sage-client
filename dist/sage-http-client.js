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
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SageRequestClient = void 0;
var request = require("request");
/**
 * An HTTP client used to query a SaGe server using the SPARQL query protocol
 * @author Thomas Minier
 */
var SageRequestClient = /** @class */ (function () {
    /**
     * Constructor
     * @param {string} url - URL of the Sage server to use
     * @param {Spy} [spy=null] - SPy used to gather metadata about query execution
     */
    function SageRequestClient(url, spy) {
        this._url = url;
        this._spy = spy;
        // TODO check if this really enable http multi-sockets and speed up query exec.
        request.forever({ timeout: 1000, minSockets: 10 }, null);
        this._httpClient = request.defaults({
            method: 'POST',
            json: true,
            gzip: true,
            time: true
        });
        this._retryDelay = 1000;
        this._maxAttemps = 1000;
        this._isClosed = false;
    }
    /**
     * Open the HTTP client, allowing the execution of HTTP requests
     */
    SageRequestClient.prototype.open = function () {
        this._isClosed = false;
    };
    /**
     * Close the HTTP client, preventing the execution of more HTTP requests
     */
    SageRequestClient.prototype.close = function () {
        this._isClosed = true;
    };
    /**
     * Send a SPARQL query to the SaGe server using an HTTP request
     * @param  query        - SPARQL query to execute
     * @param  defaultGraph - Default Graph IRI
     * @param  next         - (optional) Next link
     * @return The HTTP response as sent by the SaGe server
     */
    SageRequestClient.prototype.query = function (query, defaultGraph, next) {
        if (next === void 0) { next = null; }
        if (this._isClosed) {
            return Promise.resolve({ bindings: [], hasNext: false, next: null });
        }
        var queryBody = {
            query: query,
            defaultGraph: defaultGraph,
            next: next
        };
        var self = this;
        function attempt() {
            return new Promise(function (resolve, reject) {
                var requestBody = {
                    url: self._url,
                    body: queryBody
                };
                self._httpClient.post(requestBody, function (err, res, body) {
                    if (err || res.statusCode !== 200) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            reject(new Error(JSON.stringify(res.body)));
                        }
                    }
                    else {
                        if (self._spy !== undefined) {
                            self._spy.reportHTTPRequest();
                            self._spy.reportHTTPTransferSize(Buffer.byteLength(JSON.stringify(body), 'utf8'));
                            self._spy.reportImportTime(body.stats.import);
                            self._spy.reportExportTime(body.stats.export);
                            self._spy.reportOverhead(body.stats.import + body.stats.export);
                            if (res !== undefined && res.timingPhases !== undefined) {
                                self._spy.reportHTTPResponseTime(res.timingPhases.firstByte);
                            }
                        }
                        resolve(body);
                    }
                });
            });
        }
        return new Promise(function (resolve, reject) {
            var counter = 0;
            var sendQueryWithRetryPolicy = function () {
                if (counter < self._maxAttemps) {
                    counter++;
                    attempt().then(function (res) {
                        resolve(res);
                    }).catch(function (error) {
                        if (error === 'Timeout') {
                            setTimeout(function () { console.log("Number of attemps : " + counter); sendQueryWithRetryPolicy(); }, self._retryDelay);
                        }
                        else {
                            setTimeout(function () { console.log("Number of attemps : " + counter); sendQueryWithRetryPolicy(); }, self._retryDelay);
                        }
                    });
                }
                else {
                    reject('Error: Maximum number of attemps reached !');
                }
            };
            sendQueryWithRetryPolicy();
        });
    };
    return SageRequestClient;
}());
exports.SageRequestClient = SageRequestClient;
