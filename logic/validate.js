/**
 * Pure Input and Schema Validation Module
 * Reference: Problem Statement §3.1
 * 
 * Validates input limits, types, coordinates, edge integrity,
 * initial_state references, and semantic consistency without DOM dependencies.
 */

import { t } from "./i18n.js";

function fail(key, params = {}) {
  return {
    isValid: false,
    error: t(key, params),
    errorKey: key,
    errorParams: params
  };
}

export function validateBuildingData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return fail("validationErrors.invalidJSON");
  }

  // 1. Root fields check
  const requiredRoots = ["building", "nodes", "edges", "initial_state"];
  for (const root of requiredRoots) {
    if (!(root in data)) {
      return fail("validationErrors.missingRoot");
    }
  }

  // 2. Building name
  if (typeof data.building !== "string" || data.building.trim().length === 0) {
    return fail("validationErrors.invalidBuilding");
  }

  // 3. Nodes and Edges arrays & Limits (2-60 nodes, 1-150 edges)
  if (!Array.isArray(data.nodes) || data.nodes.length < 2 || data.nodes.length > 60) {
    return fail("validationErrors.nodeLimit");
  }

  if (!Array.isArray(data.edges) || data.edges.length < 1 || data.edges.length > 150) {
    return fail("validationErrors.edgeLimit");
  }

  // 4. Validate Nodes
  const nodeMap = new Map();
  let hasRoomOrJunction = false;
  let hasExit = false;

  for (let i = 0; i < data.nodes.length; i++) {
    const node = data.nodes[i];
    if (
      !node ||
      typeof node !== "object" ||
      typeof node.id !== "string" ||
      node.id.trim().length === 0 ||
      typeof node.label !== "string" ||
      node.label.trim().length === 0 ||
      typeof node.x !== "number" ||
      !Number.isFinite(node.x) ||
      typeof node.y !== "number" ||
      !Number.isFinite(node.y) ||
      !["room", "junction", "exit"].includes(node.type)
    ) {
      return fail("validationErrors.invalidNode", { id: node?.id || `#${i}` });
    }

    if (nodeMap.has(node.id)) {
      return fail("validationErrors.duplicateNodeId", { id: node.id });
    }

    nodeMap.set(node.id, node);

    if (node.type === "room" || node.type === "junction") {
      hasRoomOrJunction = true;
    }
    if (node.type === "exit") {
      hasExit = true;
    }
  }

  if (!hasRoomOrJunction || !hasExit) {
    return fail("validationErrors.missingStartOrExit");
  }

  // 5. Validate Edges
  const edgeMap = new Map();
  const pairSet = new Set();

  for (let i = 0; i < data.edges.length; i++) {
    const edge = data.edges[i];
    if (
      !edge ||
      typeof edge !== "object" ||
      typeof edge.id !== "string" ||
      edge.id.trim().length === 0 ||
      typeof edge.from !== "string" ||
      typeof edge.to !== "string"
    ) {
      return fail("validationErrors.invalidEdgeNodes", { id: edge?.id || `#${i}`, from: edge?.from, to: edge?.to });
    }

    if (edgeMap.has(edge.id)) {
      return fail("validationErrors.duplicateEdgeId", { id: edge.id });
    }
    edgeMap.set(edge.id, edge);

    if (!nodeMap.has(edge.from) || !nodeMap.has(edge.to)) {
      return fail("validationErrors.invalidEdgeNodes", { id: edge.id, from: edge.from, to: edge.to });
    }

    // No self loops
    if (edge.from === edge.to) {
      return fail("validationErrors.selfLoop", { id: edge.id, from: edge.from });
    }

    // Cost must be a positive integer (> 0)
    if (typeof edge.cost !== "number" || !Number.isInteger(edge.cost) || edge.cost <= 0) {
      return fail("validationErrors.invalidEdgeCost", { id: edge.id, cost: edge.cost });
    }

    // No repeated node pairs (undirected)
    const pairKey = edge.from < edge.to ? `${edge.from}---${edge.to}` : `${edge.to}---${edge.from}`;
    if (pairSet.has(pairKey)) {
      return fail("validationErrors.repeatedPair", { u: edge.from, v: edge.to });
    }
    pairSet.add(pairKey);
  }

  // 6. Validate initial_state
  const initState = data.initial_state;
  if (
    !initState ||
    typeof initState !== "object" ||
    !Array.isArray(initState.blocked_nodes) ||
    !Array.isArray(initState.blocked_edges) ||
    !Array.isArray(initState.closed_exits)
  ) {
    return fail("validationErrors.invalidInitialState");
  }

  // Category consistency: blocked nodes must exist and be room or junction
  for (const nodeId of initState.blocked_nodes) {
    if (!nodeMap.has(nodeId)) {
      return fail("validationErrors.initialStateUnknownId", { id: nodeId, category: "blocked_nodes" });
    }
    const node = nodeMap.get(nodeId);
    if (node.type === "exit") {
      return fail("validationErrors.initialStateCategoryMismatch", {
        id: nodeId,
        category: "blocked_nodes",
        expectedType: "room/junction",
        actualType: node.type
      });
    }
  }

  // Category consistency: closed exits must exist and be exit
  for (const exitId of initState.closed_exits) {
    if (!nodeMap.has(exitId)) {
      return fail("validationErrors.initialStateUnknownId", { id: exitId, category: "closed_exits" });
    }
    const node = nodeMap.get(exitId);
    if (node.type !== "exit") {
      return fail("validationErrors.initialStateCategoryMismatch", {
        id: exitId,
        category: "closed_exits",
        expectedType: "exit",
        actualType: node.type
      });
    }
  }

  // Blocked edges must exist
  for (const edgeId of initState.blocked_edges) {
    if (!edgeMap.has(edgeId)) {
      return fail("validationErrors.initialStateUnknownId", { id: edgeId, category: "blocked_edges" });
    }
  }

  return {
    isValid: true,
    data: {
      building: data.building.trim(),
      nodes: data.nodes.map(n => ({ ...n })),
      edges: data.edges.map(e => ({ ...e })),
      initial_state: {
        blocked_nodes: [...initState.blocked_nodes],
        blocked_edges: [...initState.blocked_edges],
        closed_exits: [...initState.closed_exits]
      }
    }
  };
}
