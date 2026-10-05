/**
 * Centralized Internationalization (i18n) dictionary for Smart Escape
 * Sources: Problem Statement §3.2, §4.1; Rulebook §5.6
 */

export const translations = {
  en: {
    appTitle: "Smart Escape",
    appSubtitle: "Interactive Evacuation Route Simulator",
    buildingLabel: "Building",
    importData: "Import JSON",
    loadSample: "Load Sample Building",
    resetSimulation: "Reset Hazards",
    languageToggle: "বাংলা",
    selectStartLabel: "Select Start Location",
    selectElement: "Select Element",
    startNodeSelectPlaceholder: "-- Choose a start node --",
    hazardSelectPlaceholder: "-- Choose an element --",
    startNode: "Start Node",
    routeFound: "Route Found",
    noRouteAvailable: "No route available",
    startingLocationBlocked: "Starting location blocked",
    routeSummary: "Evacuation Plan",
    destinationExit: "Destination Exit",
    totalCost: "Total Path Cost",
    nodeSequence: "Route Sequence",
    legendTitle: "Map Legend & Hazard Controls",
    legendRoom: "Room (Start candidate)",
    legendJunction: "Corridor Junction",
    legendExit: "Exit",
    legendStart: "Start Location (Marker)",
    legendBlocked: "Blocked / Hazardous",
    legendClosed: "Closed Exit",
    legendRoute: "Active Evacuation Path",
    hintClickToToggle: "Click node/edge to select or toggle",
    countBlockedRoomsJunctions: "Blocked Rooms/Junctions:",
    countBlockedCorridors: "Blocked Corridors:",
    countClosedExits: "Closed Exits:",
    tip1Text: "💡 Tip: Click any Room or Junction on the map to set it as Start.",
    tip2Text: "⚠️ Hazards: Use the hazard panel above, or Shift-click/right-click to toggle elements directly.",
    noActiveRoute: "No active route",
    calculating: "Calculating...",
    blockedBadgeTag: "[BLOCKED]",
    closedBadgeTag: "[CLOSED]",
    optgroupRoomsJunctions: "Rooms & Junctions",
    optgroupExits: "Exits",
    optgroupCorridors: "Corridors",
    nodeTypes: {
      room: "Room",
      junction: "Junction",
      exit: "Exit"
    },
    actions: {
      blockNode: "Block",
      unblockNode: "Unblock",
      blockEdge: "Block Corridor",
      unblockEdge: "Unblock Corridor",
      closeExit: "Close Exit",
      reopenExit: "Reopen Exit"
    },
    tooltip: {
      type: "Type:",
      status: "Status:",
      active: "Active",
      blocked: "Blocked",
      closed: "Closed",
      start: "(Start)",
      clickHint: "Click: Select | Shift+Click/Right-Click: Toggle Hazard"
    },
    titles: {
      loadSample: "Load Default Canonical Sample",
      importJson: "Import building.json",
      resetHazards: "Restore original initial_state hazards",
      highContrast: "Toggle High-Contrast Mode",
      themeLight: "Switch to Light Mode",
      themeDark: "Switch to Dark Mode",
      exportPng: "Export Map as PNG",
      langToggle: "Toggle language"
    },
    aria: {
      selectStart: "Starting location",
      selectHazardElement: "Select building element to control hazard",
      closeAlert: "Close notification"
    },
    validationErrors: {
      invalidJSON: "Invalid JSON format: Unable to parse file.",
      missingRoot: "Missing required root fields: 'building', 'nodes', 'edges', 'initial_state'.",
      invalidBuilding: "'building' must be a non-empty string.",
      nodeLimit: "Node count must be between 2 and 60.",
      edgeLimit: "Edge count must be between 1 and 150.",
      missingStartOrExit: "Graph must have at least one room/junction and at least one exit.",
      duplicateNodeId: "Duplicate node ID detected: '{id}'.",
      invalidNode: "Node '{id}' is invalid: must have id, non-empty label, numeric x, y, and type 'room', 'junction', or 'exit'.",
      duplicateEdgeId: "Duplicate edge ID detected: '{id}'.",
      invalidEdgeNodes: "Edge '{id}' connects invalid or nonexistent node IDs: '{from}' -> '{to}'.",
      selfLoop: "Edge '{id}' is a self-loop on node '{from}'.",
      repeatedPair: "Corridor between '{u}' and '{v}' is defined multiple times.",
      invalidEdgeCost: "Edge '{id}' must have a positive integer cost (> 0). Found: {cost}.",
      invalidInitialState: "'initial_state' must contain arrays: 'blocked_nodes', 'blocked_edges', 'closed_exits'.",
      initialStateUnknownId: "Unknown ID '{id}' referenced in initial_state.{category}.",
      initialStateCategoryMismatch: "ID '{id}' in initial_state.{category} does not match expected category: expected {expectedType}, found {actualType}.",
      fileReadError: "File read error.",
      fetchError: "Could not fetch building.json"
    },
    status: {
      ready: "Ready. Select a starting location or adjust hazards.",
      calculating: "Recalculating safest evacuation route...",
      resetSuccess: "Building restored to initial hazard state.",
      importedSuccess: "Building data successfully imported and verified.",
      exportSuccess: "Map exported successfully."
    },
    bonus: {
      alternativeRoute: "Alternative Route",
      noAlternative: "No viable alternative route exists.",
      exportPNG: "Export Map as PNG",
      highContrast: "High Contrast Mode"
    }
  },
  bn: {
    appTitle: "স্মার্ট এস্কেপ",
    appSubtitle: "ইন্টারঅ্যাক্টিভ স্থানান্তর রুট সিমুলেটর",
    buildingLabel: "ভবন",
    importData: "JSON ইম্পোর্ট করুন",
    loadSample: "নমুনা ভবন লোড করুন",
    resetSimulation: "বিপদাবস্থা রিসেট করুন",
    languageToggle: "English",
    selectStartLabel: "শুরুর স্থান নির্বাচন করুন",
    selectElement: "উপাদান নির্বাচন করুন",
    startNodeSelectPlaceholder: "-- শুরুর নোড নির্বাচন করুন --",
    hazardSelectPlaceholder: "-- উপাদান নির্বাচন করুন --",
    startNode: "শুরুর নোড",
    routeFound: "রুট পাওয়া গেছে",
    noRouteAvailable: "কোনো রুট পাওয়া যায়নি",
    startingLocationBlocked: "শুরুর অবস্থান অবরুদ্ধ",
    routeSummary: "স্থানান্তর পরিকল্পনা",
    destinationExit: "গন্তব্য বহির্গমন পথ",
    totalCost: "মোট খরচ",
    nodeSequence: "রুট ক্রম",
    legendTitle: "মানচিত্র নির্দেশিকা ও বিপদ নিয়ন্ত্রণ",
    legendRoom: "কক্ষ (শুরুর উপযোগী)",
    legendJunction: "করিডোর জাংশন",
    legendExit: "বহির্গমন পথ",
    legendStart: "শুরুর অবস্থান (মার্কার)",
    legendBlocked: "অবরুদ্ধ / ঝুঁকিপূর্ণ",
    legendClosed: "বন্ধ বহির্গমন পথ",
    legendRoute: "সক্রিয় নির্গমন রুট",
    hintClickToToggle: "নির্বাচন বা টগল করতে নোড/করিডোরে ক্লিক করুন",
    countBlockedRoomsJunctions: "অবরুদ্ধ কক্ষ/জাংশন:",
    countBlockedCorridors: "অবরুদ্ধ করিডোর:",
    countClosedExits: "বন্ধ বহির্গমন পথ:",
    tip1Text: "💡 পরামর্শ: শুরুর স্থান হিসেবে নির্বাচন করতে মানচিত্রে যেকোনো কক্ষ বা জাংশনে ক্লিক করুন।",
    tip2Text: "⚠️ বিপদাবস্থা: উপরের বিপদ নিয়ন্ত্রণ প্যানেল ব্যবহার করুন, অথবা সরাসরি টগল করতে Shift-ক্লিক/রাইট-ক্লিক করুন।",
    noActiveRoute: "কোনো সক্রিয় রুট নেই",
    calculating: "গণনা করা হচ্ছে...",
    blockedBadgeTag: "[অবরুদ্ধ]",
    closedBadgeTag: "[বন্ধ]",
    optgroupRoomsJunctions: "কক্ষ ও জাংশনসমূহ",
    optgroupExits: "বহির্গমন পথসমূহ",
    optgroupCorridors: "করিডোরসমূহ",
    nodeTypes: {
      room: "কক্ষ",
      junction: "জাংশন",
      exit: "বহির্গমন পথ"
    },
    actions: {
      blockNode: "অবরুদ্ধ করুন",
      unblockNode: "মুক্ত করুন",
      blockEdge: "করিডোর বন্ধ করুন",
      unblockEdge: "করিডোর খুলুন",
      closeExit: "বহির্গমন বন্ধ করুন",
      reopenExit: "বহির্গমন খুলুন"
    },
    tooltip: {
      type: "টাইপ:",
      status: "অবস্থা:",
      active: "সক্রিয়",
      blocked: "অবরুদ্ধ",
      closed: "বন্ধ",
      start: "(শুরু)",
      clickHint: "ক্লিক: নির্বাচন | Shift+ক্লিক/রাইট-ক্লিক: বিপদাবস্থা টগল"
    },
    titles: {
      loadSample: "নমুনা ভবন লোড করুন",
      importJson: "JSON ইম্পোর্ট করুন",
      resetHazards: "প্রাথমিক বিপদাবস্থায় ফিরিয়ে নিন",
      highContrast: "উচ্চ বৈসাদৃশ্য মোড পরিবর্তন করুন",
      themeLight: "লাইট মোডে পরিবর্তন করুন",
      themeDark: "ডার্ক মোডে পরিবর্তন করুন",
      exportPng: "মানচিত্র PNG হিসেবে ডাউনলোড করুন",
      langToggle: "ভাষা পরিবর্তন করুন"
    },
    aria: {
      selectStart: "শুরুর অবস্থান",
      selectHazardElement: "বিপদাবস্থা নিয়ন্ত্রণ করতে উপাদান নির্বাচন করুন",
      closeAlert: "বিজ্ঞপ্তি বন্ধ করুন"
    },
    validationErrors: {
      invalidJSON: "অকার্যকর JSON ফরম্যাট: ফাইল পার্স করা যায়নি।",
      missingRoot: "প্রয়োজনীয় ক্ষেত্র অনুপস্থিত: 'building', 'nodes', 'edges', 'initial_state'।",
      invalidBuilding: "'building' অবশ্যই একটি অ-খালি নাম হতে হবে।",
      nodeLimit: "নোডের সংখ্যা অবশ্যই ২ থেকে ৬০ এর মধ্যে হতে হবে।",
      edgeLimit: "করিডোরের সংখ্যা অবশ্যই ১ থেকে ১৫০ এর মধ্যে হতে হবে।",
      missingStartOrExit: "গ্রাফে অবশ্যই কমপক্ষে একটি কক্ষ/জাংশন এবং একটি বহির্গমন পথ থাকতে হবে।",
      duplicateNodeId: "দ্বৈত নোড আইডি সনাক্ত হয়েছে: '{id}'।",
      invalidNode: "নোড '{id}' সঠিক নয়: আইডি, অ-খালি লেবেল, সংখ্যাবাচক x, y এবং 'room'/'junction'/'exit' টাইপ থাকতে হবে।",
      duplicateEdgeId: "দ্বৈত এজ আইডি সনাক্ত হয়েছে: '{id}'।",
      invalidEdgeNodes: "এজ '{id}' ভুল নোড সংযুক্ত করছে: '{from}' -> '{to}'।",
      selfLoop: "এজ '{id}' একটি সেলফ-লুপ ('{from}')।",
      repeatedPair: "'{u}' এবং '{v}' এর মধ্যে একাধিক করিডোর সংজ্ঞায়িত করা হয়েছে।",
      invalidEdgeCost: "এজ '{id}' এর খরচ অবশ্যই একটি ধনাত্মক পূর্ণসংখ্যা হতে হবে। বর্তমান: {cost}।",
      invalidInitialState: "'initial_state' এ 'blocked_nodes', 'blocked_edges', 'closed_exits' অ্যারে থাকতে হবে।",
      initialStateUnknownId: "initial_state.{category} তে অজানা আইডি '{id}' পাওয়া গেছে।",
      initialStateCategoryMismatch: "initial_state.{category} তে আইডি '{id}' এর ক্যাটাগরি মিলছে না: প্রত্যাশিত {expectedType}, কিন্তু পাওয়া গেছে {actualType}।",
      fileReadError: "ফাইল পড়তে সমস্যা হয়েছে।",
      fetchError: "building.json লোড করা যায়নি।"
    },
    status: {
      ready: "প্রস্তুত। শুরুর স্থান নির্বাচন করুন অথবা বিপদাবস্থা পরিবর্তন করুন।",
      calculating: "নিরাপদ নির্গমন রুট পুনরায় গণনা করা হচ্ছে...",
      resetSuccess: "ভবন প্রাথমিক অবস্থায় পুনর্বহাল করা হয়েছে।",
      importedSuccess: "ভবনের ডাটা সফলভাবে যাচাই ও লোড করা হয়েছে।",
      exportSuccess: "মানচিত্র সফলভাবে এক্সপোর্ট করা হয়েছে।"
    },
    bonus: {
      alternativeRoute: "বিকল্প রুট",
      noAlternative: "কোনো বিকল্প রুট বিদ্যমান নেই।",
      exportPNG: "মানচিত্র PNG হিসেবে ডাউনলোড করুন",
      highContrast: "উচ্চ বৈসাদৃশ্য মোড"
    }
  }
};

let currentLanguage = "en";

export function getLanguage() {
  return currentLanguage;
}

export function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
  }
  return currentLanguage;
}

export function t(keyPath, params = {}) {
  const keys = keyPath.split(".");
  let val = translations[currentLanguage];
  for (const k of keys) {
    if (val && typeof val === "object" && k in val) {
      val = val[k];
    } else {
      val = null;
      break;
    }
  }

  if (val === null || val === undefined) {
    let fallback = translations.en;
    for (const k of keys) {
      if (fallback && typeof fallback === "object" && k in fallback) {
        fallback = fallback[k];
      } else {
        return keyPath;
      }
    }
    val = fallback;
  }

  if (typeof val === "string") {
    return val.replace(/\{(\w+)\}/g, (_, param) => (params[param] !== undefined ? params[param] : `{${param}}`));
  }
  return val;
}
