"use client";

import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TakeoffCategory {
  id: string;
  label: string;
  icon: string;
  items: number;
  materialCost: number;
  laborHours: number;
  source: string;
  difficulty: "trivial" | "moderate" | "hard" | "very-hard";
  toolNeeded: string;
  description: string;
  examples: string[];
}

interface Tool {
  id: string;
  tier: number;
  name: string;
  description: string;
  inputSource: string;
  outputFormat: string;
  impact: string;
  impactPct: number;
  difficulty: "trivial" | "moderate" | "hard" | "very-hard";
  status: "planned" | "research" | "prototype" | "ready";
  dependencies: string[];
  details: string[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const gapMetrics = {
  symbolDetectionAccuracy: 99.1,
  symbolMaterialCoverage: 11,
  symbolLaborCoverage: 23,
  remainingMaterialGap: 89,
  remainingLaborGap: 77,
  totalLineItems: 247,
  symbolLineItems: 27,
  conduitLineItems: 37,
  wireLineItems: 18,
  fittingLineItems: 54,
};

const takeoffCategories: TakeoffCategory[] = [
  {
    id: "A",
    label: "Countable Symbols (Devices)",
    icon: "🔌",
    items: 27,
    materialCost: 6271,
    laborHours: 189,
    source: "E1.x Power Plans, E3.x Lighting Plans",
    difficulty: "trivial",
    toolNeeded: "Symbol Detection (EXISTING - 99.1%)",
    description:
      "Receptacles, switches, sensors, fixtures visible on floor plans. This is what Jerry's eyes already see.",
    examples: [
      "92 Duplex Receptacles @ $23.65 assembly",
      "36 Double Duplex @ $27.75 assembly",
      "4 GFI Weatherproof @ $56.50 assembly",
      "~100 Lighting Fixtures (various types)",
      "Fire alarm devices (strobes, monitors)",
    ],
  },
  {
    id: "B",
    label: "Conduit Runs (EMT/Rigid)",
    icon: "🔩",
    items: 37,
    materialCost: 27602,
    laborHours: 892,
    source: "E1.x Plans + Feeder Schedule + Spatial Measurement",
    difficulty: "very-hard",
    toolNeeded: "Conduit Run Estimator (NEW - Tier 2)",
    description:
      "14,991 LF of conduit across 8 sizes. Requires measuring distances on drawings and understanding routing. The single highest-value tool to build.",
    examples: [
      "7,070 ft 3/4\" EMT @ $0.80/ft — branch circuits above ceiling",
      "2,396 ft 2\" EMT @ $3.15/ft — subfeeders",
      "1,860 ft 2.5\" EMT @ $4.75/ft — main feeders (300ft x 6 runs)",
      "1,978 ft 1/2\" EMT @ $0.45/ft — low voltage, fire alarm",
      "1,157 ft 1.25\" EMT @ $2.15/ft — branch feeders",
    ],
  },
  {
    id: "C",
    label: "Wire & Cable",
    icon: "⚡",
    items: 18,
    materialCost: 66717,
    laborHours: 445,
    source: "Panel Schedules + Conduit Sizing + NEC Tables",
    difficulty: "hard",
    toolNeeded: "Wire Calculator (NEW - Tier 4)",
    description:
      "~50,000+ ft of THHN copper. Wire gauge determined by circuit amperage and conduit fill. Dominated by #350 THHN feeders ($40,500 = 60% of wire cost).",
    examples: [
      "5,400 ft #350 THHN @ $7.50/ft — main feeders ($40,500)",
      "2,640 ft #3/0 THHN @ $3.70/ft — subfeeders ($9,768)",
      "3,500 ft #12 THHN @ $0.20/ft — branch circuits ($700)",
      "920 ft #10 THHN @ $0.28/ft — branch circuits ($258)",
      "690 ft #1/0 THHN @ $2.40/ft — branch feeders ($1,656)",
    ],
  },
  {
    id: "D",
    label: "Fittings & Connectors",
    icon: "🔧",
    items: 54,
    materialCost: 13070,
    laborHours: 96,
    source: "Derived from Conduit Runs (Ratio Formulas)",
    difficulty: "trivial",
    toolNeeded: "Fitting Calculator (NEW - Tier 1)",
    description:
      "Couplings, connectors, elbows, hangers, bushings. Quantities derive directly from conduit footage using standard ratios. Trivial to implement once conduit runs are known.",
    examples: [
      "Couplings (CP) = footage / 10 (every 10ft stick)",
      "Connectors (CN) = 2 per run (entry + exit)",
      "Hangers (H) = footage / 7 (NEC support intervals)",
      "Elbows = based on routing (typically 2-4 per run)",
      "Bushings = 1 per connector on feeders",
    ],
  },
  {
    id: "E",
    label: "Distribution Equipment",
    icon: "⚙️",
    items: 30,
    materialCost: 97331,
    laborHours: 412,
    source: "One-Line Diagram (E7.1) + Panel Schedules (E9.x)",
    difficulty: "hard",
    toolNeeded: "One-Line / Panel Schedule Parser (NEW - Tier 1)",
    description:
      "Switchgear, panels, transformers, disconnects. The APE/Schneider package alone = $97,331 (78% of bare material). Read directly from one-line diagrams and panel schedules.",
    examples: [
      "Switchgear package: $97,331 (vendor quote from APE/Schneider)",
      "Panel boards: 9 panels with strut stanchions @ $150 ea",
      "Strut rack in distribution area: $800",
      "Branch circuit conduit racks: $1,200",
      "Grounding system: ~$3,300 (copper runs)",
    ],
  },
  {
    id: "F",
    label: "Lighting System",
    icon: "💡",
    items: 17,
    materialCost: 6705,
    laborHours: 178,
    source: "E3.x Lighting Plans + Lighting Schedule",
    difficulty: "moderate",
    toolNeeded: "Symbol Classification + Schedule Lookup",
    description:
      "Fixtures, MC cable, sensors, dimmers, time clocks. Symbols on plan, but must cross-reference lighting schedule for fixture types and pricing.",
    examples: [
      "~100 fixtures across multiple types",
      "MC cable for above-ceiling wiring",
      "Occupancy sensors and daylight sensors",
      "Dimming controls and low-voltage wiring",
      "Time clocks for exterior lighting",
    ],
  },
  {
    id: "G",
    label: "Fire Alarm",
    icon: "🔔",
    items: 11,
    materialCost: 11214,
    laborHours: 86,
    source: "Fire Alarm Plans + Subcontractor Quote",
    difficulty: "moderate",
    toolNeeded: "Subcontractor Package Identifier",
    description:
      "Primarily a subcontractor scope ($9,833 from All Star). Jerry needs to identify FA scope boundary and flag for subcontractor pricing.",
    examples: [
      "All Star FA package: $9,833",
      "Monitor modules: $1,500",
      "Smoke detectors, CO detectors (sub scope)",
      "Strobes — ceiling and wall mount",
      "120V power feeds to FA panel (your scope)",
    ],
  },
  {
    id: "H",
    label: "Data / Low Voltage",
    icon: "📡",
    items: 8,
    materialCost: 3298,
    laborHours: 52,
    source: "Data Plans + Spec Section 27",
    difficulty: "moderate",
    toolNeeded: "Symbol Detection + Spec Reader",
    description:
      "Communication cable, conduit for data, pull strings. Often spec-driven scope — Jerry must read Division 27 to understand what's included.",
    examples: [
      "Cat6 cable runs",
      "Data conduit (1/2\" EMT typically)",
      "J-boxes for data routing",
      "Pull strings in empty conduits",
      "Conduit to telecom room",
    ],
  },
  {
    id: "I",
    label: "Support & Infrastructure",
    icon: "🏗️",
    items: 35,
    materialCost: 11619,
    laborHours: 287,
    source: "Experience + NEC Requirements + Site Conditions",
    difficulty: "very-hard",
    toolNeeded: "Experience-Based Estimator (Future AI)",
    description:
      "Strut, hangers, fasteners, concrete anchors, firestopping. Often not on drawings — estimated from experience and site conditions.",
    examples: [
      "Strut channel and fittings for raceway support",
      "Beam clamps and threaded rod",
      "Concrete anchors and expansion bolts",
      "Firestopping at penetrations",
      "Seismic bracing (if required)",
    ],
  },
  {
    id: "J",
    label: "Temporary & Misc",
    icon: "🔨",
    items: 10,
    materialCost: 3840,
    laborHours: 68,
    source: "Project Scope + Site Conditions",
    difficulty: "hard",
    toolNeeded: "Scope Analyzer (Spec Reader)",
    description:
      "Temp power, cord reels, excavation, miscellaneous. Driven by project scope and site conditions rather than drawing symbols.",
    examples: [
      "Temporary power circuits: 4 items",
      "Cord reels (Gross): $1,051",
      "Excavation to outdoor chiller pad: $8,500",
      "Small tools allowance",
      "Consumables (tape, wire nuts, labels)",
    ],
  },
];

const tools: Tool[] = [
  {
    id: "1.1",
    tier: 1,
    name: "One-Line Diagram Parser",
    description:
      "Extract distribution hierarchy from E7.1 one-line diagrams. Identifies switchgear, transformers, panels, feeders, and their relationships.",
    inputSource: "E7.x One-Line Diagram sheets (PDF/image)",
    outputFormat:
      "JSON tree: {switchgear → transformers → panels → circuits} with ratings",
    impact: "Unlocks $97K+ distribution equipment identification",
    impactPct: 38,
    difficulty: "hard",
    status: "research",
    dependencies: ["Vision model fine-tuning"],
    details: [
      "Parse electrical hierarchy (main → sub → branch)",
      "Extract equipment ratings (amps, voltage, phases)",
      "Identify feeder sizes between equipment",
      "Map panel names to schedule references",
      "Flag vendor-quote items vs stock items",
    ],
  },
  {
    id: "1.2",
    tier: 1,
    name: "Panel Schedule Extractor",
    description:
      "Read panel schedule tables from E9.x sheets. Maps every circuit to its breaker size, wire gauge, and connected load.",
    inputSource: "E9.x Panel Schedule sheets (PDF/image/table)",
    outputFormat:
      "JSON: {panel_id, circuits: [{number, breaker, wire, load, description}]}",
    impact: "Drives wire gauge selection and circuit counting",
    impactPct: 22,
    difficulty: "hard",
    status: "research",
    dependencies: ["Table extraction from drawings"],
    details: [
      "OCR structured table data from panel schedules",
      "Map circuit descriptions to device symbols on plans",
      "Extract breaker sizes and wire gauge requirements",
      "Calculate total connected load per panel",
      "Identify spare circuits and future provisions",
    ],
  },
  {
    id: "1.3",
    tier: 1,
    name: "Fitting Ratio Calculator",
    description:
      "Given conduit run specifications, auto-generate all fitting quantities using industry-standard ratios.",
    inputSource: "Conduit run list (size, length, type, routing)",
    outputFormat:
      "BOM: couplings, connectors, elbows, hangers, bushings per run",
    impact: "Eliminates manual fitting count ($13K material)",
    impactPct: 5,
    difficulty: "trivial",
    status: "planned",
    dependencies: ["Conduit Run Estimator output"],
    details: [
      "Couplings = footage / 10 (10ft stick length)",
      "Connectors = 2 per run (entry + exit termination)",
      "Hangers = footage / 7 (NEC 358.30 support intervals)",
      "Elbows = routing complexity factor (2-4 typical per run)",
      "Bushings = 1 per connector on feeders (NEC 300.4)",
    ],
  },
  {
    id: "2.1",
    tier: 2,
    name: "Branch Circuit Run Estimator",
    description:
      "Measure branch circuit conduit distances from device locations to home-run panel. The single highest-value tool to build.",
    inputSource: "E1.x/E3.x floor plans with device locations + panel location",
    outputFormat:
      "Run list: [{from, to, distance_ft, conduit_size, wire_gauge, qty_conductors}]",
    impact: "Largest labor driver — 7,070 ft of 3/4\" EMT alone",
    impactPct: 28,
    difficulty: "very-hard",
    status: "research",
    dependencies: [
      "Symbol Detection",
      "Panel Schedule Extractor",
      "Drawing scale calibration",
    ],
    details: [
      "Locate panel on floor plan (panel tag reference)",
      "Measure path distance from each device to panel",
      "Account for vertical drops (ceiling to device height)",
      "Add routing factors (obstacles, turns, above-ceiling paths)",
      "Group circuits sharing conduit (multi-wire branch circuits)",
      "Apply conduit fill calculations (NEC Chapter 9)",
    ],
  },
  {
    id: "2.2",
    tier: 2,
    name: "Feeder Run Estimator",
    description:
      "Measure feeder conduit distances between distribution equipment. Large conduit with high material and labor cost per foot.",
    inputSource:
      "One-line diagram + equipment locations on plans + riser diagrams",
    outputFormat:
      "Run list: [{from, to, distance_ft, conduit_size, parallel_runs, wire_spec}]",
    impact: "Navitas: 6 x 300ft = 1,800ft of 2.5\" EMT ($8,550 material)",
    impactPct: 15,
    difficulty: "hard",
    status: "research",
    dependencies: ["One-Line Parser", "Drawing scale calibration"],
    details: [
      "Map equipment from one-line to physical locations on plans",
      "Measure routing distance between equipment rooms",
      "Account for parallel run requirements (multiple conduits)",
      "Calculate wire size from equipment ratings + NEC tables",
      "Apply conduit sizing for wire fill (NEC Chapter 9, Table 1)",
      "EMT vs Rigid decision based on spec requirements",
    ],
  },
  {
    id: "3.1",
    tier: 3,
    name: "Symbol-to-Assembly Classifier",
    description:
      "Map detected symbols to M-L Template assembly codes. A receptacle symbol becomes a full assembly with box, device, plate, mud ring, conductors.",
    inputSource: "Detected symbol + legend lookup + spec requirements",
    outputFormat: "Assembly code + component BOM from M-L Template",
    impact: "Converts symbol count → material BOM ($23.65 per duplex assembly)",
    impactPct: 8,
    difficulty: "moderate",
    status: "planned",
    dependencies: ["Symbol Detection", "M-L Template integration"],
    details: [
      "Match symbol to assembly template (D ASSM, DD ASSM, GFI ASM, etc.)",
      "Decompose assembly: box + device + plate + mud ring + conductors + conduit",
      "Apply spec modifiers (e.g., stainless steel plates, isolated ground)",
      "Handle mounting type variations (flush, surface, weatherproof)",
      "Cross-reference with spec for approved manufacturers",
    ],
  },
  {
    id: "3.3",
    tier: 3,
    name: "Spec-Driven Adjustment Engine",
    description:
      "Read Division 26 specs to identify conduit type requirements, approved materials, and special installation conditions that affect pricing.",
    inputSource: "Specification PDFs (Division 26, 27, 28)",
    outputFormat:
      "Adjustment rules: {conduit_type, approved_mfrs, special_conditions}",
    impact:
      "Navitas: EMT→Rigid upgrade = $82,293 cost delta on spec interpretation alone",
    impactPct: 12,
    difficulty: "very-hard",
    status: "research",
    dependencies: ["Spec Analyzer training (currently F grade → need B+)"],
    details: [
      "Section 26 0533: conduit type requirements (EMT vs Rigid vs PVC)",
      "Section 26 0519: wire and cable specifications",
      "Section 26 0526: grounding and bonding requirements",
      "Approved manufacturer lists affecting pricing",
      "Special installation conditions (cleanroom, hazardous, wet)",
      "Coordination requirements with other divisions",
    ],
  },
  {
    id: "4.1",
    tier: 4,
    name: "Wire Pull Calculator",
    description:
      "Calculate exact wire quantities per circuit based on conduit runs, conductor count, and NEC requirements.",
    inputSource:
      "Conduit run list + panel schedules + NEC derating tables",
    outputFormat:
      "Wire BOM: [{gauge, type, footage, conduit_id, circuit_ids}]",
    impact: "Wire = $66,717 material (53% of built-system cost)",
    impactPct: 26,
    difficulty: "hard",
    status: "planned",
    dependencies: [
      "Branch Circuit Run Estimator",
      "Feeder Run Estimator",
      "Panel Schedule Extractor",
    ],
    details: [
      "Wire footage = conduit run length × number of conductors",
      "Add 10% for terminations and waste",
      "Apply NEC derating for conduit fill and ambient temperature",
      "Calculate ground wire requirements per NEC 250",
      "Group by gauge for purchasing (bulk pricing breaks)",
      "Account for home-run vs shared conduit wire counts",
    ],
  },
];

const buildOrder = [
  {
    phase: "Phase 1: Foundation",
    color: "green",
    tools: ["1.3", "1.2", "1.1"],
    rationale:
      "Fitting calculator is trivial once conduit data exists. Panel schedules and one-line diagrams are structured data — parseable with current vision models.",
  },
  {
    phase: "Phase 2: Spatial Intelligence",
    color: "blue",
    tools: ["2.2", "2.1"],
    rationale:
      "Feeder runs are fewer and simpler (equipment-to-equipment). Branch circuits are the hardest — device-to-panel across floor plans with routing logic.",
  },
  {
    phase: "Phase 3: Assembly & Classification",
    color: "purple",
    tools: ["3.1", "3.3"],
    rationale:
      "Symbol-to-assembly mapping requires the M-L Template integration. Spec reading requires Spec Analyzer to reach B+ grade.",
  },
  {
    phase: "Phase 4: Derived Calculations",
    color: "amber",
    tools: ["4.1"],
    rationale:
      "Wire quantities are fully derived from conduit runs + panel schedules. This tool becomes almost automatic once Phase 1-2 tools work.",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDifficultyColor(d: string) {
  switch (d) {
    case "trivial":
      return {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-300",
        bar: "bg-green-500",
        pct: 15,
      };
    case "moderate":
      return {
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-300",
        bar: "bg-blue-500",
        pct: 40,
      };
    case "hard":
      return {
        bg: "bg-orange-100",
        text: "text-orange-700",
        border: "border-orange-300",
        bar: "bg-orange-500",
        pct: 70,
      };
    case "very-hard":
      return {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-300",
        bar: "bg-red-500",
        pct: 95,
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-300",
        bar: "bg-gray-500",
        pct: 50,
      };
  }
}

function getStatusColor(s: string) {
  switch (s) {
    case "ready":
      return { bg: "bg-green-100", text: "text-green-700" };
    case "prototype":
      return { bg: "bg-blue-100", text: "text-blue-700" };
    case "research":
      return { bg: "bg-amber-100", text: "text-amber-700" };
    case "planned":
      return { bg: "bg-gray-100", text: "text-gray-600" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-600" };
  }
}

function formatCost(n: number) {
  return "$" + n.toLocaleString();
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TakeoffPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showNavitas, setShowNavitas] = useState(false);

  const totalMaterial = takeoffCategories.reduce(
    (s, c) => s + c.materialCost,
    0
  );
  const totalLabor = takeoffCategories.reduce((s, c) => s + c.laborHours, 0);

  return (
    <div className="space-y-6">
      {/* ── Hero Banner ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-red-700 via-orange-600 to-amber-500 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="text-5xl">🎯</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">
              The Takeoff Gap: What Jerry&apos;s Eyes Can&apos;t See Yet
            </h2>
            <p className="text-white/90 text-lg mb-4">
              99.1% symbol detection sounds impressive — but symbols represent
              only <span className="font-bold text-yellow-200">11%</span> of
              material cost and{" "}
              <span className="font-bold text-yellow-200">23%</span> of labor
              hours. The remaining 89% requires spatial reasoning, cross-document
              inference, and estimator experience.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/15 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">99.1%</div>
                <div className="text-sm text-white/80">Symbol Accuracy</div>
              </div>
              <div className="bg-white/15 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-200">11%</div>
                <div className="text-sm text-white/80">Material Covered</div>
              </div>
              <div className="bg-white/15 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-200">23%</div>
                <div className="text-sm text-white/80">Labor Covered</div>
              </div>
              <div className="bg-white/15 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-200">8 Tools</div>
                <div className="text-sm text-white/80">Need to Build</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── The Gap Visualization ────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          What Symbol Detection Actually Covers
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">
                Material Cost Coverage
              </span>
              <span className="text-gray-500">
                {formatCost(6271)} of {formatCost(totalMaterial)} (
                {Math.round((6271 / totalMaterial) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
              <div
                className="bg-green-500 h-full rounded-l-full flex items-center justify-end pr-2 text-xs font-bold text-white"
                style={{
                  width: `${Math.max((6271 / totalMaterial) * 100, 5)}%`,
                }}
              >
                Symbols
              </div>
            </div>
            <div className="flex mt-1 text-xs text-gray-500 gap-4">
              <span>
                <span className="inline-block w-3 h-3 bg-green-500 rounded mr-1" />
                Devices (counted from drawings)
              </span>
              <span>
                <span className="inline-block w-3 h-3 bg-gray-200 rounded mr-1" />
                Everything else (conduit, wire, fittings, distribution,
                supports...)
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">
                Labor Hours Coverage
              </span>
              <span className="text-gray-500">
                {189} of {totalLabor} hours ({Math.round((189 / totalLabor) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-l-full flex items-center justify-end pr-2 text-xs font-bold text-white"
                style={{
                  width: `${Math.max((189 / totalLabor) * 100, 5)}%`,
                }}
              >
                Symbols
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-red-800 font-medium">
              Bottom line: Without conduit run estimation, wire calculation, and
              distribution equipment parsing, Jerry can count the outlets on the
              wall but has no idea what connects them. That&apos;s like knowing a
              house has 10 rooms but not knowing where the hallways go.
            </p>
          </div>
        </div>
      </div>

      {/* ── Navitas Reference ────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <button
          onClick={() => setShowNavitas(!showNavitas)}
          className="w-full bg-gradient-to-r from-slate-700 to-slate-600 p-4 text-white text-left flex items-center justify-between hover:from-slate-600 hover:to-slate-500 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏭</span>
            <div>
              <div className="font-bold">
                Reference Project: Navitas Ann Arbor — Hodess Building Co.
              </div>
              <div className="text-sm text-white/80">
                $673,160 base bid | 14,000 SF cleanroom | 3,077 labor hours |
                247 takeoff line items
              </div>
            </div>
          </div>
          <span className="text-xl">{showNavitas ? "▲" : "▼"}</span>
        </button>
        {showNavitas && (
          <div className="p-6 space-y-4">
            <p className="text-gray-700">
              All data on this page is derived from the lead estimator&apos;s actual Navitas
              bid — a complete real-world electrical estimate with full
              documentation. This project serves as the benchmark for what
              Jerry&apos;s takeoff tools must be able to produce.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Project Scope</div>
                <div className="font-medium">
                  Navitas Systems cleanroom (ISO 7/8) for battery R&D
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  14,000 SF | Hodess Building Co. (GC)
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">
                  Bid Package Files
                </div>
                <ul className="text-sm space-y-1">
                  <li>
                    <span className="font-mono text-gray-600">
                      BID SET DRAWINGS
                    </span>{" "}
                    — 63 pages
                  </li>
                  <li>
                    <span className="font-mono text-gray-600">ADDENDUM1</span>{" "}
                    — 36 pages
                  </li>
                  <li>
                    <span className="font-mono text-gray-600">
                      EMT vs RIGID .xlsx
                    </span>{" "}
                    — 12+ sheets
                  </li>
                  <li>
                    <span className="font-mono text-gray-600">Specs</span> — 40
                    PDFs (Div 21-26)
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Key Metrics</div>
                <ul className="text-sm space-y-1">
                  <li>
                    $48.22/SF | IBEW LU 252 rates
                  </li>
                  <li>
                    3,077 total labor hours
                  </li>
                  <li>
                    14%/6% OH&P markup structure
                  </li>
                  <li>
                    EMT vs Rigid delta: $82,293
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 10 Takeoff Categories ────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-700 to-blue-600 p-4 text-white">
          <h3 className="text-lg font-bold">
            The 10 Categories of a Complete Electrical Takeoff
          </h3>
          <p className="text-sm text-white/80 mt-1">
            Based on Navitas BASE DETAIL — {gapMetrics.totalLineItems} line
            items across {takeoffCategories.length} categories. Click any
            category for details.
          </p>
        </div>

        {/* Summary Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600">
                  Category
                </th>
                <th className="text-right p-3 font-medium text-gray-600">
                  Items
                </th>
                <th className="text-right p-3 font-medium text-gray-600">
                  Material
                </th>
                <th className="text-right p-3 font-medium text-gray-600">
                  Labor (hrs)
                </th>
                <th className="text-left p-3 font-medium text-gray-600">
                  Difficulty
                </th>
                <th className="text-left p-3 font-medium text-gray-600">
                  Tool Needed
                </th>
              </tr>
            </thead>
            <tbody>
              {takeoffCategories.map((cat, idx) => {
                const dc = getDifficultyColor(cat.difficulty);
                const isSelected = selectedCategory === cat.id;
                return (
                  <>
                    <tr
                      key={cat.id}
                      onClick={() =>
                        setSelectedCategory(isSelected ? null : cat.id)
                      }
                      className={`cursor-pointer transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      } hover:bg-blue-50 ${
                        isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
                      }`}
                    >
                      <td className="p-3">
                        <span className="mr-2">{cat.icon}</span>
                        <span className="font-medium">{cat.label}</span>
                      </td>
                      <td className="p-3 text-right font-mono">{cat.items}</td>
                      <td className="p-3 text-right font-mono">
                        {formatCost(cat.materialCost)}
                      </td>
                      <td className="p-3 text-right font-mono">
                        {cat.laborHours}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${dc.bg} ${dc.text}`}
                        >
                          {cat.difficulty}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gray-600">
                        {cat.toolNeeded}
                      </td>
                    </tr>
                    {isSelected && (
                      <tr key={`${cat.id}-detail`}>
                        <td colSpan={6} className="p-0">
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 m-2 rounded">
                            <p className="text-gray-700 mb-3">
                              {cat.description}
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm font-medium text-gray-600 mb-1">
                                  Drawing Source
                                </div>
                                <div className="text-sm font-mono bg-white rounded p-2 border">
                                  {cat.source}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-600 mb-1">
                                  Navitas Examples
                                </div>
                                <ul className="text-sm space-y-1">
                                  {cat.examples.map((ex, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <span className="text-blue-500 mt-0.5">
                                        &bull;
                                      </span>
                                      <span className="font-mono text-gray-700">
                                        {ex}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                Cost share:
                              </span>
                              <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                  className="bg-indigo-500 h-full rounded-full"
                                  style={{
                                    width: `${(cat.materialCost / totalMaterial) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {Math.round(
                                  (cat.materialCost / totalMaterial) * 100
                                )}
                                %
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              <tr className="bg-gray-100 font-bold">
                <td className="p-3">TOTAL</td>
                <td className="p-3 text-right font-mono">
                  {gapMetrics.totalLineItems}
                </td>
                <td className="p-3 text-right font-mono">
                  {formatCost(totalMaterial)}
                </td>
                <td className="p-3 text-right font-mono">{totalLabor}</td>
                <td colSpan={2}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Cost Distribution Chart ──────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Where the Money Goes (Navitas Material Cost Distribution)
        </h3>
        <div className="space-y-2">
          {takeoffCategories
            .sort((a, b) => b.materialCost - a.materialCost)
            .map((cat) => {
              const pct = (cat.materialCost / totalMaterial) * 100;
              const dc = getDifficultyColor(cat.difficulty);
              return (
                <div key={cat.id} className="flex items-center gap-3">
                  <div className="w-48 text-sm text-gray-700 truncate flex items-center gap-1">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className={`${dc.bar} h-full rounded-full flex items-center pl-2`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    >
                      {pct > 8 && (
                        <span className="text-xs font-bold text-white">
                          {formatCost(cat.materialCost)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm font-mono text-gray-600">
                    {pct.toFixed(1)}%
                  </div>
                </div>
              );
            })}
        </div>
        <div className="mt-4 flex gap-4 text-xs text-gray-500">
          <span>
            <span className="inline-block w-3 h-3 bg-green-500 rounded mr-1" />
            Trivial
          </span>
          <span>
            <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-1" />
            Moderate
          </span>
          <span>
            <span className="inline-block w-3 h-3 bg-orange-500 rounded mr-1" />
            Hard
          </span>
          <span>
            <span className="inline-block w-3 h-3 bg-red-500 rounded mr-1" />
            Very Hard
          </span>
        </div>
      </div>

      {/* ── The 8 Tools to Build ─────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-fuchsia-600 p-4 text-white">
          <h3 className="text-lg font-bold">
            8 Tools to Build: Jerry&apos;s Takeoff Toolkit
          </h3>
          <p className="text-sm text-white/80 mt-1">
            Organized by build tier. Each tool unlocks a category of takeoff data
            that Jerry currently cannot extract. Click any tool for technical
            details.
          </p>
        </div>

        {buildOrder.map((phase) => (
          <div key={phase.phase} className="border-b border-gray-100 last:border-b-0">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-800">{phase.phase}</h4>
                <span className="text-xs text-gray-500">
                  {phase.rationale}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {phase.tools.map((toolId) => {
                const tool = tools.find((t) => t.id === toolId)!;
                const dc = getDifficultyColor(tool.difficulty);
                const sc = getStatusColor(tool.status);
                const isSelected = selectedTool === tool.id;
                return (
                  <div key={tool.id}>
                    <button
                      onClick={() =>
                        setSelectedTool(isSelected ? null : tool.id)
                      }
                      className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-mono text-gray-400">
                              [{tool.id}]
                            </span>
                            <span className="font-bold text-gray-900">
                              {tool.name}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${dc.bg} ${dc.text}`}
                            >
                              {tool.difficulty}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}
                            >
                              {tool.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {tool.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold text-purple-600">
                            {tool.impactPct}%
                          </div>
                          <div className="text-xs text-gray-500">
                            cost impact
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full"
                            style={{ width: `${tool.impactPct}%` }}
                          />
                        </div>
                      </div>
                    </button>
                    {isSelected && (
                      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mx-4 mb-4 rounded">
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm font-medium text-gray-600 mb-1">
                              Input Source
                            </div>
                            <div className="text-sm font-mono bg-white rounded p-2 border">
                              {tool.inputSource}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-600 mb-1">
                              Output Format
                            </div>
                            <div className="text-sm font-mono bg-white rounded p-2 border">
                              {tool.outputFormat}
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-600 mb-1">
                            Impact
                          </div>
                          <div className="text-sm bg-white rounded p-2 border text-gray-700">
                            {tool.impact}
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-600 mb-1">
                            Technical Requirements
                          </div>
                          <ul className="text-sm space-y-1">
                            {tool.details.map((d, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-purple-500 mt-0.5">
                                  &bull;
                                </span>
                                <span className="text-gray-700">{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {tool.dependencies.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-gray-600 mb-1">
                              Dependencies
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {tool.dependencies.map((dep) => (
                                <span
                                  key={dep}
                                  className="px-2 py-1 bg-white border rounded text-xs font-mono text-gray-600"
                                >
                                  {dep}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Recommended Build Order ──────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Recommended Build Sequence
        </h3>
        <div className="relative">
          {/* Timeline */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-6">
            {[
              {
                id: "1.3",
                label: "Fitting Ratio Calculator",
                why: "Trivial math — couplings = ft/10, connectors = 2/run, hangers = ft/7. Can ship in a day.",
                unlocks: "$13K fittings category",
                difficulty: "trivial" as const,
              },
              {
                id: "1.2",
                label: "Panel Schedule Extractor",
                why: "Structured table data — OCR-friendly. Drives wire gauge selection for every circuit.",
                unlocks: "Circuit-to-wire mapping, load calculations",
                difficulty: "hard" as const,
              },
              {
                id: "1.1",
                label: "One-Line Diagram Parser",
                why: "Distribution hierarchy is the skeleton. Identifies $97K in switchgear/equipment.",
                unlocks: "Equipment list, feeder sizing, vendor quote triggers",
                difficulty: "hard" as const,
              },
              {
                id: "3.1",
                label: "Symbol-to-Assembly Classifier",
                why: "Maps detected symbols to M-L Template assemblies. A 'receptacle' becomes $23.65 of components.",
                unlocks: "Accurate device BOM pricing",
                difficulty: "moderate" as const,
              },
              {
                id: "2.2",
                label: "Feeder Run Estimator",
                why: "Fewer runs but high cost per foot. Equipment-to-equipment — simpler spatial problem.",
                unlocks: "Main feeder conduit + wire (Navitas: 1,800 ft 2.5\" EMT)",
                difficulty: "hard" as const,
              },
              {
                id: "2.1",
                label: "Branch Circuit Run Estimator",
                why: "The hardest and highest-value tool. Device-to-panel distance across floor plans.",
                unlocks: "7,070 ft branch conduit + all branch circuit wire",
                difficulty: "very-hard" as const,
              },
              {
                id: "4.1",
                label: "Wire Pull Calculator",
                why: "Derived from conduit runs + panel schedules. Almost automatic once upstream tools work.",
                unlocks: "$66,717 wire category (53% of built-system cost)",
                difficulty: "hard" as const,
              },
              {
                id: "3.3",
                label: "Spec-Driven Adjustment Engine",
                why: "Needs Spec Analyzer at B+ grade. EMT vs Rigid = $82K decision on one spec section.",
                unlocks: "Material type overrides, manufacturer restrictions",
                difficulty: "very-hard" as const,
              },
            ].map((step, idx) => {
              const dc = getDifficultyColor(step.difficulty);
              return (
                <div key={step.id} className="relative flex items-start gap-4 pl-12">
                  <div
                    className={`absolute left-4 w-5 h-5 rounded-full ${dc.bar} border-2 border-white shadow flex items-center justify-center`}
                  >
                    <span className="text-white text-xs font-bold">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-gray-400">
                        [{step.id}]
                      </span>
                      <span className="font-bold text-gray-900">
                        {step.label}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${dc.bg} ${dc.text}`}
                      >
                        {step.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{step.why}</p>
                    <p className="text-sm">
                      <span className="font-medium text-purple-700">
                        Unlocks:
                      </span>{" "}
                      <span className="text-gray-700">{step.unlocks}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Key Insight: Assembly Decomposition ──────────────────────── */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Why Symbol Count ≠ Material Count
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          A single symbol on a drawing decomposes into multiple line items in the
          estimate. This is why the M-L Template has 1,187 rows for a vocabulary
          of a few hundred symbols.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <div className="text-center mb-3">
              <div className="text-3xl mb-1">⬡</div>
              <div className="font-bold text-gray-800">
                Duplex Receptacle (D ASSM)
              </div>
              <div className="text-lg font-mono text-green-600">$23.65</div>
            </div>
            <div className="text-sm space-y-1 border-t pt-2">
              <div className="flex justify-between">
                <span>4S Box</span>
                <span className="font-mono text-gray-500">$2.50</span>
              </div>
              <div className="flex justify-between">
                <span>Mud Ring</span>
                <span className="font-mono text-gray-500">$1.25</span>
              </div>
              <div className="flex justify-between">
                <span>Device</span>
                <span className="font-mono text-gray-500">$3.50</span>
              </div>
              <div className="flex justify-between">
                <span>Cover Plate</span>
                <span className="font-mono text-gray-500">$0.90</span>
              </div>
              <div className="flex justify-between">
                <span>Conductors (3x 8ft)</span>
                <span className="font-mono text-gray-500">$4.80</span>
              </div>
              <div className="flex justify-between">
                <span>Conduit stub (6ft)</span>
                <span className="font-mono text-gray-500">$2.70</span>
              </div>
              <div className="flex justify-between">
                <span>Fittings</span>
                <span className="font-mono text-gray-500">$1.50</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1">
                <span>Labor</span>
                <span className="font-mono text-blue-600">0.45 hr</span>
              </div>
            </div>
          </div>

          <div className="border-2 border-gray-200 rounded-lg p-4">
            <div className="text-center mb-3">
              <div className="text-3xl mb-1">⬡⬡</div>
              <div className="font-bold text-gray-800">
                Double Duplex (DD ASSM)
              </div>
              <div className="text-lg font-mono text-green-600">$27.75</div>
            </div>
            <div className="text-sm space-y-1 border-t pt-2">
              <div className="flex justify-between">
                <span>4S Box (deep)</span>
                <span className="font-mono text-gray-500">$3.25</span>
              </div>
              <div className="flex justify-between">
                <span>Mud Ring (2-gang)</span>
                <span className="font-mono text-gray-500">$1.75</span>
              </div>
              <div className="flex justify-between">
                <span>Devices (2x)</span>
                <span className="font-mono text-gray-500">$7.00</span>
              </div>
              <div className="flex justify-between">
                <span>Cover Plate (2-gang)</span>
                <span className="font-mono text-gray-500">$1.50</span>
              </div>
              <div className="flex justify-between">
                <span>Conductors (4x 8ft)</span>
                <span className="font-mono text-gray-500">$6.40</span>
              </div>
              <div className="flex justify-between">
                <span>Conduit stub (6ft)</span>
                <span className="font-mono text-gray-500">$2.70</span>
              </div>
              <div className="flex justify-between">
                <span>Fittings</span>
                <span className="font-mono text-gray-500">$1.65</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1">
                <span>Labor</span>
                <span className="font-mono text-blue-600">0.55 hr</span>
              </div>
            </div>
          </div>

          <div className="border-2 border-gray-200 rounded-lg p-4">
            <div className="text-center mb-3">
              <div className="text-3xl mb-1">⬡💧</div>
              <div className="font-bold text-gray-800">
                GFI Weatherproof (GFI WP ASM)
              </div>
              <div className="text-lg font-mono text-green-600">$56.50</div>
            </div>
            <div className="text-sm space-y-1 border-t pt-2">
              <div className="flex justify-between">
                <span>FS Box (cast)</span>
                <span className="font-mono text-gray-500">$8.50</span>
              </div>
              <div className="flex justify-between">
                <span>WP Cover (in-use)</span>
                <span className="font-mono text-gray-500">$12.00</span>
              </div>
              <div className="flex justify-between">
                <span>GFI Device</span>
                <span className="font-mono text-gray-500">$18.50</span>
              </div>
              <div className="flex justify-between">
                <span>Conductors (3x 8ft)</span>
                <span className="font-mono text-gray-500">$4.80</span>
              </div>
              <div className="flex justify-between">
                <span>Conduit stub (8ft)</span>
                <span className="font-mono text-gray-500">$5.20</span>
              </div>
              <div className="flex justify-between">
                <span>Fittings + sealant</span>
                <span className="font-mono text-gray-500">$3.50</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1">
                <span>Labor</span>
                <span className="font-mono text-blue-600">0.75 hr</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            <span className="font-bold">Key insight:</span> The symbol detection
            system sees 1 receptacle. The estimate needs 7+ line items for that
            same receptacle. Tool [3.1] Symbol-to-Assembly Classifier bridges
            this gap using the M-L Template&apos;s 1,187-row assembly database.
          </p>
        </div>
      </div>

      {/* ── Conduit: The Hardest Problem ─────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          The Hardest Problem: Conduit Run Estimation
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Conduit is the single largest built-system cost driver. Unlike symbols
          (count what you see), conduit requires measuring distances, understanding
          routing paths, and applying NEC code requirements.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-gray-800 mb-2">
              Navitas Conduit Profile
            </h4>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Size</th>
                  <th className="text-right p-2">Footage</th>
                  <th className="text-right p-2">$/ft</th>
                  <th className="text-right p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { size: '3/4" EMT', ft: 7070, price: 0.8 },
                  { size: '2" EMT', ft: 2396, price: 3.15 },
                  { size: '1/2" EMT', ft: 1978, price: 0.55 },
                  { size: '2.5" EMT', ft: 1860, price: 4.75 },
                  { size: '1.25" EMT', ft: 1157, price: 2.15 },
                  { size: '1" EMT', ft: 440, price: 1.3 },
                  { size: '3" EMT', ft: 96, price: 5.9 },
                  { size: '1.5" EMT', ft: 94, price: 2.65 },
                ].map((row, idx) => (
                  <tr
                    key={row.size}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                  >
                    <td className="p-2 font-mono">{row.size}</td>
                    <td className="p-2 text-right font-mono">
                      {row.ft.toLocaleString()}
                    </td>
                    <td className="p-2 text-right font-mono">
                      ${row.price.toFixed(2)}
                    </td>
                    <td className="p-2 text-right font-mono">
                      ${Math.round(row.ft * row.price).toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td className="p-2">TOTAL</td>
                  <td className="p-2 text-right font-mono">15,091</td>
                  <td className="p-2 text-right">avg</td>
                  <td className="p-2 text-right font-mono">$27,602</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h4 className="font-bold text-gray-800 mb-2">
              Why It&apos;s Hard
            </h4>
            <div className="space-y-3">
              <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r">
                <div className="font-medium text-red-800 text-sm">
                  Spatial Measurement
                </div>
                <p className="text-xs text-red-700">
                  Must measure actual distances on scaled floor plans between
                  devices and panels. Requires drawing scale calibration.
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r">
                <div className="font-medium text-red-800 text-sm">
                  Routing Logic
                </div>
                <p className="text-xs text-red-700">
                  Conduit doesn&apos;t go in straight lines. Must route above
                  ceilings, around obstacles, through walls, and follow
                  NEC-compliant paths.
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r">
                <div className="font-medium text-red-800 text-sm">
                  Vertical Runs
                </div>
                <p className="text-xs text-red-700">
                  Floor plans are 2D. Must estimate vertical drops from
                  above-ceiling raceway to device mounting height (typically 18&quot;
                  for receptacles, 48&quot; for switches).
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r">
                <div className="font-medium text-red-800 text-sm">
                  Conduit Fill
                </div>
                <p className="text-xs text-red-700">
                  Size determined by wire count and gauge per NEC Chapter 9.
                  Multiple circuits may share conduit, affecting size selection.
                </p>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r">
                <div className="font-medium text-amber-800 text-sm">
                  EMT vs Rigid Decision
                </div>
                <p className="text-xs text-amber-700">
                  Spec-driven. Navitas: Section 26 0533 interpretation = $82,293
                  cost delta. The spec reader must work for this tool to price
                  correctly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dependencies & Integration ───────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Tool Dependencies & Data Flow
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <pre className="text-gray-700 whitespace-pre">
{`  ┌─────────────────┐
  │  DRAWINGS (PDF)  │
  └────────┬────────┘
           │
     ┌─────┴──────────────────────────────────┐
     │                                         │
     ▼                                         ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ [EXISTING]   │  │ [1.1] One-   │  │ [1.2] Panel  │
│ Symbol       │  │ Line Diagram │  │ Schedule     │
│ Detection    │  │ Parser       │  │ Extractor    │
│ (99.1%)      │  │              │  │              │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       ▼                 │                  │
┌──────────────┐         │                  │
│ [3.1] Symbol │         │                  │
│ →Assembly    │         │                  │
│ Classifier   │         │                  │
└──────┬───────┘         │                  │
       │                 ▼                  ▼
       │          ┌──────────────┐  ┌──────────────┐
       │          │ [2.2] Feeder │  │ [2.1] Branch │
       │          │ Run          │  │ Circuit Run  │
       │          │ Estimator    │  │ Estimator    │
       │          └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       │                 └────────┬─────────┘
       │                         │
       │                         ▼
       │                  ┌──────────────┐
       │                  │ [1.3] Fitting│
       │                  │ Ratio Calc   │
       │                  └──────┬───────┘
       │                         │
       └─────────┬───────────────┘
                 │
                 ▼
          ┌──────────────┐    ┌──────────────┐
          │ [4.1] Wire   │    │ [3.3] Spec   │
          │ Pull Calc    │    │ Adjustments  │
          └──────┬───────┘    └──────┬───────┘
                 │                    │
                 └────────┬───────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │  COMPLETE BOM   │
                 │  + LABOR HOURS  │
                 │  → M-L Template │
                 └─────────────────┘`}
          </pre>
        </div>
      </div>

      {/* ── Next Steps ───────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-green-700 to-teal-600 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-4">
          Immediate Actions for Tooling Team
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/15 rounded-lg p-4">
            <h4 className="font-bold mb-2">Start Now</h4>
            <ul className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-200 font-bold">1.</span>
                <span>
                  <span className="font-bold">Fitting Ratio Calculator</span> —
                  Pure math, no ML needed. Ship immediately.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-200 font-bold">2.</span>
                <span>
                  <span className="font-bold">
                    Panel Schedule Extractor prototype
                  </span>{" "}
                  — Use Navitas E9.x sheets as test data. Table OCR problem.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-200 font-bold">3.</span>
                <span>
                  <span className="font-bold">One-Line Diagram Parser prototype</span>{" "}
                  — Use Navitas E7.1 sheet. Hierarchical graph extraction.
                </span>
              </li>
            </ul>
          </div>
          <div className="bg-white/15 rounded-lg p-4">
            <h4 className="font-bold mb-2">Research Phase</h4>
            <ul className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-yellow-200 font-bold">4.</span>
                <span>
                  <span className="font-bold">Drawing scale calibration</span>{" "}
                  — Required before any distance measurement. Find scale markers
                  on title blocks.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-200 font-bold">5.</span>
                <span>
                  <span className="font-bold">
                    Branch circuit routing algorithm
                  </span>{" "}
                  — The core spatial reasoning challenge. May need pathfinding
                  approach.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-200 font-bold">6.</span>
                <span>
                  <span className="font-bold">
                    M-L Template integration API
                  </span>{" "}
                  — Assembly lookup service for symbol → component BOM mapping.
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-4 bg-white/10 rounded-lg p-3">
          <p className="text-sm">
            <span className="font-bold">Reference data available:</span> The
            complete Navitas bid package in{" "}
            <span className="font-mono">
              /data/sample-projects/ESTIMATOR/HODESS NAVITAS/
            </span>{" "}
            contains drawings, specs, and the lead estimator&apos;s finished estimate for
            end-to-end validation of every tool output.
          </p>
        </div>
      </div>
    </div>
  );
}
