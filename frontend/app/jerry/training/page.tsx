"use client";

import { useState } from "react";

interface Module {
  id: string;
  name: string;
  focus: string;
  outcomes: string;
  sources: string[];
  status: "not_started" | "in_progress" | "completed";
  achievement?: string;
}

interface ContentSource {
  id: string;
  title: string;
  type: string;
  skillArea: string;
  publisher: string;
  priority: number;
  toolHooks: string[];
}

interface WarmUp {
  id: string;
  track: string;
  topic: string;
  title: string;
  channel: string;
  priority: number;
}

type Day1Status = "full" | "strong" | "partial" | "light" | "open";

const syllabus: Module[] = [
  {
    id: "M-01",
    name: "Estimator onboarding",
    focus: "What's in a bid package; roles; success criteria",
    outcomes: "Explain estimator workflow stages; list required bid inputs; define deliverables (estimate + scope letter + alternates).",
    sources: ["C-001", "C-002", "C-026"],
    status: "completed",
    achievement: "Jerry v3: 81.4% overall score, 100% LOOKUP rate, 86.7% domain reasoning - H100 trained"
  },
  {
    id: "M-02",
    name: "Contract docs & bid prep",
    focus: "Drawings/specs/addenda/checklists",
    outcomes: "Extract key bid requirements; identify missing docs; build bid checklist and RFI list.",
    sources: ["C-001", "C-022", "C-020"],
    status: "not_started"
  },
  {
    id: "M-03",
    name: "Plan navigation & symbols",
    focus: "Find legends/schedules/details quickly",
    outcomes: "Route the sheet set; build symbol glossary; validate symbol extraction results.",
    sources: ["C-014", "C-015", "C-016", "C-025"],
    status: "completed",
    achievement: "99.1% symbol detection accuracy, 124 symbol types, Florence-2 fine-tuned"
  },
  {
    id: "M-04",
    name: "Lighting takeoff",
    focus: "Counts + schedules + controls implications",
    outcomes: "Count fixtures; reconcile with lighting schedule; flag control requirements and alternates.",
    sources: ["C-008", "C-007"],
    status: "not_started"
  },
  {
    id: "M-05",
    name: "Power devices & branch circuits",
    focus: "Device counts; homeruns; typical materials",
    outcomes: "Count receptacles/devices; infer homeruns and branch circuit material; create assemblies in estimate structure.",
    sources: ["C-007", "C-017"],
    status: "not_started"
  },
  {
    id: "M-06",
    name: "Distribution & feeders",
    focus: "One-lines, panels, feeders, gear",
    outcomes: "Extract distribution equipment; build equipment list; estimate feeders/raceways; validate assumptions.",
    sources: ["C-025", "W-003", "W-001"],
    status: "not_started"
  },
  {
    id: "M-07",
    name: "NEC lookups for estimating",
    focus: "When to consult code; how to cite it",
    outcomes: "Use NEC RAG to validate conductor sizing, fill, voltage drop assumptions; record citations in estimate notes.",
    sources: ["C-024", "W-004", "W-005"],
    status: "not_started"
  },
  {
    id: "M-08",
    name: "Labor units & factoring",
    focus: "NECA columns; job difficulty; productivity risk",
    outcomes: "Select labor unit assemblies; score project conditions; adjust labor via factors; justify selections.",
    sources: ["C-003", "C-004", "C-006", "C-005"],
    status: "not_started"
  },
  {
    id: "M-09",
    name: "Spec extraction for cost drivers",
    focus: "Submittals, testing, closeout, special requirements",
    outcomes: "Extract hidden cost items from specs; add line items (testing, labeling, commissioning, submittals).",
    sources: ["C-022", "C-021", "C-020"],
    status: "not_started"
  },
  {
    id: "M-10",
    name: "Assemblies + estimating methods",
    focus: "Unit/assembly/square-foot conceptual vs detailed",
    outcomes: "Choose estimating method by design maturity; convert conceptual to detailed assemblies; track uncertainty.",
    sources: ["C-029", "C-006"],
    status: "not_started"
  },
  {
    id: "M-11",
    name: "Excel template output",
    focus: "Map takeoff to client bid template",
    outcomes: "Populate estimate into client's Excel structure; maintain formulas; produce clean bid summary tabs.",
    sources: ["Internal tooling"],
    status: "not_started"
  },
  {
    id: "M-12",
    name: "Final review & scope letter",
    focus: "QA pass; exclusions; alternates; submission package",
    outcomes: "Run checklist; create scope clarifications; produce proposal-ready summary and alternates list.",
    sources: ["C-026", "C-001"],
    status: "not_started"
  }
];

const prioritySources: ContentSource[] = [
  { id: "C-001", title: "How to Prepare a Proper Estimate", type: "Article", skillArea: "Estimating workflow", publisher: "EC&M", priority: 5, toolHooks: ["Spec reader", "RAG", "QA checklist"] },
  { id: "C-003", title: "NECA Manual of Labor Units (MLU)", type: "Reference", skillArea: "Labor modeling", publisher: "NECA", priority: 5, toolHooks: ["Labor-unit lookup", "Factor calculator"] },
  { id: "C-004", title: "NECA Labor Factor Score Sheet", type: "PDF", skillArea: "Labor modeling", publisher: "NECA", priority: 5, toolHooks: ["Factor calculator", "Explanation generator"] },
  { id: "C-006", title: "Labor Overruns are Costly", type: "PDF", skillArea: "Labor modeling", publisher: "ABB", priority: 5, toolHooks: ["Labor-unit tool", "Factor calculator", "QA checklist"] },
  { id: "C-012", title: "iBidElectric (channel)", type: "YouTube", skillArea: "Estimator mindset", publisher: "iBidElectric", priority: 5, toolHooks: ["Reasoning", "Proposal writer", "Risk clarifier"] },
  { id: "C-002", title: "Beginner's Guide to Electrical Estimating", type: "Article", skillArea: "Fundamentals", publisher: "EC Magazine", priority: 4, toolHooks: ["Syllabus generator", "Excel template mapper"] },
  { id: "C-007", title: "Fast, Accurate Electrical Takeoffs Using Search Tools", type: "Webinar", skillArea: "Digital takeoff", publisher: "Bluebeam", priority: 4, toolHooks: ["Symbol extraction", "Measurement", "Export-to-Excel"] },
  { id: "C-014", title: "Understanding Blueprints: Electrical Symbols", type: "YouTube", skillArea: "Plan reading", publisher: "Electrician U", priority: 4, toolHooks: ["Symbol extraction", "Glossary builder"] },
  { id: "C-022", title: "Standard Specifications for Electrical Design", type: "PDF", skillArea: "Specs & scope", publisher: "City of Seattle", priority: 4, toolHooks: ["Spec reader", "Conflict detector", "RAG"] },
  { id: "C-024", title: "Mike Holt NEC Videos", type: "Library", skillArea: "Code usage", publisher: "Mike Holt", priority: 4, toolHooks: ["NEC RAG", "Justification generator"] }
];

const warmUps: WarmUp[] = [
  { id: "W-001", track: "Electrical fundamentals", topic: "Three-phase power basics", title: "How 3 Phase Power works", channel: "The Engineering Mindset", priority: 3 },
  { id: "W-003", track: "Plan interpretation", topic: "Panel schedules", title: "How to Read a Panel Schedule", channel: "YouTube", priority: 4 },
  { id: "W-004", track: "NEC calculations", topic: "Conduit fill", title: "How to Calculate Conduit Fill", channel: "YouTube", priority: 4 },
  { id: "W-005", track: "NEC calculations", topic: "Voltage drop", title: "Calculating Voltage Drop", channel: "YouTube", priority: 4 },
  { id: "W-007", track: "Estimator thinking", topic: "Estimating tips", title: "Electrical Estimating Tips (playlist)", channel: "iBidElectric", priority: 4 },
  { id: "W-009", track: "Plan reading", topic: "Commercial blueprints", title: "How to Read Blueprints for Commercial Electrician", channel: "Playlist", priority: 4 }
];

const toolHooks = [
  { name: "Symbol extraction", description: "Detect and count electrical symbols from drawings", modules: ["M-03", "M-04", "M-05"] },
  { name: "Spec reader", description: "Parse specifications and extract requirements", modules: ["M-02", "M-09"] },
  { name: "NEC RAG lookup", description: "Query National Electrical Code for sizing and requirements", modules: ["M-07"] },
  { name: "Labor-unit calculator", description: "Calculate labor hours using NECA units and factors", modules: ["M-08"] },
  { name: "Excel template mapper", description: "Output estimates to client Excel templates", modules: ["M-11"] },
  { name: "QA checklist tool", description: "Run quality checks and identify missing items", modules: ["M-01", "M-12"] }
];

// Day 1 completed recordings
const day1Sessions = [
  {
    id: "S1",
    title: "Session 1: Senior Reviewer — Sr Estimator Reviewing Jr Estimate",
    estimator: "Senior Reviewer (Senior Estimator)",
    duration: "65.9 min",
    file: "Session 1 (Sr Estimator Reviewing Jr Estimate) - Recording.mp4",
    yieldEstimate: "60-80 examples",
    gapsCovered: [
      { gap: "P1 #4: Senior Reviewing Junior", coverage: "full" as const, detail: "Complete walkthrough of checking base bid, distribution calcs, labor units, fixture totals, fire alarm, feeders, equipment" },
      { gap: "P1 #2: Overhead & Profit", coverage: "strong" as const, detail: "20% profit target, client-based margin adjustment (AT&T = 35-40%), bid day decisions, OH&P percentage manipulation" },
      { gap: "P1 #5: Estimate Summary", coverage: "strong" as const, detail: "Lost time %, safety training, travel/per diem, crew structure (F20/F15/F10), labor rates ($87.02 vs $51.79), overtime calc" },
      { gap: "P1 #3: Scope Letter", coverage: "partial" as const, detail: "Reviewed real scope letter (Toledo Public Schools HVAC), ChatGPT for scope letters, exclusion language, escalation clauses" },
      { gap: "P1 #1: Steps 6-9 Flow", coverage: "partial" as const, detail: "Summary assembly, subcontractor markup (20%), bond check ($8,600), addendum verification, final hour reconciliation" },
      { gap: "P2 #11: Verification", coverage: "partial" as const, detail: "3,500 formula checking, sum range verification, wire count per pipe sanity check (5,930/430 = 4.14), wrong wire size catch" },
      { gap: "P2 #8: Fire Alarm", coverage: "light" as const, detail: "Conduit requirement check, duct detector remote test switch (often missed), J-hooks, 50ft device spacing rule" },
    ],
    highlights: [
      "Temp lighting rule: 1 set per 1,000 SF",
      "Labor unit adjustments: shorter runs need higher rates (setup time), longer runs lower (watching wire puller)",
      "Max 4 wires per pipe for panels/transformers — caught 11 wires in 3/4\" pipe with #4 wire (impossible)",
      "Fan Filter Units: 110 disconnects would have been 'sizable' cost if required",
      "Fixture costs: $12 ceiling lay-in vs $32 linear/industrial (gripples, aircraft cables)",
      "Lost time: 15-20% on large jobs (parking, breaks, waiting on trades)",
      "Union jurisdiction: request specific licenses to filter for better workers from local hall",
      "3,500 formulas in the spreadsheet — prefers Excel over McCormick",
      "Tariffs: initially 5%, backed off — 'management gut feeling'",
      "Estimating styles: one estimator (437 detailed lines, color-coded) vs another (chunked to ~100 lines)",
      "75,000 SF school: 4 days uninterrupted, ~2 weeks with interruptions",
    ],
  },
  {
    id: "S2",
    title: "Session 2: Estimator — Speed Estimate & Scope Thought Leadership",
    estimator: "Estimator (16yr contractor background)",
    duration: "45.1 min",
    file: "Session 2 (Speed Estimate & Scope Thought Leadership) - Recording 2.mp4",
    yieldEstimate: "40-60 examples",
    gapsCovered: [
      { gap: "P1 #6: Spec Reading", coverage: "strong" as const, detail: "Div 26 download, custom GPT extraction, approved manufacturer matrix, copper vs aluminum spec compliance, VE proposals" },
      { gap: "P1 #3: Scope Letter", coverage: "full" as const, detail: "GPT-generated scope letters upfront, 2-3 page thoroughness, addendum acknowledgment, value engineering language, competitive advantage" },
      { gap: "P2 #7: Speed-Run / Natural Process", coverage: "partial" as const, detail: "Natural takeoff process on Cath Lab project — but complex, not bread & butter. Shows complete estimation start workflow." },
      { gap: "P2 #11: Verification", coverage: "partial" as const, detail: "AI red flag checking on takeoff data, conductor math verification, feeder checks, color-coded markup system" },
      { gap: "P1 #1: Steps 6-9 Flow", coverage: "light" as const, detail: "Bid preparation, submission process, addendum handling (9 addendums on MJT State Park eliminated a cabin)" },
    ],
    highlights: [
      "Site visit photos: identify conduit types, fixtures, manufacturer labels, above-ceiling congestion ('the print doesn't show you that')",
      "Custom GPT workflow: 'project info' keyword → fills project tab; 'scope letter' keyword → generates Div 26 scope letter before estimate starts",
      "Approved manufacturer matrix from GPT: 'Square D or Cumins or Eaton or approved equal'",
      "Copper vs aluminum: 'that's the contract' — installing aluminum when copper specified = rip out and reinstall",
      "Value engineering: bid the print first, offer alternatives in scope letter ('we can save you $10,000')",
      "U of M hospital: 'If it begins with a U, multiply by two' — complex close-out, submittals, active hospital logistics",
      "Thoroughness wins: 2-3 page scope letters vs competitors' 'Division 26, here's your price' — competitors lose on change orders",
      "Color coding: green=existing (don't touch), yellow=crossed off after added to estimate",
      "Estimating time as project cost: considers including estimating hours once awarded",
      "Bidding is 'an art' — consistency and relationships matter as much as price",
    ],
  },
  {
    id: "S3",
    title: "Session 3: Senior Estimator — Tech Estimate / Completed Estimate / Business Logic",
    estimator: "Senior Estimator (20yr experience, McCormick + Excel)",
    duration: "83.3 min",
    file: "Session 3 Recording.mp4",
    yieldEstimate: "70-100 examples",
    gapsCovered: [
      { gap: "P1 #2: Overhead & Profit", coverage: "full" as const, detail: "20% target confirmed across ALL estimators, formula yields ~17%, the project sponsor makes final adjustments, cost codes tracking estimated vs actual, margin visibility gap in Excel, wants simulated margin views" },
      { gap: "P2 #7: Speed-Run / Bread & Butter", coverage: "strong" as const, detail: "Full temp control estimate walkthrough — 'very basic, could train anybody'. VAV units, sensor counting (21×3=63), wire footage (30ft/sensor, 100ft Backnet/unit), 6-8.5 labor hrs/unit" },
      { gap: "P2 #11: Verification", coverage: "strong" as const, detail: "Labor hrs/unit as sanity check (6-8.5 range, vet 'oddballs' at 25hrs), $/SF comparison ($165 school vs $227), the project sponsor catching formula errors (cells not captured in sum), cost code implementation" },
      { gap: "P1 #1: Steps 6-9 Flow", coverage: "partial" as const, detail: "Alternates walkthrough (base + bipolar ionization, prepackaged vs field-wired deducts), proposal process (scope letter copy/paste → reception → PDF), review with the project sponsor (shared liability), project setup workflow" },
      { gap: "P1 #5: Estimate Summary", coverage: "strong" as const, detail: "Non-work hours (6/40hr week), mobilization/demob, delivery costs (1hr each way × 24 weeks), misc conduit allowances scaled by job size, standardization discussion" },
      { gap: "P1 #3: Scope Letter", coverage: "partial" as const, detail: "Copy recent job, rename, change details — risk of missing exclusions. Wants AI auto-generation. Public bids: bid form + checklists + bid bond + Iran sanctions notarization" },
      { gap: "P2 #9: Structured Cabling", coverage: "light" as const, detail: "Mentioned in McCormick context — cost codes, system breakdowns, cable vendor quotes. No actual estimation walkthrough." },
    ],
    highlights: [
      "Temp control formula: 21 VAV × 3 sensors = 63; × 30ft = 1,890ft wire; + 100ft Backnet/unit = 2,100ft comm wire",
      "McCormick vs Excel: the senior estimator spent 10yr on Acubid/McCormick, views Excel as '10-year step backwards' but 'good enough'",
      "The project sponsor prefers Excel flexibility; McCormick forces specific workflow — hit a wall on adoption",
      "McCormick assemblies: click once on symbol → adds box + device + plate + conduit + wire (Excel requires manual build)",
      "Extension feature: all parts compiled line-by-line, change price/labor in one spot → updates entire estimate",
      "Cost codes being implemented: conduit, device finishing, etc. — will track estimated vs actual for margin stability",
      "Some jobs hit 40% margin, some hit 5% — average ~20%. Cost codes will reveal which categories over/under-perform",
      "Vendor quote workflow: email BOM to distributor, get individual pricing (not bulk like electrical), track historical trends",
      "Excel formula danger: the project sponsor caught formulas not capturing all cells — 'a lot of money missed' — tool should auto-calculate",
      "Project setup: same info typed 4-5 times (estimator → accounting → foundations → Excel) — major inefficiency",
      "Alternates: base bid + options (bipolar ionization $5,800, prepackaged vs field-wired = $18K deduct)",
      "State tax rules: Ohio taxpayer-funded = tax exempt for permanent items; Michigan schools pay tax on material",
    ],
  },
];

// Priority 1 recordings - Critical Gaps (with Day 1 status)
const p1Recordings = [
  {
    id: 1,
    title: "Senior Estimator: Steps 6-9 on a Real Project",
    duration: "60-90 min",
    yieldLow: 50,
    yieldHigh: 80,
    stepsAddressed: ["Step 6", "Step 7", "Step 8", "Step 9", "Sequential Flow"],
    day1Status: "partial" as Day1Status,
    day1Note: "All 3 sessions contribute. S1: Steps 6-8 (summary, OH&P, review). S2: Step 9 context. S3: alternates, proposal process, review with the project sponsor, project setup. Missing: complete end-to-end sequential walkthrough on a single project.",
    description: "An estimator completing the full backend of an estimate — from raw totals through summary, markup, review, and proposal.",
    whatToCapture: [
      "Applying misc material factors (3-5%), small tools allowance (1-2%)",
      "Sales tax calculation — taxable vs non-taxable items",
      "Subcontractor quote integration with markup",
      "OH&P markup decision and calculation",
      "Sanity check / bid review before submission",
      "Scope letter assembly and proposal formatting"
    ],
    askThem: "Walk me through how you take a completed takeoff and turn it into a bid number. Start from your totals and show me every step to the final proposal.",
    impact: "This single recording could generate 50-80 training examples and is the highest-value recording of the entire visit."
  },
  {
    id: 2,
    title: "Overhead & Profit Discussion",
    duration: "30-45 min",
    yieldLow: 30,
    yieldHigh: 50,
    stepsAddressed: ["Step 7"],
    day1Status: "full" as Day1Status,
    day1Note: "COVERED across Sessions 1+3. Session 1: the senior reviewer covers 20% target, client-adjusted margins (AT&T 35-40%). Session 3: the senior estimator confirms 20% company-wide target, formula yields ~17%, cost codes tracking estimated vs actual, margin visibility gap, some jobs 40%/some 5% but average 20%. No Day 2 action needed.",
    description: "How the client determines markup — the most sensitive and least documented step in the entire process.",
    whatToCapture: [
      "How company overhead % is derived (rent, vehicles, insurance, admin)",
      "Markup vs margin — the difference and why it matters",
      "Break-even analysis for a specific job",
      "Risk-adjusted margins (renovation vs new construction)",
      "Sliding scale by job size — small jobs vs large projects",
      "Bid day decisions — 'GC says we're $20K high, what do we cut?'"
    ],
    askThem: "Walk me through how you decide what markup to apply on a typical commercial job. What changes for renovation vs new construction? What's your thought process when the bid is tight?",
    impact: "Step 7 currently has 1 training example. This is the single worst gap in Jerry's knowledge."
  },
  {
    id: 3,
    title: "Scope Letter Walk-Through",
    duration: "30 min",
    yieldLow: 20,
    yieldHigh: 30,
    stepsAddressed: ["Step 9"],
    day1Status: "full" as Day1Status,
    day1Note: "COVERED across all 3 sessions. S1: the senior reviewer covers real scope letter + ChatGPT + escalation clauses. S2: the estimator demonstrates full GPT-generated scope letter, 2-3 page thoroughness, VE language. S3: the senior estimator covers copy/paste workflow, risk of missing exclusions, public bid paperwork (bid bond, Iran sanctions). No Day 2 action needed.",
    description: "How the client writes the proposal document that the GC evaluates alongside the bid number.",
    whatToCapture: [
      "Inclusions/exclusions list — how they decide what to call out",
      "Clarifications and assumptions that define pricing basis",
      "Alternate pricing — add/deduct options",
      "Terms & conditions, payment terms, validity period",
      "Bid form completion — formatting for GC responsiveness"
    ],
    askThem: "Open a recent proposal you submitted and walk me through every section — why you included each exclusion, what assumptions you documented.",
    impact: "Jerry currently has 2 proposal examples. He cannot write a scope letter."
  },
  {
    id: 4,
    title: "Senior Reviewing a Junior's Estimate",
    duration: "30-45 min",
    yieldLow: 20,
    yieldHigh: 30,
    stepsAddressed: ["Step 8"],
    day1Status: "full" as Day1Status,
    day1Note: "FULLY COVERED by Session 1. The senior reviewer walks through the complete review process: base bid details, distribution math, labor unit checks, wire-per-pipe verification, fixture totals, fire alarm items, subcontractor quotes. No Day 2 action needed.",
    description: "The peer review process — what a senior looks at first, what triggers suspicion, what gets sent back.",
    whatToCapture: [
      "What they check first on a completed estimate",
      "$/SF sanity check against building type benchmarks",
      "Labor ratio validation — does the split make sense?",
      "Error detection — what triggers 'this doesn't look right'",
      "What gets sent back for correction vs what's accepted"
    ],
    askThem: "Pretend I just handed you a completed estimate for review. Show me your process — what do you look at, in what order, and what would make you suspicious?",
    impact: "Step 8 has been improved (118 examples) but peer review and gut-check reasoning are still weak."
  },
  {
    id: 5,
    title: "Estimate Summary from Raw Totals",
    duration: "20-30 min",
    yieldLow: 15,
    yieldHigh: 25,
    stepsAddressed: ["Step 6"],
    day1Status: "full" as Day1Status,
    day1Note: "COVERED across Sessions 1+3. S1: lost time % (15-20%), safety training, travel, crew structure (F20/F15/F10), labor rates, overtime. S3: non-work hours (6/40hr), mobilization/demob, delivery costs, misc conduit by job size, standardization discussion. No Day 2 action needed.",
    description: "The bridge between raw takeoff totals and a real bid number — the adjustments that turn data into an estimate.",
    whatToCapture: [
      "Miscellaneous material factors — wire nuts, tape, connectors",
      "Small tools allowance — drill bits, blades, consumables",
      "Job condition factors — Column C/D multipliers from site walkthrough",
      "Mobilization/demobilization costs",
      "How everything rolls into the summary page"
    ],
    askThem: "Pull up a completed estimate and show me how you built the summary page. Explain each adjustment line — why that percentage, and what would change for a different project type.",
    impact: "Step 6 has 4 examples — none demonstrate the actual summary assembly process."
  },
  {
    id: 6,
    title: "Spec Reading and Markup",
    duration: "30-45 min",
    yieldLow: 20,
    yieldHigh: 25,
    stepsAddressed: ["Spec Analysis"],
    day1Status: "partial" as Day1Status,
    day1Note: "Session 2: the estimator shows Div 26 download, GPT extraction for approved manufacturers, copper/aluminum compliance, VE proposals. Missing: deep physical markup of a spec document, highlighting prohibitions, section-by-section walkthrough of what affects cost.",
    description: "How estimators read Division 26 specifications and identify items that affect the bid.",
    whatToCapture: [
      "How they navigate a spec document — what sections they check first",
      "Marking up prohibitions (die-cast fittings, no ceiling grid support)",
      "Identifying hidden scope ('drawings don't show every box')",
      "Sizing requirements that increase cost (3/4\" minimum, 1\" home runs)",
      "Communications conduit restrictions",
      "How they translate spec requirements into bid line items"
    ],
    askThem: "Open a spec you've recently bid and walk me through how you read it. Show me what you highlight, what you flag for pricing, and what you'd miss if you rushed.",
    impact: "Jerry currently scores 35.1% (F) on spec analysis — missing items worth $10,000-$50,000 per miss."
  }
];

// Priority 2 recordings (with Day 1 status)
const p2Recordings = [
  {
    id: 7,
    title: "Speed-Run Estimates (2-3 Estimators)",
    duration: "20-30 min each",
    yieldLow: 65,
    yieldHigh: 95,
    gap: "Bread & Butter",
    day1Status: "strong" as Day1Status,
    day1Note: "Session 2: the estimator shows natural takeoff on Cath Lab (complex). Session 3: the senior estimator walks through full temp control estimate — 'very basic, could train anybody'. VAV sensor counting, wire footage, labor hrs/unit. This IS bread & butter. Day 2: one more speed-run on a simple power/lighting job would be ideal but not critical.",
    description: "Routine, everyday estimating work on simple commercial jobs — the mundane work that fills 80% of an estimator's week.",
    whatToCapture: [
      "Counting devices from drawings at normal speed",
      "Standard labor units without special factors",
      "Wire and conduit sizing from tables (routine, not edge-case)",
      "Rules of thumb: 'I usually figure X outlets per office'",
      "Quick $/SF sanity check at the end"
    ],
    askThem: "Do a narrated speed-run of a simple estimate — a small office, retail, or restaurant. Don't overthink it, just show us how you'd normally work through it.",
    impact: "Bread & butter examples are 5% of training (target: 20%). This is the most boring footage imaginable — and exactly what we need."
  },
  {
    id: 8,
    title: "Fire Alarm Deep Dive",
    duration: "45-60 min",
    yieldLow: 25,
    yieldHigh: 35,
    gap: "Low Voltage",
    day1Status: "light" as Day1Status,
    day1Note: "Session 1: the senior reviewer briefly covers conduit requirements, duct detector remote test switches, J-hooks, 50ft device spacing. Day 2 need: full device-by-device walkthrough, SLC loops, NAC sizing, subcontractor scoping.",
    description: "Device-by-device fire alarm estimation including labor, SLC loops, NAC sizing, and AHJ coordination.",
    whatToCapture: [
      "How the client scopes fire alarm: design-build vs bid-spec vs subcontract",
      "Device labor: smoke detector, heat detector, horn/strobe, pull station",
      "Addressable loop design — SLC device counts per loop",
      "NAC circuit sizing and voltage drop",
      "Common gotchas: 'I forgot the duct detectors above the AHU'"
    ],
    askThem: "Walk me through how you estimate a fire alarm system from start to finish. Show me the devices, the labor, and where money gets lost.",
    impact: "Fire alarm has 12 training examples (need 25-30). Highest-priority LV gap."
  },
  {
    id: 9,
    title: "Structured Cabling Estimate",
    duration: "30-45 min",
    yieldLow: 20,
    yieldHigh: 30,
    gap: "Low Voltage",
    day1Status: "light" as Day1Status,
    day1Note: "Session 3: the senior estimator mentions structured cabling in McCormick context — cost codes, system breakdowns, cable vendor quotes for school project. No actual estimation walkthrough. Day 2: still needs a dedicated recording.",
    description: "Complete data infrastructure estimate — drops, telecom rooms, fiber backbone, testing/certification.",
    whatToCapture: [
      "Data drop counting from drawings (per room, per workstation)",
      "Complete drop labor: rough-in, pull, terminate, test/certify",
      "Telecom room buildout: grounding, backboard, racks, patch panels",
      "Cable selection: plenum vs riser, Cat6 vs Cat6A cost impact",
      "Pathway: J-hooks vs cable tray vs conduit differences"
    ],
    askThem: "Show me how you estimate structured cabling — from counting drops to the telecom room buildout.",
    impact: "Structured cabling has 9 training examples (need 20-25)."
  },
  {
    id: 10,
    title: "Security System Scoping",
    duration: "30-45 min",
    yieldLow: 20,
    yieldHigh: 25,
    gap: "Low Voltage",
    day1Status: "open" as Day1Status,
    day1Note: "Not covered in Day 1 recordings. This is a Day 2 priority.",
    description: "Camera systems, access control, and the Division 28 scope split.",
    whatToCapture: [
      "Camera counts — interior vs exterior labor differences",
      "Parking lot cameras: poles, underground conduit, distance issues",
      "Access control: card readers, door controllers, hardware coordination",
      "NVR/server room requirements: power, cooling, rack space",
      "Division 28 scope split: EC responsibility vs security sub"
    ],
    askThem: "How do you estimate a camera and access control system? Show me the scope split — what's your responsibility vs the security subcontractor.",
    impact: "Security has 10 training examples (need 20-25)."
  },
  {
    id: 11,
    title: "How I Verify Before I Bid",
    duration: "30-45 min",
    yieldLow: 15,
    yieldHigh: 25,
    gap: "RAG Verification",
    day1Status: "strong" as Day1Status,
    day1Note: "Sessions 1+2+3 all contribute. S1: 3,500 formula checking, wire-per-pipe math. S2: AI red flag checking, conductor math. S3: labor hrs/unit sanity check, $/SF comparison ($165 school vs $227), the project sponsor catching formula errors, cost code tracking. Day 2: nice-to-have for NECA vs experience conflicts, but well-covered.",
    description: "The verification and cross-checking process that catches bad data before it becomes a bad bid.",
    whatToCapture: [
      "How they verify material pricing (call distributor? check recent PO?)",
      "Reality-checking labor hours against experience",
      "What triggers 'this number doesn't feel right'",
      "Handling conflicting data between NECA book and actual experience",
      "Regional price adjustments from national averages"
    ],
    askThem: "Show me how you double-check an estimate before you submit it. What do you verify, how do you verify it, and what's caught you off guard before?",
    impact: "Jerry triggers LOOKUPs at 93% but only 9% correct reference rate. He needs to learn the gut-check instinct."
  },
  {
    id: 12,
    title: "POE, Telecom Power & Div 26/27/28 Coordination",
    duration: "40-60 min",
    yieldLow: 25,
    yieldHigh: 35,
    gap: "Low Voltage",
    day1Status: "open" as Day1Status,
    day1Note: "Not covered in Day 1 recordings. This is a Day 2 priority if low voltage estimators are available.",
    description: "The electrical side of low voltage — POE budgets, telecom room power, and multi-division scope coordination.",
    whatToCapture: [
      "POE switch power budgets: watts per port, ports per switch",
      "Circuit dedication per switch (don't overload with multiple POE switches)",
      "UPS sizing for network equipment",
      "How the client reads specs to determine Div 26/27/28 scope splits",
      "Where scope gaps hide between divisions",
      "NEC 725/760/800 separation requirements"
    ],
    askThem: "Walk me through the electrical coordination for low voltage systems — the power side and the scope boundaries between divisions.",
    impact: "POE has 3 examples, NEC LV articles has 3 examples, Div scope coordination is scattered."
  }
];

export default function JerryTrainingPage() {
  const [activeTab, setActiveTab] = useState<"visit" | "syllabus" | "sources" | "warmups" | "hooks">("visit");
  const [expandedRecording, setExpandedRecording] = useState<number | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const completedModules = syllabus.filter(m => m.status === "completed").length;
  const inProgressModules = syllabus.filter(m => m.status === "in_progress").length;

  const p1YieldLow = p1Recordings.reduce((sum, r) => sum + r.yieldLow, 0);
  const p1YieldHigh = p1Recordings.reduce((sum, r) => sum + r.yieldHigh, 0);
  const p2YieldLow = p2Recordings.reduce((sum, r) => sum + r.yieldLow, 0);
  const p2YieldHigh = p2Recordings.reduce((sum, r) => sum + r.yieldHigh, 0);
  const totalYieldLow = p1YieldLow + p2YieldLow;
  const totalYieldHigh = p1YieldHigh + p2YieldHigh;

  // Day 1 stats
  const day1FullCount = [...p1Recordings, ...p2Recordings].filter(r => r.day1Status === "full").length;
  const day1StrongCount = [...p1Recordings, ...p2Recordings].filter(r => r.day1Status === "strong").length;
  const day1PartialCount = [...p1Recordings, ...p2Recordings].filter(r => r.day1Status === "partial").length;
  const day1OpenCount = [...p1Recordings, ...p2Recordings].filter(r => r.day1Status === "open").length;
  const day1LightCount = [...p1Recordings, ...p2Recordings].filter(r => r.day1Status === "light").length;

  return (
    <>
      {/* Day 1 Results Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-5 mb-4 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="text-4xl">✅</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold">Day 1 Complete — 3 Sessions Recorded</h2>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">194 MIN CAPTURED</span>
            </div>
            <p className="text-green-100 mb-3">
              <strong>Senior Reviewer</strong> (66 min), <strong>Estimator</strong> (45 min), and <strong>Senior Estimator</strong> (83 min) recorded with the partner team.
              Estimated <strong>170-300 training examples</strong> from Day 1. OH&P gap now fully closed.
            </p>
            <div className="grid grid-cols-4 gap-3 mt-3">
              <div className="bg-white/15 rounded-lg p-2 text-center">
                <div className="text-xl font-bold text-green-200">{day1FullCount}</div>
                <div className="text-xs text-green-200">Fully Covered</div>
              </div>
              <div className="bg-white/15 rounded-lg p-2 text-center">
                <div className="text-xl font-bold text-green-200">{day1StrongCount}</div>
                <div className="text-xs text-green-200">Strong Coverage</div>
              </div>
              <div className="bg-white/15 rounded-lg p-2 text-center">
                <div className="text-xl font-bold text-yellow-200">{day1PartialCount + day1LightCount}</div>
                <div className="text-xs text-green-200">Partial / Light</div>
              </div>
              <div className="bg-white/15 rounded-lg p-2 text-center">
                <div className="text-xl font-bold text-red-200">{day1OpenCount}</div>
                <div className="text-xs text-green-200">Still Open</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Day 2 Focus Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-5 mb-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🎯</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold">Day 2 Focus — Low Voltage is the Last Frontier</h2>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">ACTION NEEDED</span>
            </div>
            <p className="text-orange-100 mb-3">
              Day 1 was exceptional — 3 sessions closed P1 gaps almost entirely (OH&P now FULL, scope letters FULL,
              senior review FULL, speed-runs STRONG). Day 2 should focus exclusively on the
              <strong> untouched low voltage systems</strong> — fire alarm, structured cabling, security. The senior estimator noted: &quot;Let the project sponsor do the fire alarm deep dive.&quot;
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div className="bg-white/15 rounded-lg p-2 text-center">
                <div className="text-lg font-bold">🔔 Fire Alarm</div>
                <div className="text-xs text-orange-200">The project sponsor is the expert</div>
              </div>
              <div className="bg-white/15 rounded-lg p-2 text-center">
                <div className="text-lg font-bold">📡 Data/Cabling</div>
                <div className="text-xs text-orange-200">Light coverage only</div>
              </div>
              <div className="bg-white/15 rounded-lg p-2 text-center">
                <div className="text-lg font-bold">🔒 Security</div>
                <div className="text-xs text-orange-200">Not started</div>
              </div>
              <div className="bg-white/15 rounded-lg p-2 text-center">
                <div className="text-lg font-bold">📋 Spec Markup</div>
                <div className="text-xs text-orange-200">Physical walkthrough</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">📚</div>
          <div>
            <p className="text-purple-800">
              <strong>Jerry's Training Curriculum:</strong> A 12-module program designed to transform Jerry from
              apprentice to expert electrical estimator. Each module builds on the previous, teaching Jerry to
              use his tools effectively while learning your company's business practices.
            </p>
          </div>
        </div>
      </div>

      {/* Jerry v3 Release Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-4 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🎯</div>
            <div>
              <div className="font-bold text-lg">Jerry v3 Released! 100% LOOKUP & H100 Trained</div>
              <p className="text-green-100 text-sm">
                +30.6% overall | 100% LOOKUP rate | 86.7% domain reasoning | H100 native BF16
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">81.4%</div>
            <div className="text-xs text-green-200">Overall Score</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-green-500 grid grid-cols-4 gap-4 text-center text-sm">
          <div>
            <div className="font-semibold">LOOKUP Rate</div>
            <div className="text-green-200">100% (perfect)</div>
          </div>
          <div>
            <div className="font-semibold">Domain Reasoning</div>
            <div className="text-green-200">86.7%</div>
          </div>
          <div>
            <div className="font-semibold">vs v2</div>
            <div className="text-green-200">50.8% → 81.4%</div>
          </div>
          <div>
            <div className="font-semibold">RAG Ready</div>
            <div className="text-green-200">Perfect!</div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{completedModules}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{inProgressModules}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-gray-600">{syllabus.length - completedModules - inProgressModules}</div>
          <div className="text-sm text-gray-600">Remaining</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {[
              { id: "visit", label: "On-Site Recordings", icon: "🎬" },
              { id: "syllabus", label: "Syllabus (12 Modules)", icon: "📋" },
              { id: "sources", label: "Content Sources (35)", icon: "📰" },
              { id: "warmups", label: "YouTube Warm-Ups (9)", icon: "▶️" },
              { id: "hooks", label: "Tool Hooks (6)", icon: "🔗" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "visit" && (
        <div className="space-y-6">
          {/* Day 1 Session Results */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-700 to-emerald-600 p-4 text-white">
              <h2 className="text-lg font-bold">Day 1 Recordings — Feb 10, 2026</h2>
              <p className="text-sm text-green-100 mt-1">3 sessions captured, ~194 minutes, est. 170-300 training examples. Click to expand.</p>
            </div>
            <div className="divide-y divide-gray-100">
              {day1Sessions.map((session) => {
                const isExpanded = expandedSession === session.id;
                return (
                  <div key={session.id}>
                    <button
                      onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                      className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm">
                            {session.id}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{session.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span>{session.duration}</span>
                              <span>|</span>
                              <span>{session.yieldEstimate}</span>
                              <span>|</span>
                              <span className="text-green-600 font-medium">{session.gapsCovered.length} gaps addressed</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-gray-400">{isExpanded ? "▲" : "▼"}</span>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-4">
                        {/* Gaps Covered */}
                        <div>
                          <h4 className="text-sm font-bold text-gray-800 mb-2">Training Gaps Addressed</h4>
                          <div className="space-y-2">
                            {session.gapsCovered.map((gc) => (
                              <div key={gc.gap} className="flex items-start gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold shrink-0 mt-0.5 ${
                                  gc.coverage === "full" ? "bg-green-100 text-green-700" :
                                  gc.coverage === "strong" ? "bg-blue-100 text-blue-700" :
                                  gc.coverage === "partial" ? "bg-amber-100 text-amber-700" :
                                  "bg-gray-100 text-gray-600"
                                }`}>
                                  {gc.coverage.toUpperCase()}
                                </span>
                                <div>
                                  <span className="text-sm font-medium text-gray-800">{gc.gap}</span>
                                  <p className="text-xs text-gray-600 mt-0.5">{gc.detail}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Key Highlights */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-bold text-gray-800 mb-2">Key Insights for Training Data</h4>
                          <div className="grid md:grid-cols-2 gap-1">
                            {session.highlights.map((h, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                                <span className="text-green-500 mt-0.5 shrink-0">&bull;</span>
                                <span>{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day 2 Priority Focus */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Day 2 Priorities — What&apos;s Still Open</h2>
            <p className="text-gray-600 text-sm mb-4">
              Day 1 closed most P1 gaps with 3 sessions (194 min). OH&P is now fully covered (Sessions 1+3), scope letters
              fully covered (Sessions 1+2+3), senior review fully covered (Session 1), and speed-runs are strong (Session 3 temp control).
              Day 2 should focus exclusively on <strong>low voltage systems</strong> and the remaining partial gaps.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                <h3 className="font-bold text-red-800 mb-2">Top Priority for Day 2</h3>
                <ul className="text-sm text-red-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-500 mt-0.5">1.</span>
                    <span><strong>Fire alarm deep dive with the project sponsor</strong> — the senior estimator said &quot;let the project sponsor do the fire alarm deep dive.&quot; Full device-by-device walkthrough, SLC loops, NAC sizing, subcontractor scoping</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-500 mt-0.5">2.</span>
                    <span><strong>Structured cabling estimate</strong> — data drops, telecom room, Cat6/6A, cable tray vs J-hooks (Session 3 only mentioned in passing via McCormick)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-500 mt-0.5">3.</span>
                    <span><strong>Security system scoping</strong> — cameras, access control, Division 28 split (completely untouched across all 3 sessions)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-500 mt-0.5">4.</span>
                    <span><strong>Spec markup physical walkthrough</strong> — open a spec, highlight section-by-section, show what affects cost (Day 1 showed GPT workflow but not manual reading)</span>
                  </li>
                </ul>
              </div>
              <div className="border-2 border-amber-200 rounded-lg p-4 bg-amber-50">
                <h3 className="font-bold text-amber-800 mb-2">If Time Allows</h3>
                <ul className="text-sm text-amber-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-amber-500 mt-0.5">5.</span>
                    <span><strong>POE / telecom power / Div coordination</strong> — switch power budgets, UPS sizing, scope gaps between divisions (not covered)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-amber-500 mt-0.5">6.</span>
                    <span><strong>Simple power/lighting speed-run</strong> — Session 3 covered temp control speed-run, but a basic office lighting/power estimate would round out bread & butter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-amber-500 mt-0.5">7.</span>
                    <span><strong>End-to-end Steps 6-9 on one project</strong> — Sessions covered pieces across multiple projects; one complete sequential walkthrough would be gold</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-green-800 mb-1">Do NOT Repeat on Day 2</h3>
              <p className="text-sm text-green-700">
                These gaps are <strong>fully covered</strong> from Day 1 — no need to record again:
                Senior reviewing junior estimate (Session 1), Scope letter walk-through (all 3 sessions),
                OH&P / profit margin discussion (Sessions 1+3), Estimate summary assembly (Sessions 1+3),
                ChatGPT/GPT workflow for bidding (Session 2), Temp control estimating (Session 3),
                McCormick vs Excel comparison (Session 3), Vendor quote workflow (Session 3).
              </p>
            </div>
          </div>

          {/* Priority 1: Critical Gaps */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">PRIORITY 1</span>
              <h2 className="text-xl font-bold text-gray-900">Critical Gaps — Estimation Flow</h2>
              <span className="text-sm text-gray-500">~4-5 hrs | {p1YieldLow}-{p1YieldHigh} examples</span>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <p className="text-gray-700 text-sm">
                Jerry gets stuck after Step 5 because he has almost no training data for the backend of the estimation process.
                These recordings teach Jerry how to finish what he starts.
              </p>
              {/* Current state visual */}
              <div className="mt-4 space-y-2">
                {[
                  { step: "Step 1-5: Scope → Takeoff → BOM → Pricing → Extending", have: 405, status: "strong" as const },
                  { step: "Step 6: Estimate Summary", have: 4, status: "critical" as const },
                  { step: "Step 7: Overhead & Profit", have: 1, status: "critical" as const },
                  { step: "Step 8: Bid Analysis", have: 118, status: "strong" as const },
                  { step: "Step 9: Proposal", have: 2, status: "critical" as const },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className="w-48 text-xs font-medium text-gray-700 truncate">{item.step}</div>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.status === "strong" ? "bg-green-500" : "bg-red-400"
                        }`}
                        style={{ width: `${Math.min(100, (item.have / 405) * 100)}%`, minWidth: item.have > 0 ? "4px" : "0" }}
                      />
                    </div>
                    <div className={`text-xs font-mono w-20 text-right ${
                      item.status === "critical" ? "text-red-600 font-bold" : "text-green-600"
                    }`}>
                      {item.have} examples
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {p1Recordings.map((recording) => {
                const statusColors = {
                  full: { bg: "bg-green-100", text: "text-green-700", label: "DAY 1: COVERED" },
                  strong: { bg: "bg-blue-100", text: "text-blue-700", label: "DAY 1: STRONG" },
                  partial: { bg: "bg-amber-100", text: "text-amber-700", label: "DAY 1: PARTIAL" },
                  light: { bg: "bg-orange-100", text: "text-orange-700", label: "DAY 1: LIGHT" },
                  open: { bg: "bg-red-100", text: "text-red-700", label: "OPEN" },
                };
                const sc = statusColors[recording.day1Status];
                return (
                <div key={recording.id} className={`bg-white rounded-lg shadow-md overflow-hidden ${
                  recording.day1Status === "full" ? "opacity-60" : ""
                }`}>
                  <button
                    onClick={() => setExpandedRecording(expandedRecording === recording.id ? null : recording.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        recording.day1Status === "full" ? "bg-green-100 text-green-700" :
                        recording.day1Status === "strong" ? "bg-blue-100 text-blue-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {recording.day1Status === "full" ? "✓" : recording.id}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{recording.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${sc.bg} ${sc.text}`}>
                            {sc.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span>{recording.duration}</span>
                          <span>|</span>
                          <span>{recording.yieldLow}-{recording.yieldHigh} examples</span>
                          <span>|</span>
                          <div className="flex gap-1">
                            {recording.stepsAddressed.map((step) => (
                              <span key={step} className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded text-xs">
                                {step}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="text-gray-400 text-lg">{expandedRecording === recording.id ? "−" : "+"}</span>
                  </button>
                  {expandedRecording === recording.id && (
                    <div className="px-4 pb-4 border-t">
                      {/* Day 1 Status Note */}
                      <div className={`mt-3 mb-3 rounded-lg p-3 border ${
                        recording.day1Status === "full" ? "bg-green-50 border-green-200" :
                        recording.day1Status === "strong" ? "bg-blue-50 border-blue-200" :
                        "bg-amber-50 border-amber-200"
                      }`}>
                        <p className={`text-sm font-medium ${
                          recording.day1Status === "full" ? "text-green-800" :
                          recording.day1Status === "strong" ? "text-blue-800" :
                          "text-amber-800"
                        }`}>
                          Day 1 Status: {recording.day1Note}
                        </p>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">{recording.description}</p>

                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">What to Capture:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {recording.whatToCapture.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-gray-400 mt-0.5">-</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <h4 className="text-sm font-semibold text-blue-800 mb-1">Ask the Estimator:</h4>
                        <p className="text-sm text-blue-700 italic">&quot;{recording.askThem}&quot;</p>
                      </div>

                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-sm text-orange-800"><strong>Impact:</strong> {recording.impact}</p>
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>

          {/* Priority 2: Major Gaps */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-bold">PRIORITY 2</span>
              <h2 className="text-xl font-bold text-gray-900">Major Gaps — Coverage & Verification</h2>
              <span className="text-sm text-gray-500">~5-6 hrs | {p2YieldLow}-{p2YieldHigh} examples</span>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <p className="text-gray-700 text-sm">
                Three sub-gaps that prevent Jerry from handling the full scope of work the client encounters:
                routine everyday estimating, low voltage systems, and data verification.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <div className="text-sm font-bold text-orange-800">Bread & Butter</div>
                  <div className="text-xs text-orange-600 mt-1">5% → ~12-13%</div>
                  <div className="text-xs text-gray-500">Routine daily work</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <div className="text-sm font-bold text-orange-800">Low Voltage</div>
                  <div className="text-xs text-orange-600 mt-1">8% → ~13.5%</div>
                  <div className="text-xs text-gray-500">FA, Data, Security</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <div className="text-sm font-bold text-orange-800">RAG Verify</div>
                  <div className="text-xs text-orange-600 mt-1">9% → ~25% correct</div>
                  <div className="text-xs text-gray-500">Gut-check instinct</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {p2Recordings.map((recording) => {
                const statusColors = {
                  full: { bg: "bg-green-100", text: "text-green-700", label: "DAY 1: COVERED" },
                  strong: { bg: "bg-blue-100", text: "text-blue-700", label: "DAY 1: STRONG" },
                  partial: { bg: "bg-amber-100", text: "text-amber-700", label: "DAY 1: PARTIAL" },
                  light: { bg: "bg-orange-100", text: "text-orange-700", label: "DAY 1: LIGHT" },
                  open: { bg: "bg-red-100", text: "text-red-700", label: "OPEN — DAY 2" },
                };
                const sc = statusColors[recording.day1Status];
                return (
                <div key={recording.id} className={`bg-white rounded-lg shadow-md overflow-hidden ${
                  recording.day1Status === "open" ? "ring-2 ring-red-300" : ""
                }`}>
                  <button
                    onClick={() => setExpandedRecording(expandedRecording === recording.id ? null : recording.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        recording.day1Status === "open" ? "bg-red-100 text-red-700" :
                        recording.day1Status === "partial" || recording.day1Status === "light" ? "bg-amber-100 text-amber-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {recording.id}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{recording.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${sc.bg} ${sc.text}`}>
                            {sc.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span>{recording.duration}</span>
                          <span>|</span>
                          <span>{recording.yieldLow}-{recording.yieldHigh} examples</span>
                          <span>|</span>
                          <span className="px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded text-xs">
                            {recording.gap}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-gray-400 text-lg">{expandedRecording === recording.id ? "−" : "+"}</span>
                  </button>
                  {expandedRecording === recording.id && (
                    <div className="px-4 pb-4 border-t">
                      {/* Day 1 Status Note */}
                      <div className={`mt-3 mb-3 rounded-lg p-3 border ${
                        recording.day1Status === "open" ? "bg-red-50 border-red-200" :
                        recording.day1Status === "partial" || recording.day1Status === "light" ? "bg-amber-50 border-amber-200" :
                        "bg-green-50 border-green-200"
                      }`}>
                        <p className={`text-sm font-medium ${
                          recording.day1Status === "open" ? "text-red-800" :
                          recording.day1Status === "partial" || recording.day1Status === "light" ? "text-amber-800" :
                          "text-green-800"
                        }`}>
                          Day 1 Status: {recording.day1Note}
                        </p>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">{recording.description}</p>

                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">What to Capture:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {recording.whatToCapture.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-gray-400 mt-0.5">-</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <h4 className="text-sm font-semibold text-blue-800 mb-1">Ask the Estimator:</h4>
                        <p className="text-sm text-blue-700 italic">&quot;{recording.askThem}&quot;</p>
                      </div>

                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-sm text-orange-800"><strong>Impact:</strong> {recording.impact}</p>
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>

          {/* Projected Impact */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <h2 className="text-xl font-bold mb-4">Projected Impact — If We Get Everything</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Dataset Growth</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-200">Current</span>
                      <span>944 examples</span>
                    </div>
                    <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white/60 rounded-full" style={{ width: "63%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-200">After Visit</span>
                      <span>~1,375 examples</span>
                    </div>
                    <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-green-400 rounded-full" style={{ width: "92%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-200">Target</span>
                      <span>1,500 examples</span>
                    </div>
                    <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white/40 rounded-full" style={{ width: "100%" }} />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Key Outcomes</h3>
                <ul className="text-sm text-blue-100 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-300 font-bold mt-0.5">+</span>
                    <span>Jerry can walk through a <strong>complete estimate end-to-end</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-300 font-bold mt-0.5">+</span>
                    <span><strong>OH&P and Proposal</strong> — two entirely new skills come online</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-300 font-bold mt-0.5">+</span>
                    <span>Low voltage <strong>triples</strong> in coverage (65 → ~185 examples)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-300 font-bold mt-0.5">+</span>
                    <span>Spec analysis improves from <strong>F (35%) to D+/C- (~60%)</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-300 font-bold mt-0.5">+</span>
                    <span>Sequential workflow capability — Jerry learns <strong>state transitions</strong></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Time Planning Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-bold text-gray-900">Recording Schedule by Time Available</h3>
              <p className="text-sm text-gray-600 mt-1">If time is limited, prioritize from the top down.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">What to Record</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Gaps Addressed</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { time: "2 hours", what: "Bread & butter speed-runs (2 estimators) + OH&P discussion", gaps: "Bucket balance + Step 7" },
                    { time: "4 hours", what: "Above + Fire alarm deep dive + Scope letter walkthrough", gaps: "+ LV (fire alarm) + Step 9" },
                    { time: "6 hours", what: "Above + Structured cabling + Security + Div coordination", gaps: "+ Most of LV coverage" },
                    { time: "8 hours", what: "Above + Verification process + Senior reviewing junior", gaps: "+ RAG verification + Step 8" },
                    { time: "Full day", what: "Above + POE/telecom + NEC LV + Steps 6-9 end-to-end", gaps: "All Priority 1 & 2 gaps" },
                  ].map((row, i) => (
                    <tr key={i} className={`border-b ${i === 4 ? "bg-green-50" : ""}`}>
                      <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{row.time}</td>
                      <td className="py-3 px-4 text-gray-700">{row.what}</td>
                      <td className="py-3 px-4 text-gray-600">{row.gaps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Line */}
          <div className="bg-gray-900 rounded-lg p-6 text-white">
            <h3 className="text-lg font-bold mb-2">The Bottom Line</h3>
            <p className="text-gray-300">
              After this visit, Jerry goes from <strong className="text-white">"can help with the first half of an estimate"</strong> to{" "}
              <strong className="text-green-400">"can walk through a complete estimate end-to-end with mentor oversight."</strong>{" "}
              The remaining gaps after this round are refinement work that can be addressed through processing of these recordings'
              secondary content — no additional on-site visit required.
            </p>
          </div>
        </div>
      )}

      {activeTab === "syllabus" && (
        <div className="space-y-4">
          {syllabus.map((module, index) => (
            <div key={module.id} className={`bg-white rounded-lg shadow-md overflow-hidden ${
              module.status === "in_progress" ? "ring-2 ring-purple-500" : ""
            }`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      module.status === "completed" ? "bg-green-500" :
                      module.status === "in_progress" ? "bg-purple-500" : "bg-gray-300"
                    }`}>
                      {module.status === "completed" ? "✓" : index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{module.id}: {module.name}</h3>
                      <p className="text-sm text-gray-600">{module.focus}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    module.status === "completed" ? "bg-green-100 text-green-800" :
                    module.status === "in_progress" ? "bg-purple-100 text-purple-800" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {module.status === "completed" ? "Completed" :
                     module.status === "in_progress" ? "In Progress" : "Not Started"}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <h4 className="font-medium text-gray-900 mb-2">Learning Outcomes</h4>
                  <p className="text-sm text-gray-700">{module.outcomes}</p>
                </div>

                {module.achievement && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                    <h4 className="font-medium text-green-800 mb-1 flex items-center gap-2">
                      <span>🎯</span> Achievement
                    </h4>
                    <p className="text-sm text-green-700">{module.achievement}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500 font-medium">Sources:</span>
                  {module.sources.map((source, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "sources" && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <p className="text-sm text-gray-600">
              Priority 5 sources are essential for core competency. Lower priorities provide supplementary depth.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Skill Area</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Priority</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tool Hooks</th>
                </tr>
              </thead>
              <tbody>
                {prioritySources.map((source) => (
                  <tr key={source.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-blue-600">{source.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{source.title}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {source.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{source.skillArea}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        source.priority === 5 ? "bg-red-100 text-red-800" :
                        source.priority === 4 ? "bg-orange-100 text-orange-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        P{source.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {source.toolHooks.slice(0, 2).map((hook, i) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded">
                            {hook}
                          </span>
                        ))}
                        {source.toolHooks.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            +{source.toolHooks.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50 border-t text-center text-sm text-gray-500">
            Showing top 10 priority sources. Full catalog contains 35 sources.
          </div>
        </div>
      )}

      {activeTab === "warmups" && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <p className="text-sm text-gray-600">
              Foundational videos for concepts Jerry needs before tackling estimation modules.
            </p>
          </div>
          <div className="divide-y">
            {warmUps.map((warmup) => (
              <div key={warmup.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">▶️</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-blue-600 text-sm">{warmup.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        warmup.priority >= 4 ? "bg-orange-100 text-orange-800" : "bg-gray-100 text-gray-600"
                      }`}>
                        P{warmup.priority}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{warmup.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">{warmup.track}:</span> {warmup.topic}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Channel: {warmup.channel}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "hooks" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-amber-800 text-sm">
              <strong>Key Insight:</strong> The AI Team emphasizes training Jerry to <strong>use specific tools</strong>,
              not just reason about problems. Each module teaches Jerry when and how to invoke these capabilities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {toolHooks.map((hook) => (
              <div key={hook.name} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">🔗</div>
                  <h3 className="font-bold text-gray-900">{hook.name}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{hook.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500 font-medium">Used in:</span>
                  {hook.modules.map((mod) => (
                    <span key={mod} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded font-medium">
                      {mod}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Training Philosophy */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Training Philosophy</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">What We're Teaching</h3>
            <ul className="text-sm text-blue-100 space-y-1">
              <li>- Tool-using behavior (when to invoke which capability)</li>
              <li>- Company-specific estimation practices</li>
              <li>- Industry-standard methods (NECA labor units)</li>
              <li>- Quality assurance and verification steps</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">How Jerry Learns</h3>
            <ul className="text-sm text-blue-100 space-y-1">
              <li>- Structured modules with clear outcomes</li>
              <li>- Real project examples from the client's history</li>
              <li>- The mentor's corrections become training data</li>
              <li>- On-site recordings of estimators in action</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
