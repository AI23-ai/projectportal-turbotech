"use client";

import { useState } from "react";

interface WorkflowStep {
  step: number;
  name: string;
  mikeholt: string;
  description: string;
  status: "production" | "training" | "ready" | "partial" | "planned";
  statusLabel: string;
  accuracy?: string;
  examples: number;
  details: string;
  navitasEvidence: string[];
  navitasFiles: string[];
  coverage: "full" | "partial" | "missing";
  coverageNote: string;
  gapNote?: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: 1,
    name: "Scope Understanding",
    mikeholt: "The estimator must understand the work to be completed according to the drawings and specifications.",
    description: "Review all specs, create completion checklist, understand scope boundaries",
    status: "training",
    statusLabel: "F Grade (35%)",
    examples: 80,
    details: "80 spec analyzer examples across 5 training versions. Detects prohibitions and cost drivers but misses communications conduit rules, sizing requirements, and coordination requirements.",
    navitasEvidence: [
      "17 Division 26 electrical spec sections covering general requirements, raceways, conductors, grounding, panels, transformers, wiring devices",
      "Div 22/23 cross-reference specs (heat tracing, motors, controls) requiring electrical coordination",
      "Proposal exclusions list proves scope boundary decisions: VESDA, data cabling, temp control, heat trace",
      "ISO 7/8 cleanroom requirements in 26 0000 create hidden scope (sealing, gasketed covers)",
    ],
    navitasFiles: ["Specification_07242025/ (17 Div 26 PDFs)", "NAVITAS ANN ARBOR REV 11.7.2025.pdf (exclusions list)"],
    coverage: "full",
    coverageNote: "Specs fully present. The $82K EMT vs Rigid decision originates here — Section 26 0533 defines raceway types by location.",
    gapNote: "Jerry scores 35% (F) on spec detection. Missing: communications conduit rules, minimum sizing, coordination clearances. Each miss = $5K-$50K cost impact.",
  },
  {
    step: 2,
    name: "Take-Off",
    mikeholt: "Mentally visualize the installation while counting and measuring symbols on drawings.",
    description: "Systematic counting and measuring from electrical drawings, sheet by sheet",
    status: "production",
    statusLabel: "99.1% Accuracy",
    accuracy: "99.1%",
    examples: 819,
    details: "124 symbol types, Florence-2 fine-tuned vision model, production-ready. Takeoff output feeds directly into BOM and pricing steps.",
    navitasEvidence: [
      "63-page bid set: E0.1 symbols, E1.0-E1.8 power/lighting plans, E2.0-E2.1 one-line diagrams, E3.0 panel schedules",
      "36-page Addendum 1 with revised E-sheets (must be incorporated)",
      "The estimator's BASE DETAIL sheet shows the takeoff output: 247 rows of counted/measured items",
      "Cross-discipline takeoff: mechanical equipment from M-series sheets requiring power connections (66 FFUs, DHUs, ACCUs, exhaust fans)",
    ],
    navitasFiles: ["BID SET DRAWINGS.pdf (63 pages)", "ADDENDUM1 ELECTRICAL DRAWINGS.pdf (36 pages)"],
    coverage: "full",
    coverageNote: "Complete drawing set with all E-series sheets. Addendum tracking is critical — one missed addendum change can blow the bid.",
  },
  {
    step: 3,
    name: "Bill of Materials",
    mikeholt: "Transform take-off data into a comprehensive material list.",
    description: "Expand each takeoff item into its component materials (conduit + connectors + couplings + hangers + wire)",
    status: "partial",
    statusLabel: "11 Examples",
    examples: 11,
    details: "The M-L Template (1,187 rows) IS the BOM engine — it defines how each assembly decomposes into components. Training data is thin at only 11 examples.",
    navitasEvidence: [
      "M-L TEMPLATE sheet: 1,187 rows mapping every electrical assembly to component parts with unit prices and labor hours",
      "BASE DETAIL: Each takeoff item expanded — e.g., a 3/4\" EMT branch circuit becomes: pipe + compression connectors + compression couplings + conduit hangers + wire (THHN by gauge)",
      "Waste factors applied to wire (10%) and fittings (5%)",
      "Assembly concept: a 'receptacle' on the drawing becomes box + device + plate + mud ring + conductors + conduit in the BOM",
    ],
    navitasFiles: ["NAVITAS EMT vs RIGID.xlsx → M-L TEMPLATE (1,187 items)", "NAVITAS EMT vs RIGID.xlsx → BASE DETAIL (247 rows)"],
    coverage: "full",
    coverageNote: "The M-L Template is the most complete BOM reference in the client's system. Shows exactly how takeoff quantities decompose into purchasable materials.",
    gapNote: "Weakest training coverage at 11 examples. The M-L Template data exists but Jerry hasn't been trained on the decomposition process.",
  },
  {
    step: 4,
    name: "Pricing & Labor",
    mikeholt: "Obtain supplier quotes, research labor units for each item, consider lead times.",
    description: "Apply unit prices and labor hours from M-L Template + obtain vendor quotes for large equipment",
    status: "ready",
    statusLabel: "838 Items + Vendor Quotes",
    examples: 859,
    details: "838 items with material pricing, 762 with labor hours from M-L Template. Plus vendor quote integration: APE/Schneider quote provided $97K of the $270K material total (36%).",
    navitasEvidence: [
      "M-L TEMPLATE: Per-unit prices and labor hours — e.g., 3/4\" EMT = $0.80/ft material, 0.046 hrs/ft labor",
      "Vendor quote from All Phase Electric (APE): $97,330.57 for complete Schneider/Square D switchgear package",
      "IBEW LU 252 rates: JIW $97.27/hr, Foreman $107.92/hr (20%), Apprentice $90.23/hr",
      "SUPPLIERS sheet: 60+ vendor contacts with rep names, emails, specialties",
      "Subcontractor pricing: All Star fire alarm $9,833, excavation $8,500",
      "Fuse datasheet (FLSR series) confirms specification compliance for disconnect switches",
    ],
    navitasFiles: [
      "NAVITAS EMT vs RIGID.xlsx → M-L TEMPLATE, IBEW RATES, SUPPLIERS",
      "SUBMITTALS/ELECTRICAL GEAR SUBMITTALS.pdf ($97K quote)",
      "SUBMITTALS/FLSR-Fuse-Datasheet-Final.pdf",
    ],
    coverage: "full",
    coverageNote: "Both the unit pricing engine (M-L Template) and vendor quote process (APE submittal) are fully documented. Shows the two-track pricing approach: database for commodity items, vendor quotes for major equipment.",
    gapNote: "Vendor/supplier quote integration is listed as 'future enhancement.' Jerry can price from the database but can't evaluate or incorporate vendor proposals.",
  },
  {
    step: 5,
    name: "Extending & Totaling",
    mikeholt: "Multiply unit prices and labor hours by quantities to calculate total material costs and total labor hours.",
    description: "Qty × Unit Price = Extended Cost. Sum by category. Cross-check math.",
    status: "ready",
    statusLabel: "Ready",
    examples: 23,
    details: "Extensions are mathematical but the organization matters — the estimator separates into multiple worksheets (feeders, above ceiling, base) that roll into one summary. IBEW blended rate calculation: $98.02/hr across JIW, Foreman, and Apprentice mix.",
    navitasEvidence: [
      "BASE DETAIL: Every row has Qty × Unit Price = Extended Material and Qty × Labor Hrs = Extended Hours",
      "Separate extension sheets: 300 FEET FEEDER (1,800 LF × unit costs), ABOVE CEILING (all ceiling work), ALT 1/ALT 2",
      "EMT vs Rigid delta: $163,481 EMT total vs $245,774 Rigid total = $82,293 swing",
      "Labor mix: 640 hrs Foreman + 1,900 hrs JIW + 430 hrs Apprentice + 98.57 hrs MESTA = 3,076.57 total",
      "Blended rate: $98.02/hr (weighted average across classifications)",
    ],
    navitasFiles: ["NAVITAS EMT vs RIGID.xlsx → BASE DETAIL, 300 FEET FEEDER, ABOVE CEILING, ALT sheets"],
    coverage: "full",
    coverageNote: "Complete extension calculations visible in Excel. The multi-sheet organization shows how large projects separate scope into manageable pricing sections.",
  },
  {
    step: 6,
    name: "Estimate Summary",
    mikeholt: "Adjust for job conditions: miscellaneous materials, small tools, sales tax, subcontractor expenses.",
    description: "Add permits, equipment rental, subcontractor quotes, allowances, misc factors, mobilization",
    status: "partial",
    statusLabel: "9 Examples",
    examples: 9,
    details: "5 workflow training examples + 4 gap examples. The Navitas project shows the summary output but the reasoning behind each line item lives in the estimator's head.",
    navitasEvidence: [
      "Electrical permit: $1,200 | Fire alarm permit: $300 (non-taxable)",
      "Equipment rental: 2 × 19' lifts for 8 months = $5,600 + $2,160 delivery",
      "Subcontractor: Fire alarm (All Star) = $9,833 | Excavation = $8,500",
      "Allowances: Cord reels $1,050.56 | Fire alarm modules $1,500",
      "Sales tax: EXEMPT (noted in proposal conditions)",
      "Lighting: BY OWNER (FBO — Furnished By Owner, wire-only scope)",
    ],
    navitasFiles: ["NAVITAS EMT vs RIGID.xlsx → BASE (summary sheet)", "NAVITAS ANN ARBOR REV 11.7.2025.pdf (conditions)"],
    coverage: "partial",
    coverageNote: "The adjustments are visible in the BASE sheet but the WHY isn't documented. Why 8 months of lifts? Why $8,500 for excavation? Those judgment calls are in the estimator's head.",
    gapNote: "On-site recording target: Ask the estimator to walk through the summary page and explain each adjustment line — why that amount, what would change for a different project.",
  },
  {
    step: 7,
    name: "Overhead & Profit",
    mikeholt: "This separates professional estimators from amateurs. Many contractors fail here despite completing earlier calculations correctly.",
    description: "Apply company overhead rate, calculate profit margin, verify break-even, competitive positioning",
    status: "partial",
    statusLabel: "6 Examples — Weakest Gap",
    examples: 6,
    details: "5 workflow examples + 1 gap example. Mike Holt himself calls this 'where many contractors fail.' The Navitas project reveals the markup structure but not the decision logic.",
    navitasEvidence: [
      "Material overhead: 14% | Material profit: 6% | Large material markup: 6%",
      "Labor overhead: 14% | Labor profit: 6%",
      "Total cost: $571,578 → Bid: $673,160 (17.8% overall markup)",
      "Bonding rate table in CHECKLIST: $9.00/$1,000 on first $500K, sliding scale",
      "START FORM captures final ratios: Labor $301,570 / Material $270,009",
    ],
    navitasFiles: ["NAVITAS EMT vs RIGID.xlsx → BASE (markup rows), START FORM, CHECKLIST (bonding rates)"],
    coverage: "partial",
    coverageNote: "The percentages are visible (14% OH / 6% profit) but the reasoning is undocumented. Why 14%? Is that the client's standard or job-specific? How does cleanroom/industrial context affect the decision?",
    gapNote: "HIGHEST PRIORITY recording for the partner team. Ask: 'Walk me through how you decide what markup to apply. What changes for renovation vs new construction? What do you cut when the bid is tight?'",
  },
  {
    step: 8,
    name: "Bid Analysis",
    mikeholt: "Verify the estimate against common errors: check math, verify quantities, compare to historical jobs, sanity check $/SF.",
    description: "Sanity checks, $/SF benchmarking, labor ratio validation, peer review, error detection",
    status: "ready",
    statusLabel: "123 Examples",
    examples: 123,
    details: "5 workflow examples + 118 gap examples. Significantly improved but weak on gut-check reasoning and peer review process.",
    navitasEvidence: [
      "Price per SF: $48.22 on 14,000 SF (industrial cleanroom benchmark)",
      "38-item CHECKLIST organized into 6 QA categories: bid detail, labor, subs, general expenses, quoted material, final price",
      "Blended rate: $98.02/hr — validates labor cost against total hours",
      "Total hours: 3,076.57 — can benchmark against $/hour metrics",
      "EMT vs Rigid delta analysis: $82,293 — shows alternate scenario comparison",
      "Checklist items: 'Are fixture prices correct?', 'Are disconnect switches included?', 'MBE/WBE requirements?'",
    ],
    navitasFiles: ["NAVITAS EMT vs RIGID.xlsx → PROJECT INFO, CHECKLIST, START FORM, BASE"],
    coverage: "partial",
    coverageNote: "The WHAT to check is documented (38-item checklist, $/SF). The HOW — the estimator's gut-check process, what triggers suspicion, what gets sent back — is undocumented.",
    gapNote: "Recording target: Senior reviewing a junior's estimate. What do they look at first? What triggers 'this doesn't look right'?",
  },
  {
    step: 9,
    name: "Proposal",
    mikeholt: "Submit written documentation clarifying what's included, excluded, and terms and conditions.",
    description: "Generate scope letter with inclusions, exclusions, alternates, clarifications, T&C, validity",
    status: "partial",
    statusLabel: "17 Examples",
    examples: 17,
    details: "5 workflow examples + 2 gap examples + 10 proposal writing examples from v3. The Navitas proposal is a complete, real-world example with every element.",
    navitasEvidence: [
      "Complete 3-page proposal letter to Hodess Cleanroom Construction",
      "39 numbered base scope inclusions — every electrical item explicitly listed",
      "6 priced alternates ($8,800 - $19,290): EMT-to-Rigid upgrades + non-GFCI breaker option",
      "Explicit exclusions: VESDA system, data cabling, temperature control wiring, heat trace wiring",
      "Conditions: First shift M-F only, sales tax exempt, 30-day validity, tariff escalation clause, lead-time disclaimer",
      "Critical clarification: 'All conduits to be EMT in base proposal with exception of roof top and exterior stub-ups'",
    ],
    navitasFiles: ["NAVITAS ANN ARBOR REV 11.7.2025.pdf (complete proposal)"],
    coverage: "full",
    coverageNote: "This is a gold-standard proposal example. Every element the workflow spec calls for is present: scope, alternates, exclusions, clarifications, terms, validity.",
    gapNote: "Recording target: Ask the estimator to walk through this proposal and explain every section — why each exclusion, what assumptions, lessons from past proposals.",
  },
];

// Real training data inventory
const TRAINING_INVENTORY = [
  { component: "Core v3 (combined)", file: "jerry-v3.jsonl", examples: 819, status: "production" as const, statusLabel: "In v3 model" },
  { component: "Spec Analyzer (all versions)", file: "spec_analyzer v2-v4", examples: 80, status: "training" as const, statusLabel: "v4.8 training" },
  { component: "Labor Estimator", file: "labor_estimator_training_v1.jsonl", examples: 21, status: "ready" as const, statusLabel: "Ready to submit" },
  { component: "Step 6: Estimate Summary", file: "step6 + gaps_step_6", examples: 9, status: "ready" as const, statusLabel: "Ready to submit" },
  { component: "Step 7: Overhead & Profit", file: "step7 + gaps_step_7", examples: 6, status: "ready" as const, statusLabel: "Ready to submit" },
  { component: "Step 8: Bid Analysis", file: "step8 + gaps_step_8", examples: 123, status: "ready" as const, statusLabel: "Ready to submit" },
  { component: "Step 9: Proposal", file: "step9 + gaps_step_9 + proposal_writing", examples: 17, status: "ready" as const, statusLabel: "Ready to submit" },
  { component: "Low Voltage", file: "low_voltage_examples.jsonl", examples: 65, status: "ready" as const, statusLabel: "In v3 model" },
  { component: "RAG Verification", file: "rag_verification_examples.jsonl", examples: 59, status: "ready" as const, statusLabel: "In v3 model" },
];

interface Blocker {
  name: string;
  impact: string;
  resolution: string;
  severity: "critical" | "high" | "medium";
}

interface ResolvedBlocker {
  name: string;
  resolution: string;
  resolvedDate: string;
}

const BLOCKERS: Blocker[] = [
  {
    name: "Spec Analysis F Grade (35%)",
    impact: "Jerry misses spec requirements worth $5K-$50K per miss (communications conduit, sizing, coordination)",
    resolution: "v4.8 training in progress. On-site recordings will add spec markup walkthroughs.",
    severity: "critical",
  },
  {
    name: "Steps 6-7-9 Training Gap",
    impact: "Jerry cannot complete an estimate end-to-end — gets stuck after Step 5",
    resolution: "Partner team on-site recordings next week targeting these exact steps",
    severity: "critical",
  },
  {
    name: "Vendor Quote Integration",
    impact: "36% of Navitas material cost ($97K) came from a vendor quote, not the pricing DB",
    resolution: "Future phase — requires supplier quote parsing and evaluation capability",
    severity: "high",
  },
  {
    name: "Multi-turn State Tracking",
    impact: "No workflow continuity between steps — Jerry can't 'remember' where he is",
    resolution: "Future phase — requires state management and sequential training data",
    severity: "medium",
  },
];

const RESOLVED_BLOCKERS: ResolvedBlocker[] = [
  {
    name: "Material Pricing DB",
    resolution: "838 items with pricing across 24 categories ($0.14 - $5,500)",
    resolvedDate: "2026-02-02",
  },
  {
    name: "Step 8 Training Data",
    resolution: "118 bid analysis examples added via gap files (was 5, now 123 total)",
    resolvedDate: "2026-01-19",
  },
];

const NEXT_ACTIONS = [
  { action: "On-site recordings at the client (the partner team)", description: "Steps 6-9 walkthroughs, spec markup, bread & butter, low voltage — ~345-520 new examples", priority: 1 },
  { action: "Await v4.8 spec analyzer eval", description: "Spec analyzer with fixed training examples — target D grade (60%+)", priority: 1 },
  { action: "Submit step 6-9 training files", description: "Current 20+ examples for backend workflow steps", priority: 2 },
  { action: "Submit labor_estimator_training_v1.jsonl", description: "21 examples for labor estimation with M-L Template integration", priority: 2 },
  { action: "Process Navitas project as training material", description: "Complete real-world bid validates entire 9-step pipeline — extract training examples from all files", priority: 3 },
  { action: "Integration testing: Symbol → BOM → Pricing pipeline", description: "End-to-end test of Steps 2-5 with Navitas drawings and M-L Template", priority: 3 },
];

export default function WorkflowStatusPage() {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [showNavitas, setShowNavitas] = useState(false);

  const totalExamples = 944;
  const productionSteps = WORKFLOW_STEPS.filter(s => s.status === "production").length;
  const totalSteps = WORKFLOW_STEPS.length;
  const fullCoverage = WORKFLOW_STEPS.filter(s => s.coverage === "full").length;
  const partialCoverage = WORKFLOW_STEPS.filter(s => s.coverage === "partial").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "production":
        return { bg: "bg-green-100", border: "border-green-500", text: "text-green-700", icon: "✅" };
      case "training":
        return { bg: "bg-blue-100", border: "border-blue-500", text: "text-blue-700", icon: "🔄" };
      case "ready":
        return { bg: "bg-amber-100", border: "border-amber-500", text: "text-amber-700", icon: "📤" };
      case "partial":
        return { bg: "bg-orange-100", border: "border-orange-500", text: "text-orange-700", icon: "⚠️" };
      case "planned":
        return { bg: "bg-gray-100", border: "border-gray-400", text: "text-gray-600", icon: "📋" };
      default:
        return { bg: "bg-gray-100", border: "border-gray-400", text: "text-gray-600", icon: "❓" };
    }
  };

  const getCoverageColor = (coverage: string) => {
    switch (coverage) {
      case "full": return "bg-green-100 text-green-800 border-green-300";
      case "partial": return "bg-orange-100 text-orange-800 border-orange-300";
      case "missing": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Jerry Estimation Workflow — Mike Holt's 9-Step Process
        </h2>
        <p className="text-gray-600">
          Mapping Jerry's training progress against the industry-standard 9-step electrical estimation workflow,
          validated against a real client bid project.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-green-600">{productionSteps}/{totalSteps}</div>
          <div className="text-sm text-gray-600">Steps in Production</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-blue-600">{totalExamples}</div>
          <div className="text-sm text-gray-600">Training Examples</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-green-600">{fullCoverage}</div>
          <div className="text-sm text-gray-600">Steps Fully Covered</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-orange-600">{partialCoverage}</div>
          <div className="text-sm text-gray-600">Partial (Need Recordings)</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-red-600">{BLOCKERS.length}</div>
          <div className="text-sm text-gray-600">Blocking Issues</div>
        </div>
      </div>

      {/* Sample Project Validation Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-5 mb-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🏗️</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold">Validated Against: Hodess / Navitas Systems — Ann Arbor Cleanroom</h3>
              <button
                onClick={() => setShowNavitas(!showNavitas)}
                className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
              >
                {showNavitas ? "Hide Details" : "Show Details"}
              </button>
            </div>
            <p className="text-blue-100 text-sm">
              Real client bid by the lead estimator — all 9 Mike Holt steps are present in the project files.
              This project confirms the workflow matches the client's actual estimation process.
            </p>
            {showNavitas && (
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <h4 className="font-semibold text-sm mb-2">Project Details</h4>
                  <div className="text-xs text-blue-200 space-y-1">
                    <div className="flex justify-between"><span>Facility:</span><span>ISO 7/8 Cleanroom (Battery R&D)</span></div>
                    <div className="flex justify-between"><span>Size:</span><span>14,000 SF</span></div>
                    <div className="flex justify-between"><span>Base Bid:</span><span>$673,160</span></div>
                    <div className="flex justify-between"><span>Price/SF:</span><span>$48.22</span></div>
                    <div className="flex justify-between"><span>Total Hours:</span><span>3,077</span></div>
                    <div className="flex justify-between"><span>Blended Rate:</span><span>$98.02/hr (IBEW LU 252)</span></div>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <h4 className="font-semibold text-sm mb-2">Key Cost Breakdown</h4>
                  <div className="text-xs text-blue-200 space-y-1">
                    <div className="flex justify-between"><span>Bare Labor:</span><span>$301,570</span></div>
                    <div className="flex justify-between"><span>Bare Material:</span><span>$270,009</span></div>
                    <div className="flex justify-between"><span>Switchgear (APE quote):</span><span>$97,331</span></div>
                    <div className="flex justify-between"><span>Fire Alarm Sub:</span><span>$9,833</span></div>
                    <div className="flex justify-between"><span>OH&P Markup:</span><span>14% OH / 6% Profit</span></div>
                    <div className="flex justify-between"><span>EMT→Rigid Delta:</span><span>$82,293</span></div>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 md:col-span-2">
                  <h4 className="font-semibold text-sm mb-2">Project Files</h4>
                  <div className="grid md:grid-cols-3 gap-2 text-xs text-blue-200">
                    <div>BID SET DRAWINGS.pdf (63 pg)</div>
                    <div>ADDENDUM1 ELECTRICAL DRAWINGS.pdf (36 pg)</div>
                    <div>17 Division 26 Spec Sections</div>
                    <div>NAVITAS EMT vs RIGID.xlsx (12 sheets)</div>
                    <div>NAVITAS ANN ARBOR.pdf (3-pg proposal)</div>
                    <div>ELECTRICAL GEAR SUBMITTALS.pdf ($97K)</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Pipeline */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🔄</span> Mike Holt's 9-Step Estimation Pipeline
          </h3>
          <p className="text-indigo-200 text-sm mt-1">Click any step to see details, evidence from the Navitas project, and training gaps</p>
        </div>
        <div className="p-6">
          {/* Steps 1-3: Front End */}
          <div className="mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Front End — Scope & Quantities</div>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {WORKFLOW_STEPS.slice(0, 3).map((step) => {
              const colors = getStatusColor(step.status);
              const isSelected = selectedStep === step.step;
              return (
                <div
                  key={step.step}
                  className={`relative p-4 rounded-lg border-2 ${colors.border} ${colors.bg} cursor-pointer hover:shadow-md transition-all ${isSelected ? "ring-2 ring-indigo-400" : ""}`}
                  onClick={() => setSelectedStep(isSelected ? null : step.step)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500">STEP {step.step}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded border ${getCoverageColor(step.coverage)}`}>
                        {step.coverage === "full" ? "Validated" : step.coverage === "partial" ? "Partial" : "Missing"}
                      </span>
                      <span className="text-xl">{colors.icon}</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">{step.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">{step.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${colors.text}`}>{step.statusLabel}</span>
                    <span className="text-xs text-gray-500">{step.examples} ex.</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Arrow */}
          <div className="flex justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Steps 4-5: Pricing Engine */}
          <div className="mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Pricing Engine — Material + Labor</div>
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
            <div className="grid md:grid-cols-2 gap-4">
              {WORKFLOW_STEPS.slice(3, 5).map((step) => {
                const colors = getStatusColor(step.status);
                const isSelected = selectedStep === step.step;
                return (
                  <div
                    key={step.step}
                    className={`p-3 rounded-lg border ${colors.border} bg-white cursor-pointer hover:shadow-sm ${isSelected ? "ring-2 ring-indigo-400" : ""}`}
                    onClick={() => setSelectedStep(isSelected ? null : step.step)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-500">STEP {step.step}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded border ${getCoverageColor(step.coverage)}`}>
                          Validated
                        </span>
                        <span>{colors.icon}</span>
                      </div>
                    </div>
                    <h5 className="font-semibold text-gray-900 text-sm">{step.name}</h5>
                    <p className="text-xs text-gray-600">{step.description}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 grid md:grid-cols-4 gap-3 text-center">
              <div className="bg-white rounded p-2 border border-green-200">
                <div className="text-lg font-bold text-green-700">1,187</div>
                <div className="text-xs text-gray-600">M-L Template Items</div>
              </div>
              <div className="bg-white rounded p-2 border border-green-200">
                <div className="text-lg font-bold text-green-700">838</div>
                <div className="text-xs text-gray-600">With Pricing</div>
              </div>
              <div className="bg-white rounded p-2 border border-green-200">
                <div className="text-lg font-bold text-green-700">762</div>
                <div className="text-xs text-gray-600">With Labor</div>
              </div>
              <div className="bg-white rounded p-2 border border-green-200">
                <div className="text-lg font-bold text-blue-700">$98.02</div>
                <div className="text-xs text-gray-600">Blended Rate/hr</div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Steps 6-9: Back End */}
          <div className="mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Back End — Summary, Markup, Review, Proposal</div>
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎬</span>
              <span className="text-sm font-bold text-orange-800">On-Site Recording Target — Partner team visiting next week</span>
            </div>
            <div className="grid md:grid-cols-4 gap-3">
              {WORKFLOW_STEPS.slice(5, 9).map((step) => {
                const colors = getStatusColor(step.status);
                const isSelected = selectedStep === step.step;
                return (
                  <div
                    key={step.step}
                    className={`p-3 rounded-lg border ${colors.border} bg-white cursor-pointer hover:shadow-sm ${isSelected ? "ring-2 ring-indigo-400" : ""}`}
                    onClick={() => setSelectedStep(isSelected ? null : step.step)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-500">STEP {step.step}</span>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${getCoverageColor(step.coverage)}`}>
                          {step.coverage === "full" ? "Validated" : "Partial"}
                        </span>
                        <span>{colors.icon}</span>
                      </div>
                    </div>
                    <h5 className="font-semibold text-gray-900 text-sm">{step.name}</h5>
                    <div className="text-xs text-orange-700 font-semibold mt-1">{step.examples} examples</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Step Detail */}
          {selectedStep && (
            <div className="mt-6 bg-gray-50 rounded-lg border-2 border-indigo-200 p-6">
              {(() => {
                const step = WORKFLOW_STEPS[selectedStep - 1];
                const colors = getStatusColor(step.status);
                return (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center font-bold`}>
                          {step.step}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{step.name}</h4>
                          <p className="text-sm text-gray-500 italic">"{step.mikeholt}"</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded border ${getCoverageColor(step.coverage)} font-bold text-sm`}>
                        {step.coverage === "full" ? "Fully Validated" : step.coverage === "partial" ? "Partially Covered" : "Not Covered"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-4">{step.details}</p>

                    {/* Navitas Evidence */}
                    <div className="bg-white rounded-lg border p-4 mb-4">
                      <h5 className="font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                        <span>🏗️</span> Evidence from Navitas Project
                      </h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {step.navitasEvidence.map((ev, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">-</span>
                            <span>{ev}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {step.navitasFiles.map((file, i) => (
                          <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-200">
                            {file}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-2"><strong>Coverage Assessment:</strong> {step.coverageNote}</p>

                    {step.gapNote && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-sm text-orange-800"><strong>Gap / Recording Target:</strong> {step.gapNote}</p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Real-World Calculation Example */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🧮</span> How the Navitas Bid Flows Through 9 Steps
          </h3>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm space-y-3">
            <div className="text-gray-500 font-sans text-xs uppercase font-bold">Steps 1-2: Scope & Takeoff</div>
            <div className="flex justify-between">
              <span>Specs reviewed:</span>
              <span>17 Div 26 sections + Div 22/23 cross-refs</span>
            </div>
            <div className="flex justify-between">
              <span>Drawing pages:</span>
              <span>63 bid set + 36 addendum = 99 pages</span>
            </div>
            <div className="flex justify-between">
              <span>Takeoff line items:</span>
              <span>247 items in BASE DETAIL</span>
            </div>

            <div className="border-t border-gray-300 my-2"></div>
            <div className="text-gray-500 font-sans text-xs uppercase font-bold">Steps 3-5: BOM, Pricing, Extensions</div>
            <div className="flex justify-between">
              <span>M-L Template items used:</span>
              <span>1,187 reference rows</span>
            </div>
            <div className="flex justify-between">
              <span>Vendor quote (switchgear):</span>
              <span className="text-blue-700">$97,330.57</span>
            </div>
            <div className="flex justify-between">
              <span>Bare material total:</span>
              <span className="text-blue-700">$270,008.80</span>
            </div>
            <div className="flex justify-between">
              <span>Labor hours:</span>
              <span>3,076.57 hrs @ $98.02/hr blended</span>
            </div>
            <div className="flex justify-between">
              <span>Bare labor total:</span>
              <span className="text-blue-700">$301,569.53</span>
            </div>

            <div className="border-t border-gray-300 my-2"></div>
            <div className="text-gray-500 font-sans text-xs uppercase font-bold">Step 6: Estimate Summary</div>
            <div className="flex justify-between">
              <span>Permits:</span>
              <span>$1,500</span>
            </div>
            <div className="flex justify-between">
              <span>Equipment rental (lifts):</span>
              <span>$7,760</span>
            </div>
            <div className="flex justify-between">
              <span>Fire alarm sub:</span>
              <span>$9,833</span>
            </div>
            <div className="flex justify-between">
              <span>Excavation:</span>
              <span>$8,500</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total direct cost:</span>
              <span className="text-gray-900">$571,578.33</span>
            </div>

            <div className="border-t border-gray-300 my-2"></div>
            <div className="text-gray-500 font-sans text-xs uppercase font-bold">Step 7: Overhead & Profit</div>
            <div className="flex justify-between">
              <span>Material OH (14%) + Profit (6%):</span>
              <span>applied to $270K material</span>
            </div>
            <div className="flex justify-between">
              <span>Labor OH (14%) + Profit (6%):</span>
              <span>applied to $301K labor</span>
            </div>
            <div className="flex justify-between">
              <span>Overall markup:</span>
              <span>17.8%</span>
            </div>

            <div className="border-t border-gray-300 my-2"></div>
            <div className="text-gray-500 font-sans text-xs uppercase font-bold">Step 8: Bid Analysis</div>
            <div className="flex justify-between">
              <span>$/SF:</span>
              <span>$48.22 on 14,000 SF</span>
            </div>
            <div className="flex justify-between">
              <span>38-item QA checklist:</span>
              <span>passed</span>
            </div>
            <div className="flex justify-between">
              <span>EMT vs Rigid delta analyzed:</span>
              <span>$82,293 swing</span>
            </div>

            <div className="border-t border-gray-300 my-2"></div>
            <div className="text-gray-500 font-sans text-xs uppercase font-bold">Step 9: Proposal</div>
            <div className="flex justify-between font-bold text-lg">
              <span>Base Bid (NTE):</span>
              <span className="text-green-700">$673,160.00</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>+ 6 priced alternates:</span>
              <span>$8,800 - $19,290 each</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Exclusions:</span>
              <span>VESDA, data cabling, temp control, heat trace</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Validity:</span>
              <span>30 days with tariff escalation clause</span>
            </div>
          </div>
        </div>
      </div>

      {/* IBEW Rate Structure */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-slate-600 to-gray-700 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>👷</span> IBEW Labor Rate Structure (LU 252 — Ann Arbor)
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Classification</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Straight</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">OT (1.5x)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">DT (2x)</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Navitas Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-3 px-4 font-medium">Inside Journeyman (JIW)</td>
                  <td className="py-3 px-4 text-right font-mono">$97.27</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-500">$132.76</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-500">$168.26</td>
                  <td className="py-3 px-4 text-center font-bold">1,900 hrs</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Foreman (20% premium)</td>
                  <td className="py-3 px-4 text-right font-mono">$107.92</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-500">$147.31</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-500">$186.71</td>
                  <td className="py-3 px-4 text-center font-bold">640 hrs</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">6th Period Apprentice</td>
                  <td className="py-3 px-4 text-right font-mono">$90.23</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-500">—</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-500">—</td>
                  <td className="py-3 px-4 text-center font-bold">430 hrs</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">MESTA Teledata (LU 8)</td>
                  <td className="py-3 px-4 text-right font-mono">$78.32</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-500">—</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-500">—</td>
                  <td className="py-3 px-4 text-center font-bold">98.57 hrs</td>
                </tr>
                <tr className="bg-indigo-50 font-bold">
                  <td className="py-3 px-4">Blended Rate</td>
                  <td className="py-3 px-4 text-right font-mono text-indigo-700">$98.02</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-400">—</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-400">—</td>
                  <td className="py-3 px-4 text-center text-indigo-700">3,076.57 total</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            These are fully burdened rates (wages + benefits + insurance + FICA + union contributions).
            A 10% productivity error at this blended rate = ~$30K impact on a project this size.
          </p>
        </div>
      </div>

      {/* Training Data Inventory */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📊</span> Complete Training Data Inventory
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Component</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Source Files</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Examples</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {TRAINING_INVENTORY.map((data, idx) => {
                const colors = getStatusColor(data.status);
                return (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-3 px-4 font-medium text-gray-900">{data.component}</td>
                    <td className="py-3 px-4 text-xs text-gray-500 font-mono">{data.file}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-lg font-bold text-gray-900">{data.examples}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                        <span>{colors.icon}</span>
                        {data.statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-indigo-50 font-semibold">
                <td className="py-3 px-4 text-indigo-900">Total (deduplicated)</td>
                <td className="py-3 px-4 text-xs text-indigo-500">across all files</td>
                <td className="py-3 px-4 text-center text-xl text-indigo-900">944</td>
                <td className="py-3 px-4 text-center text-sm text-indigo-700">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Skill Distribution */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🎯</span> Skill Distribution (v3 Core)
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            {[
              { skill: "RFI Identification", count: 167, color: "bg-blue-500" },
              { skill: "Pricing Strategy", count: 155, color: "bg-green-500" },
              { skill: "Code Compliance", count: 110, color: "bg-yellow-500" },
              { skill: "Labor Estimation", count: 104, color: "bg-orange-500" },
              { skill: "Material Takeoff", count: 74, color: "bg-purple-500" },
              { skill: "Scope Analysis", count: 33, color: "bg-cyan-500" },
              { skill: "Change Order", count: 25, color: "bg-pink-500" },
              { skill: "Drawing Reading", count: 10, color: "bg-indigo-500" },
              { skill: "Bid Analysis", count: 7, color: "bg-red-400" },
              { skill: "Proposal Writing", count: 2, color: "bg-red-500" },
            ].map((item) => (
              <div key={item.skill} className="flex items-center gap-3">
                <div className="w-36 text-xs font-medium text-gray-700 text-right">{item.skill}</div>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${(item.count / 167) * 100}%` }}
                  />
                </div>
                <div className={`text-xs font-mono w-8 text-right ${item.count < 10 ? "text-red-600 font-bold" : "text-gray-600"}`}>
                  {item.count}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              <strong>Critical gap:</strong> Bid Analysis (7) and Proposal Writing (2) are nearly empty in the v3 core model.
              The gap files add 118 bid analysis and 10 proposal examples — but these haven't been trained yet.
              On-site recordings will further strengthen both.
            </p>
          </div>
        </div>
      </div>

      {/* Blocking Issues */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🚧</span> Blocking Issues ({BLOCKERS.length} active)
          </h3>
        </div>
        <div className="p-6">
          {RESOLVED_BLOCKERS.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Recently Resolved</h4>
              {RESOLVED_BLOCKERS.map((blocker, idx) => (
                <div key={idx} className="border-l-4 border-green-500 bg-green-50 rounded-r-lg p-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span className="line-through text-gray-500">{blocker.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-green-200 text-green-800 font-bold">RESOLVED {blocker.resolvedDate}</span>
                  </div>
                  <p className="text-sm text-green-700 ml-6">{blocker.resolution}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {BLOCKERS.map((blocker, idx) => (
              <div
                key={idx}
                className={`border-l-4 rounded-r-lg p-4 ${
                  blocker.severity === "critical" ? "bg-red-50 border-red-500" :
                  blocker.severity === "high" ? "bg-orange-50 border-orange-500" :
                  "bg-amber-50 border-amber-500"
                }`}
              >
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  {blocker.name}
                  <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${
                    blocker.severity === "critical" ? "bg-red-200 text-red-800" :
                    blocker.severity === "high" ? "bg-orange-200 text-orange-800" :
                    "bg-amber-200 text-amber-800"
                  }`}>
                    {blocker.severity}
                  </span>
                </h4>
                <p className="text-sm text-gray-700 mt-1"><strong>Impact:</strong> {blocker.impact}</p>
                <p className="text-sm text-gray-700"><strong>Resolution:</strong> {blocker.resolution}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Actions */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🎯</span> Next Actions
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {NEXT_ACTIONS.map((action, idx) => (
              <div key={idx} className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${
                  action.priority === 1 ? "bg-red-500" :
                  action.priority === 2 ? "bg-amber-500" :
                  "bg-blue-500"
                }`}>
                  {action.priority}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{action.action}</h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Source Reference */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span>📖</span> Source
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          This workflow follows <strong>Mike Holt's 9-Step Electrical Estimating Process</strong> from
          Mike Holt Enterprises, adapted for the client's practices and validated against the
          Hodess/Navitas Ann Arbor Cleanroom project (lead estimator).
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { status: "production", label: "Production", desc: "Live and working" },
            { status: "training", label: "In Training", desc: "Model being trained" },
            { status: "ready", label: "Ready to Submit", desc: "Data prepared" },
            { status: "partial", label: "Partial", desc: "Needs more data" },
            { status: "planned", label: "Planned", desc: "Future development" },
          ].map((item) => {
            const colors = getStatusColor(item.status);
            return (
              <div key={item.status} className="flex items-center gap-2">
                <span className={`w-8 h-8 rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center`}>
                  {colors.icon}
                </span>
                <div>
                  <div className={`text-sm font-semibold ${colors.text}`}>{item.label}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
