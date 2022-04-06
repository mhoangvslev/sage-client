import { Algebra } from 'sparqljs'

function isBindNode (node: Algebra.PlanNode): node is Algebra.BindNode {
  return node.type === 'bind'
}

function isBGPNode (node: Algebra.PlanNode): node is Algebra.BGPNode {
  return node.type === 'bgp'
}

function isFilterNode (node: Algebra.PlanNode): node is Algebra.FilterNode {
  return node.type === 'filter'
}

function isGroupNode (node: Algebra.PlanNode): node is Algebra.GroupNode {
  return node.type === 'group'
}

function isAggregation (variable: Algebra.Aggregation | string): variable is Algebra.Aggregation {
  return typeof variable !== 'string'
}

export default { isBindNode, isBGPNode, isFilterNode, isAggregation, isGroupNode }
