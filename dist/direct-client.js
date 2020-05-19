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
'use strict';
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var sparql_engine_1 = require("sparql-engine");
var sage_graph_1 = require("./sage-graph");
var sparqljs_1 = require("sparqljs");
var utils_1 = require("./utils");
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
var DirectSageClient = /** @class */ (function () {
    /**
     * Constructor
     * @param {string} url - The url of the dataset to query
     */
    function DirectSageClient(url, defaultGraph, spy) {
        this._url = url;
        this._defaultGraph = defaultGraph;
        this._spy = spy;
        this._graph = new sage_graph_1.default(this._url, this._defaultGraph, this._spy);
    }
    DirectSageClient.prototype.extractVariable = function (queryPlan) {
        var e_1, _a;
        var variables = new Array();
        if (!queryPlan.variables) {
            variables.push('*');
            return variables;
        }
        try {
            for (var _b = __values(queryPlan.variables), _c = _b.next(); !_c.done; _c = _b.next()) {
                var variable = _c.value;
                if (utils_1.default.isAggregation(variable)) {
                    throw new Error("Aggregation are not supported");
                }
                variables.push(variable);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return variables;
    };
    DirectSageClient.prototype.extractNodes = function (queryPlan) {
        var e_2, _a;
        var nodes = new Array();
        try {
            for (var _b = __values(queryPlan.where), _c = _b.next(); !_c.done; _c = _b.next()) {
                var node = _c.value;
                if (!(utils_1.default.isBGPNode(node) || utils_1.default.isBindNode(node) || utils_1.default.isFilterNode(node) || utils_1.default.isGroupNode(node))) {
                    throw new Error("This operator is not supported: " + node.type);
                }
                nodes.push(node);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return nodes;
    };
    /**
     * Build an iterator used to evaluate a SPARQL query against a SaGe server
     * @param  query - SPARQL query to evaluate
     * @return An iterator used to evaluates the query
     */
    DirectSageClient.prototype.execute = function (query) {
        var _this = this;
        this._graph.open();
        var queryPlan = new sparqljs_1.Parser().parse(query);
        var variables = this.extractVariable(queryPlan);
        var prefixes = queryPlan.prefixes;
        var nodes = this.extractNodes(queryPlan);
        var pipeline = this._graph.evalQuery(variables, prefixes, nodes, new sparql_engine_1.ExecutionContext());
        return sparql_engine_1.Pipeline.getInstance().finalize(pipeline, function () { return _this._graph.close(); });
    };
    return DirectSageClient;
}());
exports.default = DirectSageClient;
