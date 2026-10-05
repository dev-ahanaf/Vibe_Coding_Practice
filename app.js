/**
 * Smart Escape - Core Application Controller
 * Handles SVG Map rendering, user interactions, bilingual UI updates, and export features.
 * References: Problem Statement §3.2, §3.3, §3.4, §4.2; Rulebook §5.6
 */

import { SimulationState } from "./logic/state.js";
import { getLanguage, setLanguage, t } from "./logic/i18n.js";

// Global simulation state instance
const state = new SimulationState();

// DOM Elements
const svgMap = document.getElementById("svg-map");
const svgEdgesLayer = document.getElementById("svg-edges-layer");
const svgNodesLayer = document.getElementById("svg-nodes-layer");
const selectStartNode = document.getElementById("select-start-node");
const routeStatusBadge = document.getElementById("route-status-badge");
const statusPulse = document.getElementById("status-pulse");
const valTotalCost = document.getElementById("val-total-cost");
const valDestinationExit = document.getElementById("val-destination-exit");
const valNodeSequence = document.getElementById("val-node-sequence");
const countBlockedNodes = document.getElementById("count-blocked-nodes");
const countBlockedEdges = document.getElementById("count-blocked-edges");
const countClosedExits = document.getElementById("count-closed-exits");
const buildingNameDisplay = document.getElementById("building-name-display");
const alertBanner = document.getElementById("alert-banner");
const alertMessage = document.getElementById("alert-message");
const btnAlertClose = document.getElementById("btn-alert-close");
const inputFileImport = document.getElementById("input-file-import");
const btnReset = document.getElementById("btn-reset");
const btnLoadSample = document.getElementById("btn-load-sample");
const btnLangToggle = document.getElementById("btn-lang-toggle");
const btnHighContrast = document.getElementById("btn-high-contrast");
const btnExportPng = document.getElementById("btn-export-png");
const tooltip = document.getElementById("map-tooltip");

// Hazard Control Panel DOM elements (FIX 1)
const selectHazardElement = document.getElementById("select-hazard-element");
const btnToggleHazard = document.getElementById("btn-toggle-hazard");
const txtHazardAction = document.getElementById("txt-hazard-action");
const optgroupRoomsJunctions = document.getElementById("optgroup-rooms-junctions");
const optgroupExits = document.getElementById("optgroup-exits");
const optgroupCorridors = document.getElementById("optgroup-corridors");

// Text elements for i18n
const i18nBindings = [
  { id: "txt-app-title", key: "appTitle" },
  { id: "txt-app-subtitle", key: "appSubtitle" },
  { id: "txt-building-label", key: "buildingLabel" },
  { id: "txt-btn-sample", key: "loadSample" },
  { id: "txt-btn-import", key: "importData" },
  { id: "txt-btn-reset", key: "resetSimulation" },
  { id: "txt-route-summary", key: "routeSummary" },
  { id: "txt-select-start", key: "selectStartLabel" },
  { id: "txt-select-element", key: "selectElement" },
  { id: "txt-total-cost", key: "totalCost" },
  { id: "txt-destination-exit", key: "destinationExit" },
  { id: "txt-node-sequence", key: "nodeSequence" },
  { id: "txt-legend-title", key: "legendTitle" },
  { id: "txt-legend-room", key: "legendRoom" },
  { id: "txt-legend-junction", key: "legendJunction" },
  { id: "txt-legend-exit", key: "legendExit" },
  { id: "txt-legend-blocked", key: "legendBlocked" },
  { id: "txt-legend-closed", key: "legendClosed" },
  { id: "txt-legend-route", key: "legendRoute" },
  { id: "txt-hint-text", key: "hintClickToToggle" },
  { id: "txt-count-nodes-label", key: "countBlockedRoomsJunctions" },
  { id: "txt-count-edges-label", key: "countBlockedCorridors" },
  { id: "txt-count-exits-label", key: "countClosedExits" },
  { id: "txt-tip-line-1", key: "tip1Text" },
  { id: "txt-tip-line-2", key: "tip2Text" }
];

let currentAlert = null;

/**
 * Update all interface strings to active language (FIX 2)
 */
function updateLanguageUI() {
  const lang = getLanguage();
  document.documentElement.lang = lang;

  for (const item of i18nBindings) {
    const el = document.getElementById(item.id);
    if (el) {
      el.textContent = t(item.key);
    }
  }

  // Toggle button label
  const langToggleText = document.getElementById("txt-lang-toggle");
  if (langToggleText) {
    langToggleText.textContent = lang === "en" ? "বাংলা" : "English";
  }

  // Button titles and aria-labels (FIX 2)
  if (btnLoadSample) {
    btnLoadSample.title = t("titles.loadSample");
    btnLoadSample.setAttribute("aria-label", t("titles.loadSample"));
  }
  const btnImportLabel = document.getElementById("btn-import-label");
  if (btnImportLabel) {
    btnImportLabel.title = t("titles.importJson");
    btnImportLabel.setAttribute("aria-label", t("titles.importJson"));
  }
  if (btnReset) {
    btnReset.title = t("titles.resetHazards");
    btnReset.setAttribute("aria-label", t("titles.resetHazards"));
  }
  if (btnHighContrast) {
    btnHighContrast.title = t("titles.highContrast");
    btnHighContrast.setAttribute("aria-label", t("titles.highContrast"));
  }
  if (btnExportPng) {
    btnExportPng.title = t("titles.exportPng");
    btnExportPng.setAttribute("aria-label", t("titles.exportPng"));
  }
  if (btnLangToggle) {
    btnLangToggle.setAttribute("aria-label", t("titles.langToggle"));
  }
  if (selectStartNode) {
    selectStartNode.setAttribute("aria-label", t("aria.selectStart"));
  }
  if (selectHazardElement) {
    selectHazardElement.setAttribute("aria-label", t("aria.selectHazardElement"));
  }
  if (btnAlertClose) {
    btnAlertClose.setAttribute("aria-label", t("aria.closeAlert"));
  }

  // Group labels
  if (optgroupRoomsJunctions) optgroupRoomsJunctions.label = t("optgroupRoomsJunctions");
  if (optgroupExits) optgroupExits.label = t("optgroupExits");
  if (optgroupCorridors) optgroupCorridors.label = t("optgroupCorridors");

  // Re-translate visible alert banner (FIX 2)
  if (currentAlert) {
    if (currentAlert.keyPath) {
      alertMessage.textContent = t(currentAlert.keyPath, currentAlert.params);
    } else if (currentAlert.rawMessage) {
      alertMessage.textContent = currentAlert.rawMessage;
    }
  }

  // Refresh dynamic state display
  renderState(state);
}

/**
 * Display alert banner with error key or message (FIX 2)
 */
function showAlert(keyPathOrMsg, params = {}) {
  if (typeof keyPathOrMsg === "string" && keyPathOrMsg.includes(".")) {
    currentAlert = { keyPath: keyPathOrMsg, params };
    alertMessage.textContent = t(keyPathOrMsg, params);
  } else {
    currentAlert = { rawMessage: keyPathOrMsg };
    alertMessage.textContent = keyPathOrMsg;
  }
  alertBanner.style.display = "flex";
}

function hideAlert() {
  currentAlert = null;
  alertBanner.style.display = "none";
  alertMessage.textContent = "";
}

/**
 * Calculate dynamic SVG viewBox with responsive padding
 */
function updateSvgViewBox(nodes) {
  if (!nodes || nodes.length === 0) return;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const n of nodes) {
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.y > maxY) maxY = n.y;
  }

  const paddingX = 90;
  const paddingY = 80;
  const width = Math.max(maxX - minX + paddingX * 2, 400);
  const height = Math.max(maxY - minY + paddingY * 2, 300);

  svgMap.setAttribute("viewBox", `${minX - paddingX} ${minY - paddingY} ${width} ${height}`);
}

/**
 * Render the building map SVG elements
 */
function renderSvgMap(simState) {
  const graph = simState.graph;
  if (!graph) return;

  updateSvgViewBox(graph.nodes);

  const routeResult = simState.routeResult;
  const edgesUsedSet = new Set(routeResult?.edgesUsed || []);
  const routeNodesSet = new Set(routeResult?.route || []);
  const startNodeId = simState.startNodeId;
  const blockedNodes = simState.blockedNodes;
  const blockedEdges = simState.blockedEdges;
  const closedExits = simState.closedExits;

  const nodeMap = new Map();
  for (const n of graph.nodes) {
    nodeMap.set(n.id, n);
  }

  // 1. Render Edges Layer
  svgEdgesLayer.innerHTML = "";
  for (const edge of graph.edges) {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);
    if (!fromNode || !toNode) continue;

    const isBlocked = blockedEdges.has(edge.id);
    const inRoute = edgesUsedSet.has(edge.id);

    // Invisible wider hit-area for easy touch/mouse/keyboard targeting (FIX 1)
    const hitArea = document.createElementNS("http://www.w3.org/2000/svg", "line");
    hitArea.setAttribute("x1", fromNode.x);
    hitArea.setAttribute("y1", fromNode.y);
    hitArea.setAttribute("x2", toNode.x);
    hitArea.setAttribute("y2", toNode.y);
    hitArea.setAttribute("class", "corridor-hitarea");
    hitArea.setAttribute("data-edge-id", edge.id);
    hitArea.setAttribute("tabindex", "0");
    hitArea.setAttribute("role", "button");
    hitArea.setAttribute("aria-label", `Corridor ${edge.from} to ${edge.to}, cost ${edge.cost}`);

    // Edge Line
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", fromNode.x);
    line.setAttribute("y1", fromNode.y);
    line.setAttribute("x2", toNode.x);
    line.setAttribute("y2", toNode.y);
    line.setAttribute("class", `corridor-edge ${inRoute ? "in-route" : ""} ${isBlocked ? "blocked" : ""}`);
    line.setAttribute("data-edge-id", edge.id);

    // Edge Cost Pill Badge at Midpoint
    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;

    const pillGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    pillGroup.setAttribute("class", "edge-cost-pill");
    pillGroup.setAttribute("transform", `translate(${midX}, ${midY})`);

    const pillBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    pillBg.setAttribute("x", "-15");
    pillBg.setAttribute("y", "-10");
    pillBg.setAttribute("width", "30");
    pillBg.setAttribute("height", "20");
    pillBg.setAttribute("class", `cost-bg ${inRoute ? "in-route" : ""} ${isBlocked ? "blocked" : ""}`);

    const pillText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    pillText.setAttribute("class", "cost-text");
    pillText.textContent = edge.cost;

    pillGroup.appendChild(pillBg);
    pillGroup.appendChild(pillText);

    // Corridor interaction: plain click selects in panel; Shift+click toggles immediately
    const onEdgeActivate = (e) => {
      selectHazardElementById("edge", edge.id);
      if (e.shiftKey) {
        simState.toggleEdgeBlock(edge.id);
      }
    };

    hitArea.addEventListener("click", onEdgeActivate);
    hitArea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onEdgeActivate(e);
      }
    });

    line.addEventListener("click", onEdgeActivate);
    pillGroup.addEventListener("click", (e) => {
      e.stopPropagation();
      onEdgeActivate(e);
    });

    svgEdgesLayer.appendChild(hitArea);
    svgEdgesLayer.appendChild(line);
    svgEdgesLayer.appendChild(pillGroup);
  }

  // 2. Render Nodes Layer
  svgNodesLayer.innerHTML = "";
  for (const node of graph.nodes) {
    const isStart = node.id === startNodeId;
    const isBlocked = blockedNodes.has(node.id);
    const isClosedExit = closedExits.has(node.id);
    const inRoute = routeNodesSet.has(node.id);

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", `graph-node node-${node.type} ${isStart ? "is-start" : ""} ${isBlocked ? "blocked" : ""} ${isClosedExit ? "closed-exit" : ""} ${inRoute ? "in-route" : ""}`);
    group.setAttribute("transform", `translate(${node.x}, ${node.y})`);
    group.setAttribute("data-node-id", node.id);
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "button");
    group.setAttribute("aria-label", `${node.label} (${node.id}) - ${t(`nodeTypes.${node.type}`)}`);

    if (node.type === "room") {
      // Room: rounded rectangle
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", "-35");
      rect.setAttribute("y", "-25");
      rect.setAttribute("width", "70");
      rect.setAttribute("height", "50");
      rect.setAttribute("rx", "10");
      rect.setAttribute("ry", "10");
      rect.setAttribute("class", "node-shape");
      group.appendChild(rect);
    } else if (node.type === "junction") {
      // Junction: circle
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", "0");
      circle.setAttribute("cy", "0");
      circle.setAttribute("r", "25");
      circle.setAttribute("class", "node-shape");
      group.appendChild(circle);
    } else if (node.type === "exit") {
      // Exit: rounded hex / stadium
      const exitRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      exitRect.setAttribute("x", "-35");
      exitRect.setAttribute("y", "-25");
      exitRect.setAttribute("width", "70");
      exitRect.setAttribute("height", "50");
      exitRect.setAttribute("rx", "14");
      exitRect.setAttribute("ry", "14");
      exitRect.setAttribute("class", "node-shape");
      group.appendChild(exitRect);
    }

    // Node ID Label
    const textLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textLabel.setAttribute("class", "node-label");
    textLabel.setAttribute("y", node.type === "junction" ? "0" : "-3");
    textLabel.textContent = node.id;
    group.appendChild(textLabel);

    // Sub-label for Room or Exit
    if (node.type !== "junction") {
      const typeLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
      typeLabel.setAttribute("class", "node-type-label");
      typeLabel.setAttribute("y", "15");
      typeLabel.textContent = t(`nodeTypes.${node.type}`);
      group.appendChild(typeLabel);
    }

    // Node Interaction: Plain click selects in panel (and sets start for unblocked rooms/junctions)
    // Shift-click directly toggles hazard shortcut
    const onNodeActivate = (e) => {
      if (node.type === "exit") {
        selectHazardElementById("exit", node.id);
      } else {
        selectHazardElementById("node", node.id);
      }

      if (e.shiftKey) {
        if (node.type === "exit") {
          simState.toggleExitClose(node.id);
        } else {
          simState.toggleNodeBlock(node.id);
        }
      } else {
        if (node.type === "room" || node.type === "junction") {
          simState.setStartNode(node.id);
        }
      }
    };

    group.addEventListener("click", onNodeActivate);
    group.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onNodeActivate(e);
      }
    });

    // Right click shortcut directly toggles hazard
    group.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (node.type === "exit") {
        selectHazardElementById("exit", node.id);
        simState.toggleExitClose(node.id);
      } else {
        selectHazardElementById("node", node.id);
        simState.toggleNodeBlock(node.id);
      }
    });

    // Tooltip listeners
    group.addEventListener("mouseenter", (e) => {
      showNodeTooltip(e, node, isBlocked, isClosedExit, isStart);
    });
    group.addEventListener("mouseleave", () => {
      hideTooltip();
    });

    svgNodesLayer.appendChild(group);
  }
}

/**
 * Show hover tooltip for map nodes (FIX 2 i18n & FIX 4 safe DOM textContent)
 */
function showNodeTooltip(e, node, isBlocked, isClosedExit, isStart) {
  let statusText = isBlocked ? `⚠️ ${t("tooltip.blocked")}` : (isClosedExit ? `🚫 ${t("tooltip.closed")}` : `✓ ${t("tooltip.active")}`);
  if (isStart) statusText += ` ${t("tooltip.start")}`;

  tooltip.replaceChildren();

  const strong = document.createElement("strong");
  strong.textContent = `${node.label} [${node.id}]`;
  tooltip.appendChild(strong);
  tooltip.appendChild(document.createElement("br"));

  const typeSpan = document.createElement("span");
  typeSpan.textContent = `${t("tooltip.type")} ${t(`nodeTypes.${node.type}`)}`;
  tooltip.appendChild(typeSpan);
  tooltip.appendChild(document.createElement("br"));

  const statusSpan = document.createElement("span");
  statusSpan.textContent = `${t("tooltip.status")} ${statusText}`;
  tooltip.appendChild(statusSpan);
  tooltip.appendChild(document.createElement("br"));

  const hintSpan = document.createElement("span");
  hintSpan.style.color = "#94a3b8";
  hintSpan.style.fontSize = "0.72rem";
  hintSpan.textContent = t("tooltip.clickHint");
  tooltip.appendChild(hintSpan);

  tooltip.style.display = "block";
  tooltip.style.left = `${e.pageX + 12}px`;
  tooltip.style.top = `${e.pageY + 12}px`;
}

function hideTooltip() {
  tooltip.style.display = "none";
}

/**
 * Render State and Sync UI components
 */
function renderState(simState) {
  if (!simState.graph) return;

  buildingNameDisplay.textContent = simState.graph.building;

  // 1. Update start node dropdown
  populateStartSelect(simState);

  // 2. Update Hazard dropdown options & action button (FIX 1)
  populateHazardElementSelect(simState);

  // 3. Update Hazard Counts
  countBlockedNodes.textContent = simState.blockedNodes.size;
  countBlockedEdges.textContent = simState.blockedEdges.size;
  countClosedExits.textContent = simState.closedExits.size;

  // 4. Update Route Results Card
  const result = simState.routeResult;
  if (!result) return;

  if (result.status === "route_found") {
    routeStatusBadge.textContent = t("routeFound");
    routeStatusBadge.className = "badge badge-success";
    statusPulse.className = "status-pulse";
    valTotalCost.textContent = result.cost;
    valDestinationExit.textContent = result.exit;

    // Build step chips safely (FIX 4)
    valNodeSequence.replaceChildren();
    result.route.forEach((nodeId, idx) => {
      const chip = document.createElement("span");
      chip.className = `sequence-chip ${idx === result.route.length - 1 ? "exit-chip" : ""}`;
      chip.textContent = nodeId;
      valNodeSequence.appendChild(chip);

      if (idx < result.route.length - 1) {
        const arrow = document.createElement("span");
        arrow.className = "sequence-arrow";
        arrow.textContent = "→";
        valNodeSequence.appendChild(arrow);
      }
    });
  } else if (result.status === "blocked_start") {
    // Exact string requirement: "Starting location blocked"
    routeStatusBadge.textContent = t("startingLocationBlocked");
    routeStatusBadge.className = "badge badge-danger";
    statusPulse.className = "status-pulse blocked";
    valTotalCost.textContent = "—";
    valDestinationExit.textContent = "—";
    valNodeSequence.replaceChildren();
    const emptySpan = document.createElement("span");
    emptySpan.className = "sequence-empty";
    emptySpan.style.color = "var(--accent-crimson)";
    emptySpan.textContent = t("startingLocationBlocked");
    valNodeSequence.appendChild(emptySpan);
  } else if (result.status === "no_route") {
    // Exact string requirement: "No route available"
    routeStatusBadge.textContent = t("noRouteAvailable");
    routeStatusBadge.className = "badge badge-danger";
    statusPulse.className = "status-pulse blocked";
    valTotalCost.textContent = "—";
    valDestinationExit.textContent = "—";
    valNodeSequence.replaceChildren();
    const emptySpan = document.createElement("span");
    emptySpan.className = "sequence-empty";
    emptySpan.style.color = "var(--accent-crimson)";
    emptySpan.textContent = t("noRouteAvailable");
    valNodeSequence.appendChild(emptySpan);
  } else {
    routeStatusBadge.textContent = t("startNodeSelectPlaceholder");
    routeStatusBadge.className = "badge badge-warning";
    statusPulse.className = "status-pulse warning";
    valTotalCost.textContent = "—";
    valDestinationExit.textContent = "—";
    valNodeSequence.replaceChildren();
    const emptySpan = document.createElement("span");
    emptySpan.className = "sequence-empty";
    emptySpan.textContent = t("startNodeSelectPlaceholder");
    valNodeSequence.appendChild(emptySpan);
  }

  // 5. Update SVG Map
  renderSvgMap(simState);
}

/**
 * Populate start location selector with rooms and junctions
 */
function populateStartSelect(simState) {
  const currentVal = selectStartNode.value;
  selectStartNode.replaceChildren();

  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = t("startNodeSelectPlaceholder");
  selectStartNode.appendChild(defaultOpt);

  for (const node of simState.graph.nodes) {
    if (node.type === "room" || node.type === "junction") {
      const opt = document.createElement("option");
      opt.value = node.id;
      const isBlocked = simState.blockedNodes.has(node.id);
      opt.textContent = `${node.label} (${node.id}) - ${t(`nodeTypes.${node.type}`)}${isBlocked ? ` ${t("blockedBadgeTag")}` : ""}`;
      selectStartNode.appendChild(opt);
    }
  }

  selectStartNode.value = simState.startNodeId || currentVal || "";
}

/**
 * Select element in the hazard dropdown and update button state (FIX 1)
 */
function selectHazardElementById(elementType, elementId) {
  if (!selectHazardElement) return;
  selectHazardElement.value = `${elementType}:${elementId}`;
  updateHazardActionButton(state);
}

/**
 * Update the hazard action button text, class and enabled state
 */
function updateHazardActionButton(simState) {
  if (!selectHazardElement || !btnToggleHazard || !txtHazardAction) return;
  const val = selectHazardElement.value;
  if (!val || !simState.graph) {
    btnToggleHazard.disabled = true;
    txtHazardAction.textContent = "Block / Unblock";
    btnToggleHazard.className = "btn btn-warning";
    return;
  }

  btnToggleHazard.disabled = false;
  const [type, id] = val.split(":");

  if (type === "node") {
    const isBlocked = simState.blockedNodes.has(id);
    if (isBlocked) {
      txtHazardAction.textContent = t("actions.unblockNode");
      btnToggleHazard.className = "btn btn-secondary";
    } else {
      txtHazardAction.textContent = t("actions.blockNode");
      btnToggleHazard.className = "btn btn-warning";
    }
  } else if (type === "exit") {
    const isClosed = simState.closedExits.has(id);
    if (isClosed) {
      txtHazardAction.textContent = t("actions.reopenExit");
      btnToggleHazard.className = "btn btn-secondary";
    } else {
      txtHazardAction.textContent = t("actions.closeExit");
      btnToggleHazard.className = "btn btn-danger";
    }
  } else if (type === "edge") {
    const isBlocked = simState.blockedEdges.has(id);
    if (isBlocked) {
      txtHazardAction.textContent = t("actions.unblockEdge");
      btnToggleHazard.className = "btn btn-secondary";
    } else {
      txtHazardAction.textContent = t("actions.blockEdge");
      btnToggleHazard.className = "btn btn-warning";
    }
  }
}

/**
 * Populate grouped hazard element selector (Rooms/Junctions, Exits, Corridors)
 */
function populateHazardElementSelect(simState) {
  if (!selectHazardElement || !simState.graph) return;
  const currentVal = selectHazardElement.value;

  optgroupRoomsJunctions.replaceChildren();
  optgroupExits.replaceChildren();
  optgroupCorridors.replaceChildren();

  for (const node of simState.graph.nodes) {
    const opt = document.createElement("option");
    if (node.type === "room" || node.type === "junction") {
      opt.value = `node:${node.id}`;
      const isBlocked = simState.blockedNodes.has(node.id);
      opt.textContent = `${node.label} (${node.id}) - ${t(`nodeTypes.${node.type}`)}${isBlocked ? ` ${t("blockedBadgeTag")}` : ""}`;
      optgroupRoomsJunctions.appendChild(opt);
    } else if (node.type === "exit") {
      opt.value = `exit:${node.id}`;
      const isClosed = simState.closedExits.has(node.id);
      opt.textContent = `${node.label} (${node.id}) - ${t("nodeTypes.exit")}${isClosed ? ` ${t("closedBadgeTag")}` : ""}`;
      optgroupExits.appendChild(opt);
    }
  }

  for (const edge of simState.graph.edges) {
    const opt = document.createElement("option");
    opt.value = `edge:${edge.id}`;
    const isBlocked = simState.blockedEdges.has(edge.id);
    opt.textContent = `${edge.from} ↔ ${edge.to} (${t("totalCost")}: ${edge.cost})${isBlocked ? ` ${t("blockedBadgeTag")}` : ""}`;
    optgroupCorridors.appendChild(opt);
  }

  if (currentVal) {
    selectHazardElement.value = currentVal;
  }
  updateHazardActionButton(simState);
}

/**
 * Initialize event listeners
 */
function setupEventListeners() {
  // Subscribe UI to state updates
  state.subscribe(renderState);

  // Start node dropdown change
  selectStartNode.addEventListener("change", (e) => {
    state.setStartNode(e.target.value);
  });

  // Hazard dropdown change (FIX 1)
  selectHazardElement.addEventListener("change", () => {
    updateHazardActionButton(state);
  });

  // Hazard action button click (FIX 1)
  btnToggleHazard.addEventListener("click", () => {
    const val = selectHazardElement.value;
    if (!val) return;
    const [type, id] = val.split(":");
    if (type === "node") {
      state.toggleNodeBlock(id);
    } else if (type === "exit") {
      state.toggleExitClose(id);
    } else if (type === "edge") {
      state.toggleEdgeBlock(id);
    }
  });

  // Reset simulation hazards
  btnReset.addEventListener("click", () => {
    state.resetHazards();
    hideAlert();
  });

  // Load sample building
  btnLoadSample.addEventListener("click", async () => {
    try {
      const resp = await fetch("building.json");
      if (!resp.ok) {
        showAlert("validationErrors.fetchError");
        return;
      }
      const data = await resp.json();
      const res = state.loadBuilding(data);
      if (!res.success) {
        showAlert(res.errorKey || res.error, res.errorParams);
      } else {
        hideAlert();
      }
    } catch (err) {
      showAlert("validationErrors.fetchError");
    }
  });

  // File import picker
  inputFileImport.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawJson = JSON.parse(event.target.result);
        const res = state.loadBuilding(rawJson);
        if (!res.success) {
          showAlert(res.errorKey || res.error, res.errorParams);
        } else {
          hideAlert();
        }
      } catch (parseErr) {
        showAlert("validationErrors.invalidJSON");
      }
      inputFileImport.value = "";
    };
    reader.onerror = () => {
      showAlert("validationErrors.fileReadError");
      inputFileImport.value = "";
    };
    reader.readAsText(file);
  });

  // Close alert banner
  btnAlertClose.addEventListener("click", hideAlert);

  // Language switch
  btnLangToggle.addEventListener("click", () => {
    const nextLang = getLanguage() === "en" ? "bn" : "en";
    setLanguage(nextLang);
    updateLanguageUI();
  });

  // High contrast mode toggle
  btnHighContrast.addEventListener("click", () => {
    document.body.classList.toggle("theme-high-contrast");
  });

  // PNG Export feature
  btnExportPng.addEventListener("click", () => {
    exportMapToPng();
  });
}

/**
 * Export SVG Map as PNG image
 */
function exportMapToPng() {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgMap);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const URL = window.URL || window.webkitURL || window;
  const blobURL = URL.createObjectURL(svgBlob);
  const image = new Image();

  image.onload = () => {
    const canvas = document.getElementById("export-canvas");
    canvas.width = svgMap.clientWidth || 1200;
    canvas.height = svgMap.clientHeight || 800;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0b0f19";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const pngData = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.download = `smart-escape-${Date.now()}.png`;
    downloadLink.href = pngData;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(blobURL);
  };
  image.src = blobURL;
}

/**
 * Application Entry Point
 */
async function initApp() {
  setupEventListeners();

  // Load canonical building data on launch
  try {
    const resp = await fetch("building.json");
    if (resp.ok) {
      const data = await resp.json();
      state.loadBuilding(data);

      // Support URL search parameters for state initialization
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("lang")) {
        setLanguage(urlParams.get("lang"));
      }
      if (urlParams.has("start")) {
        state.setStartNode(urlParams.get("start"));
      }
      if (urlParams.has("blockNode")) {
        urlParams.get("blockNode").split(",").forEach(id => id.trim() && state.toggleNodeBlock(id.trim()));
      }
      if (urlParams.has("blockEdge")) {
        urlParams.get("blockEdge").split(",").forEach(id => id.trim() && state.toggleEdgeBlock(id.trim()));
      }
      if (urlParams.has("closeExit")) {
        urlParams.get("closeExit").split(",").forEach(id => id.trim() && state.toggleExitClose(id.trim()));
      }
    }
  } catch (e) {
    console.warn("Auto-load failed, standing by for manual import.", e);
  }

  updateLanguageUI();
}

window.addEventListener("DOMContentLoaded", initApp);
