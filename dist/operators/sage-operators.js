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
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SageManyBGPWithFiltersAndBindsOperator = exports.SageManyBGPOperator = exports.SageBGPOperator = void 0;
var sparql_engine_1 = require("sparql-engine");
var utils_1 = require("./utils");
var sparqljs_1 = require("sparqljs");
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
function querySage(query, defaultGraph, sageClient, streamInput) {
    return __awaiter(this, void 0, void 0, function () {
        var hasNext, next, body, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hasNext = true;
                    next = null;
                    _a.label = 1;
                case 1:
                    if (!hasNext) return [3 /*break*/, 6];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, sageClient.query(query, defaultGraph, next)];
                case 3:
                    body = _a.sent();
                    body.bindings
                        .forEach(function (b) { return streamInput.next(sparql_engine_1.BindingBase.fromObject(b)); });
                    hasNext = body.hasNext;
                    if (hasNext) {
                        next = body.next;
                    }
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    hasNext = false;
                    streamInput.error(e_1);
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * An operator used to evaluate a SPARQL BGP query
 * @author Thomas Minier
 * @param bgp  - BGP to evaluate
 * @param sageClient - HTTP client used to query a Sage server
 * @return A stage of the pipeline which produces the query results
 */
function SageBGPOperator(bgp, defaultGraph, sageClient) {
    var generator = new sparqljs_1.Generator();
    var query = utils_1.formatBGPQuery(generator, bgp);
    return sparql_engine_1.Pipeline.getInstance().fromAsync(function (input) {
        querySage(query, defaultGraph, sageClient, input)
            .then(function () { return input.complete(); })
            .catch(function (err) { return input.error(err); });
    });
}
exports.SageBGPOperator = SageBGPOperator;
/**
 * An operator used to evaluate a SPARQL query with a set of BGPs
 * @author Thomas Minier
 * @param bgps  - Set of BGPs to evaluate, i.e., a set of set of triple patterns
 * @param sageClient - HTTP client used to query a Sage server
 * @return A stage of the pipeline which produces the query results
 */
function SageManyBGPOperator(bgps, defaultGraph, sageClient) {
    var generator = new sparqljs_1.Generator();
    var query = utils_1.formatManyBGPQuery(generator, bgps);
    return sparql_engine_1.Pipeline.getInstance().fromAsync(function (input) {
        querySage(query, defaultGraph, sageClient, input)
            .then(function () { return input.complete(); })
            .catch(function (err) { return input.error(err); });
    });
}
exports.SageManyBGPOperator = SageManyBGPOperator;
/**
 * An operator used to evaluate a SPARQL query with a set of BGPs, Filters and Binds
 * @author Julien AIMONIER-DAVAT
 * @param variables - Set of variables to select
 * @param prefixes - Prefixes used in the query
 * @param nodes  - Set of BGPs, Filters and Binds to evaluate
 * @param sageClient - HTTP client used to query a Sage server
 * @return A stage of the pipeline which produces the query results
 */
function SageManyBGPWithFiltersAndBindsOperator(variables, prefixes, nodes, defaultGraph, sageClient) {
    var generator = new sparqljs_1.Generator();
    var query = utils_1.formatManyBGPWithFiltersAndBindsQuery(generator, variables, prefixes, nodes);
    return sparql_engine_1.Pipeline.getInstance().fromAsync(function (input) {
        querySage(query, defaultGraph, sageClient, input)
            .then(function () { return input.complete(); })
            .catch(function (err) { return input.error(err); });
    });
}
exports.SageManyBGPWithFiltersAndBindsOperator = SageManyBGPWithFiltersAndBindsOperator;
