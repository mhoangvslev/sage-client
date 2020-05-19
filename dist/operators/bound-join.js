/* file : bind-join.ts
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
var sparql_engine_1 = require("sparql-engine");
var utils_1 = require("sparql-engine/dist/utils");
var rewriting_op_1 = require("./rewriting-op");
// The default size of the bucket of Basic Graph Patterns
// used by the Bound Join algorithm
var BOUND_JOIN_BUFFER_SIZE = 15;
/**
 * Rewrite a triple pattern using a rewriting key, i.e., append "_key" to each SPARQL variable in the triple pattern
 * @author Thomas Minier
 * @param key - Rewriting key
 * @param tp - Triple pattern to rewrite
 * @return The rewritten triple pattern
 */
function rewriteTriple(triple, key) {
    var res = Object.assign({}, triple);
    if (utils_1.rdf.isVariable(triple.subject)) {
        res.subject = triple.subject + '_' + key;
    }
    if (utils_1.rdf.isVariable(triple.predicate)) {
        res.predicate = triple.predicate + '_' + key;
    }
    if (utils_1.rdf.isVariable(triple.object)) {
        res.object = triple.object + '_' + key;
    }
    return res;
}
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
function boundJoin(source, bgp, graph, context) {
    return sparql_engine_1.Pipeline.getInstance().fromAsync(function (input) {
        var sourceClosed = false;
        var activeIterators = 0;
        // Check if a custom sizr forn the bound join buffer has been set by the app.
        // Otherwise, use the default one
        var bufferSize = BOUND_JOIN_BUFFER_SIZE;
        if (context.hasProperty('BOUND_JOIN_BUFFER_SIZE')) {
            bufferSize = context.getProperty('BOUND_JOIN_BUFFER_SIZE');
        }
        // Utility function used to close the processing
        // after all active iteratord have completed
        function tryClose() {
            activeIterators--;
            if (sourceClosed && activeIterators === 0) {
                input.complete();
            }
        }
        // Buffer the output of the pipeline to generates bucket,
        // then apply the bound join algorithm to perform the join
        // between the bucket of bindings and the input BGP
        sparql_engine_1.Pipeline.getInstance()
            .bufferCount(source, bufferSize)
            .subscribe(function (bucket) {
            activeIterators++;
            // simple case: first join in the pipeline
            if (bucket.length === 1 && bucket[0].isEmpty) {
                graph.evalBGP(bgp, context).subscribe(function (b) {
                    input.next(b);
                }, function (err) { return input.error(err); }, function () { return tryClose(); });
            }
            else {
                // The bucket of rewritten basic graph patterns
                var bgpBucket_1 = [];
                // A rewriting table dedicated to this instance of the bound join
                var rewritingTable_1 = new Map();
                // The rewriting key (a simple counter) for this instance of the bound join
                var key_1 = 0;
                // Build the bucket of Basic Graph patterns
                bucket.map(function (binding) {
                    var boundedBGP = [];
                    bgp.forEach(function (triple) {
                        var boundedTriple = binding.bound(triple);
                        // rewrite the triple pattern and save the rewriting into the table
                        boundedTriple = rewriteTriple(boundedTriple, key_1);
                        rewritingTable_1.set(key_1, binding);
                        boundedBGP.push(boundedTriple);
                    });
                    bgpBucket_1.push(boundedBGP);
                    key_1++;
                });
                // Evaluates the bucket using the Sage server
                rewriting_op_1.default(graph, bgpBucket_1, rewritingTable_1, context)
                    .subscribe(function (b) { return input.next(b); }, function (err) { return input.error(err); }, function () { return tryClose(); });
            }
        }, function (err) { return input.error(err); }, function () { sourceClosed = true; });
    });
}
exports.default = boundJoin;
