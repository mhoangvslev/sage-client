"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isBindNode(node) {
    return node.type === 'bind';
}
function isBGPNode(node) {
    return node.type === 'bgp';
}
function isFilterNode(node) {
    return node.type === 'filter';
}
function isGroupNode(node) {
    return node.type === 'group';
}
function isAggregation(variable) {
    return typeof variable !== 'string';
}
exports.default = { isBindNode: isBindNode, isBGPNode: isBGPNode, isFilterNode: isFilterNode, isAggregation: isAggregation, isGroupNode: isGroupNode };
