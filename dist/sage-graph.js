/* file : sage-graph.ts
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var sparql_engine_1 = require("sparql-engine");
var sage_http_client_1 = require("./sage-http-client");
var sage_operators_1 = require("./operators/sage-operators");
/**
 * A SageGraph implements the Graph abstract class,
 * so it can be used to execute SPARQL queries
 * at a SaGe server using the sparl-engine framework.
 * @author Thomas Minier
 */
var SageGraph = /** @class */ (function (_super) {
    __extends(SageGraph, _super);
    function SageGraph(url, defaultGraph, spy) {
        var _this = _super.call(this) || this;
        _this._url = url;
        _this._defaultGraph = defaultGraph;
        _this._spy = spy;
        _this._httpClient = new sage_http_client_1.SageRequestClient(_this._url, _this._spy);
        return _this;
    }
    SageGraph.prototype.find = function (triple, context) {
        var input = this.evalBGP([triple], context);
        return sparql_engine_1.Pipeline.getInstance().map(input, function (bindings) {
            return bindings.bound(triple);
        });
    };
    SageGraph.prototype.evalBGP = function (bgp, context) {
        return sage_operators_1.SageBGPOperator(bgp, this._defaultGraph, this._httpClient);
    };
    SageGraph.prototype.evalUnion = function (patterns, options) {
        return sage_operators_1.SageManyBGPOperator(patterns, this._defaultGraph, this._httpClient);
    };
    SageGraph.prototype.evalQuery = function (variables, prefixes, nodes, context) {
        return sage_operators_1.SageManyBGPWithFiltersAndBindsOperator(variables, prefixes, nodes, this._defaultGraph, this._httpClient);
    };
    SageGraph.prototype.open = function () {
        this._httpClient.open();
    };
    SageGraph.prototype.close = function () {
        this._httpClient.close();
    };
    SageGraph.prototype.insert = function () {
        return Promise.reject(new Error('A Sage Graph is read-only: remote updates are not allowed'));
    };
    SageGraph.prototype.delete = function () {
        return Promise.reject(new Error('A Sage Graph is read-only: remote updates are not allowed'));
    };
    SageGraph.prototype.clear = function () {
        return Promise.reject(new Error('A Sage Graph is read-only: remote updates are not allowed'));
    };
    return SageGraph;
}(sparql_engine_1.Graph));
exports.default = SageGraph;
