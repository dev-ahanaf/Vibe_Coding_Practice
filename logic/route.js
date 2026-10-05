/**
 * Pure Routing Engine for Smart Escape
 * References: Problem Statement §3.2, §3.3, §3.4
 * 
 * Computes exact minimum cost evacuation path with deterministic tie-breaking:
 * 1. Min total cost (sum of edge costs)
 * 2. Lexicographically smallest exit ID on cost tie
 * 3. Lexicographically smallest sequence of node IDs on path tie
 */

import { t } from "./i18n.js";

/**
 * Compare two node sequences lexicographically:
 * Returns negative if pathA < pathB, positive if pathA > pathB, 0 if identical.
 */
export function compareNodeSequences(pathA, pathB) {
  const len = Math.min(pathA.length, pathB.length);
  for (let i = 0; i < len; i++) {
    if (pathA[i] < pathB[i]) return -1;
    if (pathA[i] > pathB[i]) return 1;
  }
  return pathA.length - pathB.length;
}

/**
 * Find the optimal evacuation route given the building graph and current hazard state.
 * 
 * @param {Object} graph - { nodes: Array, edges: Array }
 * @param {string} startNodeId - Selected starting room/junction ID
 * @param {Object} hazardState - { blockedNodes: Set/Array, blockedEdges: Set/Array, closedExits: Set/Array }
 * @returns {Object} Route result
 */
export function calculateEvacuationRoute(graph, startNodeId, hazardState = {}) {
  const blockedNodes = new Set(hazardState.blockedNodes || []);
  const blockedEdges = new Set(hazardState.blockedEdges || []);
  const closedExits = new Set(hazardState.closedExits || []);

  const nodeMap = new Map();
  for (const n of graph.nodes) {
    nodeMap.set(n.id, n);
  }

  // 1. Check start node validity
  if (!startNodeId || !nodeMap.has(startNodeId)) {
    return {
      status: "no_start",
      message: t("startNodeSelectPlaceholder"),
      route: [],
      cost: null,
      exit: null,
      edgesUsed: []
    };
  }

  // 2. Check if selected start is currently blocked
  if (blockedNodes.has(startNodeId)) {
    return {
      status: "blocked_start",
      message: t("startingLocationBlocked"),
      route: [],
      cost: null,
      exit: null,
      edgesUsed: []
    };
  }

  // 3. Build adjacency list excluding unusable elements:
  // - Exclude blocked nodes and their incident edges
  // - Exclude blocked edges
  // - Exclude closed exits completely (including as intermediate passages)
  const adj = new Map();
  for (const n of graph.nodes) {
    adj.set(n.id, []);
  }

  const validEdgesMap = new Map();

  for (const edge of graph.edges) {
    // If edge is blocked, skip
    if (blockedEdges.has(edge.id)) continue;

    // If either endpoint is a blocked node, skip
    if (blockedNodes.has(edge.from) || blockedNodes.has(edge.to)) continue;

    // If either endpoint is a closed exit, skip
    if (closedExits.has(edge.from) || closedExits.has(edge.to)) continue;

    adj.get(edge.from).push({ to: edge.to, cost: edge.cost, edgeId: edge.id });
    adj.get(edge.to).push({ to: edge.from, cost: edge.cost, edgeId: edge.id });
    validEdgesMap.set(`${edge.from}---${edge.to}`, edge.id);
    validEdgesMap.set(`${edge.to}---${edge.from}`, edge.id);
  }

  // 4. Dijkstra Algorithm with lexicographical path tie-breaking
  const dist = new Map();
  const bestPaths = new Map();
  const visited = new Set();

  for (const n of graph.nodes) {
    dist.set(n.id, Infinity);
    bestPaths.set(n.id, []);
  }

  dist.set(startNodeId, 0);
  bestPaths.set(startNodeId, [startNodeId]);

  // Priority queue simulated via simple array search (graph size <= 60 nodes)
  const queue = [startNodeId];

  while (queue.length > 0) {
    // Pick unvisited node with lowest distance, breaking ties lexicographically by path
    let minIdx = 0;
    let minNode = queue[0];
    let minDist = dist.get(minNode);
    let minPath = bestPaths.get(minNode);

    for (let i = 1; i < queue.length; i++) {
      const u = queue[i];
      const d = dist.get(u);
      if (d < minDist) {
        minDist = d;
        minNode = u;
        minPath = bestPaths.get(u);
        minIdx = i;
      } else if (d === minDist) {
        if (compareNodeSequences(bestPaths.get(u), minPath) < 0) {
          minDist = d;
          minNode = u;
          minPath = bestPaths.get(u);
          minIdx = i;
        }
      }
    }

    queue.splice(minIdx, 1);
    visited.add(minNode);

    // If minNode is an open exit, no need to expand from it (exits are terminal destinations)
    const minNodeObj = nodeMap.get(minNode);
    if (minNodeObj.type === "exit" && minNode !== startNodeId) {
      continue;
    }

    const neighbors = adj.get(minNode) || [];
    for (const { to: neighbor, cost } of neighbors) {
      if (visited.has(neighbor)) continue;

      const altCost = minDist + cost;
      const currentDist = dist.get(neighbor);
      const candPath = [...minPath, neighbor];

      if (altCost < currentDist) {
        dist.set(neighbor, altCost);
        bestPaths.set(neighbor, candPath);
        if (!queue.includes(neighbor)) {
          queue.push(neighbor);
        }
      } else if (altCost === currentDist) {
        if (compareNodeSequences(candPath, bestPaths.get(neighbor)) < 0) {
          bestPaths.set(neighbor, candPath);
          if (!queue.includes(neighbor)) {
            queue.push(neighbor);
          }
        }
      }
    }
  }

  // 5. Evaluate all reachable open exits and pick winner according to exact tie-breaking:
  // Rule 1: Minimum total cost
  // Rule 2: Lexicographically smallest exit ID
  // Rule 3: Lexicographically smallest node ID sequence (handled by bestPaths)
  const candidateExits = [];
  for (const n of graph.nodes) {
    if (n.type === "exit" && !closedExits.has(n.id)) {
      const d = dist.get(n.id);
      if (d !== Infinity && Number.isFinite(d)) {
        candidateExits.push({
          exitId: n.id,
          cost: d,
          path: bestPaths.get(n.id)
        });
      }
    }
  }

  if (candidateExits.length === 0) {
    return {
      status: "no_route",
      message: t("noRouteAvailable"),
      route: [],
      cost: null,
      exit: null,
      edgesUsed: []
    };
  }

  // Sort candidate exits deterministically
  candidateExits.sort((a, b) => {
    // 1. Cost
    if (a.cost !== b.cost) {
      return a.cost - b.cost;
    }
    // 2. Exit ID lexicographically
    if (a.exitId !== b.exitId) {
      return a.exitId < b.exitId ? -1 : 1;
    }
    // 3. Node sequence lexicographically
    return compareNodeSequences(a.path, b.path);
  });

  const winner = candidateExits[0];

  // Derive edges used in the winning path
  const edgesUsed = [];
  for (let i = 0; i < winner.path.length - 1; i++) {
    const u = winner.path[i];
    const v = winner.path[i + 1];
    const edgeId = validEdgesMap.get(`${u}---${v}`);
    if (edgeId) {
      edgesUsed.push(edgeId);
    }
  }

  return {
    status: "route_found",
    message: t("routeFound"),
    route: winner.path,
    cost: winner.cost,
    exit: winner.exitId,
    edgesUsed,
    allCandidates: candidateExits
  };
}
