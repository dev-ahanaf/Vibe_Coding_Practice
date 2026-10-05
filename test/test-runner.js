/**
 * Comprehensive Automated CLI Test Suite for Smart Escape
 * Sources: Problem Statement §3.1, §3.2, §3.3, §3.4, §04.1
 */

import { validateBuildingData } from "../logic/validate.js";
import { calculateEvacuationRoute, compareNodeSequences } from "../logic/route.js";
import { SimulationState } from "../logic/state.js";
import { translations } from "../logic/i18n.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let passed = 0;
let failed = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} - ${details}`);
    failed++;
  }
}

console.log("=========================================");
console.log("SMART ESCAPE - AUTOMATED LOGIC VERIFICATION");
console.log("=========================================\n");

// Read canonical sample data
const sampleJson = JSON.parse(readFileSync(join(__dirname, "../building.json"), "utf8"));

// ----------------------------------------------------
// TEST GROUP 1: Canonical Sample Checks (Statement §04.1)
// ----------------------------------------------------
console.log("TEST GROUP 1: Official Sample Checks (Statement §04.1)");

const state = new SimulationState();
const loadRes = state.loadBuilding(sampleJson);
assert(loadRes.success, "Load canonical building.json");

// Scenario 1: Baseline (Select R1)
state.resetHazards();
state.setStartNode("R1");
let snap = state.getSnapshot();
assert(
  snap.routeResult.status === "route_found" &&
  snap.routeResult.route.join(" - ") === "R1 - C1 - C2 - E1" &&
  snap.routeResult.cost === 7 &&
  snap.routeResult.exit === "E1",
  "Baseline: R1 -> E1; cost 7",
  `Got: ${snap.routeResult.route?.join(" - ")}, cost: ${snap.routeResult.cost}`
);

// Scenario 2: Blocked junction (Select R1; block C2)
state.resetHazards();
state.setStartNode("R1");
state.toggleNodeBlock("C2");
snap = state.getSnapshot();
assert(
  snap.routeResult.status === "route_found" &&
  snap.routeResult.route.join(" - ") === "R1 - C1 - C3 - C4 - E2" &&
  snap.routeResult.cost === 11 &&
  snap.routeResult.exit === "E2",
  "Blocked junction: R1 - C1 - C3 - C4 - E2; cost 11",
  `Got: ${snap.routeResult.route?.join(" - ")}, cost: ${snap.routeResult.cost}`
);

// Scenario 3: Exits closed (Select R1; close E1 and E2)
state.resetHazards();
state.setStartNode("R1");
state.toggleExitClose("E1");
state.toggleExitClose("E2");
snap = state.getSnapshot();
assert(
  snap.routeResult.status === "no_route" &&
  snap.routeResult.message === "No route available" &&
  snap.routeResult.route.length === 0,
  "Exits closed: No route available",
  `Got message: '${snap.routeResult.message}'`
);

// Scenario 4: Different start (Select R2)
state.resetHazards();
state.setStartNode("R2");
snap = state.getSnapshot();
assert(
  snap.routeResult.status === "route_found" &&
  snap.routeResult.route.join(" - ") === "R2 - C3 - C4 - E2" &&
  snap.routeResult.cost === 7 &&
  snap.routeResult.exit === "E2",
  "Different start: R2 - C3 - C4 - E2; cost 7",
  `Got: ${snap.routeResult.route?.join(" - ")}, cost: ${snap.routeResult.cost}`
);

// Scenario 5: Blocked start (Select R1; then block R1)
state.resetHazards();
state.setStartNode("R1");
state.toggleNodeBlock("R1");
snap = state.getSnapshot();
assert(
  snap.routeResult.status === "blocked_start" &&
  snap.routeResult.message === "Starting location blocked" &&
  snap.routeResult.route.length === 0,
  "Blocked start: Starting location blocked",
  `Got message: '${snap.routeResult.message}'`
);

// ----------------------------------------------------
// TEST GROUP 2: Tie-Breaking Rules (Statement §3.3)
// ----------------------------------------------------
console.log("\nTEST GROUP 2: Tie-Breaking Rigor (Statement §3.3)");

// Test 2.1: Equal Cost to Different Exits -> Lexicographically smaller exit ID
const tieBreakGraph1 = {
  building: "Tie Break 1",
  nodes: [
    { id: "R1", label: "Start", type: "room", x: 0, y: 0 },
    { id: "EZ", label: "Exit Z", type: "exit", x: 10, y: 0 },
    { id: "EA", label: "Exit A", type: "exit", x: 0, y: 10 }
  ],
  edges: [
    { id: "e1", from: "R1", to: "EZ", cost: 5 },
    { id: "e2", from: "R1", to: "EA", cost: 5 }
  ]
};
const resTie1 = calculateEvacuationRoute(tieBreakGraph1, "R1", {});
assert(
  resTie1.status === "route_found" && resTie1.exit === "EA" && resTie1.cost === 5,
  "Exit ID tie-breaking: EA chosen over EZ on equal cost 5",
  `Chosen: ${resTie1.exit}`
);

// Test 2.2: Equal Cost to Same Exit -> Lexicographical node sequence tie-break
const tieBreakGraph2 = {
  building: "Tie Break 2",
  nodes: [
    { id: "R1", label: "Start", type: "room", x: 0, y: 0 },
    { id: "JA", label: "Junction A", type: "junction", x: 5, y: 0 },
    { id: "JB", label: "Junction B", type: "junction", x: 5, y: 10 },
    { id: "E1", label: "Exit", type: "exit", x: 10, y: 5 }
  ],
  edges: [
    { id: "e1", from: "R1", to: "JA", cost: 2 },
    { id: "e2", from: "JA", to: "E1", cost: 3 },
    { id: "e3", from: "R1", to: "JB", cost: 2 },
    { id: "e4", from: "JB", to: "E1", cost: 3 }
  ]
};
const resTie2 = calculateEvacuationRoute(tieBreakGraph2, "R1", {});
assert(
  resTie2.status === "route_found" && resTie2.route.join(" -> ") === "R1 -> JA -> E1",
  "Node sequence tie-breaking: R1 -> JA -> E1 preferred over R1 -> JB -> E1",
  `Chosen route: ${resTie2.route.join(" -> ")}`
);

// ----------------------------------------------------
// TEST GROUP 3: Input / Schema Validation (Statement §3.1)
// ----------------------------------------------------
console.log("\nTEST GROUP 3: Schema & Constraint Validation (Statement §3.1)");

// Test 3.1: Reject missing root fields
const invalid1 = validateBuildingData({ building: "Test" });
assert(!invalid1.isValid, "Reject missing root fields");

// Test 3.2: Reject node count < 2
const invalid2 = validateBuildingData({
  building: "Test",
  nodes: [{ id: "R1", label: "R1", type: "room", x: 0, y: 0 }],
  edges: [],
  initial_state: { blocked_nodes: [], blocked_edges: [], closed_exits: [] }
});
assert(!invalid2.isValid, "Reject node count < 2");

// Test 3.3: Reject missing exit
const invalid3 = validateBuildingData({
  building: "Test",
  nodes: [
    { id: "R1", label: "R1", type: "room", x: 0, y: 0 },
    { id: "C1", label: "C1", type: "junction", x: 1, y: 1 }
  ],
  edges: [{ id: "e1", from: "R1", to: "C1", cost: 1 }],
  initial_state: { blocked_nodes: [], blocked_edges: [], closed_exits: [] }
});
assert(!invalid3.isValid, "Reject graph without an exit");

// Test 3.4: Reject self-loops
const invalid4 = validateBuildingData({
  building: "Test",
  nodes: [
    { id: "R1", label: "R1", type: "room", x: 0, y: 0 },
    { id: "E1", label: "E1", type: "exit", x: 1, y: 1 }
  ],
  edges: [{ id: "e1", from: "R1", to: "R1", cost: 1 }],
  initial_state: { blocked_nodes: [], blocked_edges: [], closed_exits: [] }
});
assert(!invalid4.isValid, "Reject self-loop edge");

// Test 3.5: Reject repeated node pairs (undirected)
const invalid5 = validateBuildingData({
  building: "Test",
  nodes: [
    { id: "R1", label: "R1", type: "room", x: 0, y: 0 },
    { id: "E1", label: "E1", type: "exit", x: 1, y: 1 }
  ],
  edges: [
    { id: "e1", from: "R1", to: "E1", cost: 2 },
    { id: "e2", from: "E1", to: "R1", cost: 4 }
  ],
  initial_state: { blocked_nodes: [], blocked_edges: [], closed_exits: [] }
});
assert(!invalid5.isValid, "Reject duplicate edge pair (R1-E1 and E1-R1)");

// Test 3.6: Reject non-positive edge cost
const invalid6 = validateBuildingData({
  building: "Test",
  nodes: [
    { id: "R1", label: "R1", type: "room", x: 0, y: 0 },
    { id: "E1", label: "E1", type: "exit", x: 1, y: 1 }
  ],
  edges: [{ id: "e1", from: "R1", to: "E1", cost: -3 }],
  initial_state: { blocked_nodes: [], blocked_edges: [], closed_exits: [] }
});
assert(!invalid6.isValid, "Reject non-positive edge cost (-3)");

// Test 3.7: Reject category mismatch in initial_state (exit listed in blocked_nodes)
const invalid7 = validateBuildingData({
  building: "Test",
  nodes: [
    { id: "R1", label: "R1", type: "room", x: 0, y: 0 },
    { id: "E1", label: "E1", type: "exit", x: 1, y: 1 }
  ],
  edges: [{ id: "e1", from: "R1", to: "E1", cost: 2 }],
  initial_state: { blocked_nodes: ["E1"], blocked_edges: [], closed_exits: [] }
});
assert(!invalid7.isValid, "Reject category mismatch: exit 'E1' in blocked_nodes");

// Test 3.8: Disconnected graph is valid per Statement §3.1
const validDisconnected = validateBuildingData({
  building: "Disconnected Building",
  nodes: [
    { id: "R1", label: "Room 1", type: "room", x: 0, y: 0 },
    { id: "E1", label: "Exit 1", type: "exit", x: 10, y: 10 },
    { id: "R2", label: "Room 2", type: "room", x: 20, y: 20 },
    { id: "E2", label: "Exit 2", type: "exit", x: 30, y: 30 }
  ],
  edges: [
    { id: "e1", from: "R1", to: "E1", cost: 3 },
    { id: "e2", from: "R2", to: "E2", cost: 4 }
  ],
  initial_state: { blocked_nodes: [], blocked_edges: [], closed_exits: [] }
});
assert(validDisconnected.isValid, "Allow valid disconnected graph");

// ----------------------------------------------------
// TEST GROUP 4: Exact Required Strings Verification (Fix 3 / Statement §3.2)
// ----------------------------------------------------
console.log("\nTEST GROUP 4: Exact Required Strings (Problem Statement §3.2 & §04.1)");
assert(translations.en.noRouteAvailable === "No route available", "Exact English string: 'No route available'");
assert(translations.en.startingLocationBlocked === "Starting location blocked", "Exact English string: 'Starting location blocked'");
assert(translations.bn.noRouteAvailable === "কোনো রুট পাওয়া যায়নি", "Verified Bangla string: 'কোনো রুট পাওয়া যায়নি'");
assert(translations.bn.startingLocationBlocked === "শুরুর অবস্থান অবরুদ্ধ", "Verified Bangla string: 'শুরুর অবস্থান অবরুদ্ধ'");

console.log("\n=========================================");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("=========================================\n");

if (failed > 0) {
  process.exit(1);
}
