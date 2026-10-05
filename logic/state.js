/**
 * Application State Manager for Smart Escape
 * References: Problem Statement §3.2, §3.4
 * 
 * Maintains immutable original imported data, mutable hazard states,
 * and notifies listeners on any change.
 */

import { validateBuildingData } from "./validate.js";
import { calculateEvacuationRoute } from "./route.js";
import { getLanguage, setLanguage } from "./i18n.js";

export class SimulationState {
  constructor() {
    this.originalData = null; // Immutable copy of imported building data
    this.graph = null;        // Active graph representation { nodes, edges }
    this.startNodeId = null;  // Currently selected starting node

    // Active hazard sets
    this.blockedNodes = new Set();
    this.blockedEdges = new Set();
    this.closedExits = new Set();

    // Latest computation outcome
    this.routeResult = null;
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this);
      } catch (err) {
        console.error("State listener error:", err);
      }
    }
  }

  loadBuilding(rawData) {
    const valResult = validateBuildingData(rawData);
    if (!valResult.isValid) {
      return { success: false, error: valResult.error };
    }

    const data = valResult.data;
    // Keep original data immutable (deep clone)
    this.originalData = JSON.parse(JSON.stringify(data));
    this.graph = {
      building: data.building,
      nodes: data.nodes.map(n => ({ ...n })),
      edges: data.edges.map(e => ({ ...e }))
    };

    // Restore initial state from data
    this.resetHazards(false);

    // Pick first unblocked room or junction as default start if available
    const availableStart = this.graph.nodes.find(
      n => (n.type === "room" || n.type === "junction") && !this.blockedNodes.has(n.id)
    );
    this.startNodeId = availableStart ? availableStart.id : null;

    this.recalculate();
    return { success: true, building: data.building };
  }

  resetHazards(shouldNotify = true) {
    if (!this.originalData) return;

    this.blockedNodes = new Set(this.originalData.initial_state.blocked_nodes);
    this.blockedEdges = new Set(this.originalData.initial_state.blocked_edges);
    this.closedExits = new Set(this.originalData.initial_state.closed_exits);

    if (shouldNotify) {
      this.recalculate();
    }
  }

  setStartNode(nodeId) {
    if (!this.graph) return;
    const node = this.graph.nodes.find(n => n.id === nodeId);
    if (node && (node.type === "room" || node.type === "junction")) {
      this.startNodeId = nodeId;
      this.recalculate();
    }
  }

  toggleNodeBlock(nodeId) {
    if (!this.graph) return;
    const node = this.graph.nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (node.type === "exit") {
      // Exits are closed/reopened
      this.toggleExitClose(nodeId);
      return;
    }

    if (this.blockedNodes.has(nodeId)) {
      this.blockedNodes.delete(nodeId);
    } else {
      this.blockedNodes.add(nodeId);
    }
    this.recalculate();
  }

  toggleEdgeBlock(edgeId) {
    if (!this.graph) return;
    const edge = this.graph.edges.find(e => e.id === edgeId);
    if (!edge) return;

    if (this.blockedEdges.has(edgeId)) {
      this.blockedEdges.delete(edgeId);
    } else {
      this.blockedEdges.add(edgeId);
    }
    this.recalculate();
  }

  toggleExitClose(exitId) {
    if (!this.graph) return;
    const node = this.graph.nodes.find(n => n.id === exitId && n.type === "exit");
    if (!node) return;

    if (this.closedExits.has(exitId)) {
      this.closedExits.delete(exitId);
    } else {
      this.closedExits.add(exitId);
    }
    this.recalculate();
  }

  recalculate() {
    if (!this.graph) return;

    this.routeResult = calculateEvacuationRoute(this.graph, this.startNodeId, {
      blockedNodes: this.blockedNodes,
      blockedEdges: this.blockedEdges,
      closedExits: this.closedExits
    });

    this.notify();
  }

  getSnapshot() {
    return {
      building: this.graph?.building,
      startNodeId: this.startNodeId,
      blockedNodes: Array.from(this.blockedNodes),
      blockedEdges: Array.from(this.blockedEdges),
      closedExits: Array.from(this.closedExits),
      routeResult: this.routeResult
    };
  }
}
