"use strict";
/* file : utils.ts
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatManyBGPWithFiltersAndBindsQuery = exports.formatManyBGPQuery = exports.formatBGPQuery = void 0;
/**
 * Create a SPARQL query (in string format) from a Basic Graph Pattern
 * @param  triples - Set of triple patterns
 * @return A conjunctive SPARQL query
 */
function formatBGPQuery(generator, triples) {
    var bgpNode = {
        type: 'bgp',
        triples: triples
    };
    var jsonQuery = {
        type: 'query',
        prefixes: {},
        variables: ['*'],
        queryType: 'SELECT',
        where: [bgpNode]
    };
    return generator.stringify(jsonQuery);
}
exports.formatBGPQuery = formatBGPQuery;
/**
 * Create a SPARQL query (in string format) from a set of Basic Graph Patterns
 * @param  bgps - Set of Basic Graph Patterns, i.e., a set of set of triple patterns
 * @return A SPARQL query
 */
function formatManyBGPQuery(generator, bgps) {
    var unionNode = {
        type: 'union',
        patterns: bgps.map(function (triples) {
            return { type: 'bgp', triples: triples };
        })
    };
    var jsonQuery = {
        type: 'query',
        prefixes: {},
        variables: ['*'],
        queryType: 'SELECT',
        where: [unionNode]
    };
    return generator.stringify(jsonQuery);
}
exports.formatManyBGPQuery = formatManyBGPQuery;
/**
 * Create a SPARQL query (in string format) from a set of Basic Graph Patterns, Filters and Binds
 * @param  variables - Set of variables to project
 * @param  nodes - Set of Basic Graph Patterns (i.e., a set of set of triple patterns), Filters and Binds
 * @return A SPARQL query
 */
function formatManyBGPWithFiltersAndBindsQuery(generator, variables, prefixes, nodes) {
    var jsonQuery = {
        type: 'query',
        prefixes: prefixes,
        variables: variables,
        queryType: 'SELECT',
        where: nodes
    };
    return generator.stringify(jsonQuery);
}
exports.formatManyBGPWithFiltersAndBindsQuery = formatManyBGPWithFiltersAndBindsQuery;
