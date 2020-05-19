import { Algebra } from 'sparqljs';
declare function isBindNode(node: Algebra.PlanNode): node is Algebra.BindNode;
declare function isBGPNode(node: Algebra.PlanNode): node is Algebra.BGPNode;
declare function isFilterNode(node: Algebra.PlanNode): node is Algebra.FilterNode;
declare function isGroupNode(node: Algebra.PlanNode): node is Algebra.GroupNode;
declare function isAggregation(variable: Algebra.Aggregation | string): variable is Algebra.Aggregation;
declare const _default: {
    isBindNode: typeof isBindNode;
    isBGPNode: typeof isBGPNode;
    isFilterNode: typeof isFilterNode;
    isAggregation: typeof isAggregation;
    isGroupNode: typeof isGroupNode;
};
export default _default;
