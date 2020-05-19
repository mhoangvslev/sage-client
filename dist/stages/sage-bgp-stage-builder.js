/* file : sage-bgp-executor.ts
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
var bound_join_1 = require("../operators/bound-join");
/**
 * Evaluate Basic Graph patterns using a Sage server.
 * Contrary to the regular BGPStageBuilder,
 * this subclass rely on the Bound Join algorithm to execute joins between BGPs.
 * As the Sage server as a native support for UNION evaluation, it speeds up
 * drastically the query execution by reducing the communication overhead.
 * @extends BGPExecutor
 * @author Thomas Minier
 * @author Corentin Marionneau
 */
var SageBGPStageBuilder = /** @class */ (function (_super) {
    __extends(SageBGPStageBuilder, _super);
    function SageBGPStageBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SageBGPStageBuilder.prototype._buildIterator = function (source, graph, patterns, context) {
        return bound_join_1.default(source, patterns, graph, context);
    };
    return SageBGPStageBuilder;
}(sparql_engine_1.stages.BGPStageBuilder));
exports.default = SageBGPStageBuilder;
