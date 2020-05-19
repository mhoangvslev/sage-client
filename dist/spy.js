/* file : spy.ts
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
/**
 * A Spy inspect SPARQL query execution to provide metadata after query evaluation
 * @author Thomas Minier
 */
var Spy = /** @class */ (function () {
    function Spy() {
        this._nbHttpCalls = 0;
        this._transferSize = 0;
        this._nbResults = 0;
        this._responseTimes = [];
        this._overheads = [];
        this._importTimes = [];
        this._exportTimes = [];
        this._httpErrors = [];
    }
    Object.defineProperty(Spy.prototype, "nbHTTPCalls", {
        get: function () {
            return this._nbHttpCalls;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Spy.prototype, "transferSize", {
        get: function () {
            return this._transferSize;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Spy.prototype, "nbResults", {
        get: function () {
            return this._nbResults;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Spy.prototype, "httpErrors", {
        get: function () {
            return this._httpErrors;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Spy.prototype, "avgOverhead", {
        get: function () {
            return this._overheads.reduce(function (x, y) { return x + y; }, 0) / this._overheads.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Spy.prototype, "avgImportTime", {
        get: function () {
            return this._importTimes.reduce(function (x, y) { return x + y; }, 0) / this._importTimes.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Spy.prototype, "avgExportTime", {
        get: function () {
            return this._exportTimes.reduce(function (x, y) { return x + y; }, 0) / this._exportTimes.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Spy.prototype, "avgResponseTime", {
        get: function () {
            return this._responseTimes.reduce(function (x, y) { return x + y; }, 0) / this._responseTimes.length;
        },
        enumerable: false,
        configurable: true
    });
    Spy.prototype.reportHTTPRequest = function (count) {
        if (count === void 0) { count = 1; }
        this._nbHttpCalls += count;
    };
    Spy.prototype.reportHTTPTransferSize = function (bytes) {
        this._transferSize += bytes;
    };
    Spy.prototype.reportHTTPError = function (err) {
        this._httpErrors.push(err);
    };
    Spy.prototype.reportSolution = function (count) {
        if (count === void 0) { count = 1; }
        this._nbResults += count;
    };
    Spy.prototype.reportHTTPResponseTime = function (time) {
        this._responseTimes.push(time);
    };
    Spy.prototype.reportOverhead = function (overhead) {
        this._overheads.push(overhead);
    };
    Spy.prototype.reportImportTime = function (importTime) {
        this._importTimes.push(importTime);
    };
    Spy.prototype.reportExportTime = function (exportTime) {
        this._exportTimes.push(exportTime);
    };
    return Spy;
}());
exports.default = Spy;
