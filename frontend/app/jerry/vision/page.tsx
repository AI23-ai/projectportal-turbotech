"use client";

interface VisionTool {
  id: string;
  name: string;
  icon: string;
  status: "live" | "ready" | "development" | "planned";
  description: string;
  accuracy?: string;
  capabilities: string[];
  technology: string[];
  useCases: string[];
  metrics?: { label: string; value: string }[];
}

const visionTools: VisionTool[] = [
  {
    id: "symbol-detection",
    name: "Electrical Symbol Detection",
    icon: "🔌",
    status: "live",
    description: "Jerry can identify and count electrical symbols on construction drawings with 99.1% accuracy - up from 75% at project start.",
    accuracy: "99.1%",
    capabilities: [
      "Detect 124 electrical symbol types",
      "Count symbols by type and location",
      "Handle both vector and raster PDFs",
      "Process multiple sheets in a set",
      "Confidence scoring for each detection"
    ],
    technology: [
      "Florence-2 vision model (fine-tuned)",
      "PyMuPDF for vector PDF extraction",
      "Pattern-based symbol matching",
      "Context-aware classification"
    ],
    useCases: [
      "Lighting fixture counts for takeoff",
      "Receptacle and device counting",
      "Panel and equipment identification",
      "Comparing bid vs construction sets"
    ],
    metrics: [
      { label: "Accuracy", value: "99.1%" },
      { label: "Symbol Types", value: "124" },
      { label: "Demo Count", value: "219" }
    ]
  },
  {
    id: "legend-parsing",
    name: "E-001 Legend Parsing",
    icon: "📋",
    status: "live",
    description: "Jerry reads the electrical legend sheet (E-001) first - just like a human estimator - to understand project-specific symbol definitions.",
    accuracy: "98%",
    capabilities: [
      "Extract symbol definitions from legends",
      "Build project-specific symbol dictionary",
      "Parse abbreviation tables",
      "Identify manufacturer specifications",
      "Cross-reference with equipment schedules"
    ],
    technology: [
      "OCR with electrical domain training",
      "Table structure recognition",
      "Symbol-to-definition mapping",
      "Fuzzy matching for variations"
    ],
    useCases: [
      "Understanding project-specific symbols",
      "Identifying non-standard notations",
      "Building accurate takeoff lists",
      "Spec compliance verification"
    ],
    metrics: [
      { label: "Accuracy", value: "98%" },
      { label: "Abbreviations", value: "119" },
      { label: "Symbol Defs", value: "100+" }
    ]
  },
  {
    id: "drawing-navigation",
    name: "Drawing Set Navigation",
    icon: "🗺️",
    status: "live",
    description: "Jerry can navigate multi-sheet drawing sets, finding the right sheets for each task and cross-referencing between plans.",
    capabilities: [
      "Identify sheet types (E-001, E-101, etc.)",
      "Navigate floor-by-floor plans",
      "Find detail references",
      "Track revision clouds and changes",
      "Match sheets across bid vs construction"
    ],
    technology: [
      "Sheet naming convention parsing",
      "Title block extraction",
      "Cross-reference detection",
      "Revision tracking algorithms"
    ],
    useCases: [
      "Finding all lighting plans",
      "Locating panel schedule sheets",
      "Tracking drawing revisions",
      "Comparing document sets"
    ],
    metrics: [
      { label: "Sheet Types", value: "15+" },
      { label: "Projects", value: "15" }
    ]
  },
  {
    id: "schedule-extraction",
    name: "Schedule Extraction",
    icon: "📊",
    status: "live",
    description: "Jerry reads panel schedules, lighting schedules, and equipment schedules to extract structured data for estimation.",
    capabilities: [
      "Parse panel schedule tables",
      "Extract lighting fixture schedules",
      "Read equipment schedules",
      "Identify circuit assignments",
      "Calculate load summaries"
    ],
    technology: [
      "Table detection and parsing",
      "Cell content extraction",
      "Header recognition",
      "Data normalization"
    ],
    useCases: [
      "Panel sizing and pricing",
      "Fixture type identification",
      "Equipment specification lookup",
      "Load calculation verification"
    ],
    metrics: [
      { label: "Schedule Types", value: "5" },
      { label: "Accuracy", value: "95%" }
    ]
  },
  {
    id: "spec-reading",
    name: "Specification Reading",
    icon: "📖",
    status: "ready",
    description: "Jerry reads Division 26 electrical specifications to identify cost-driving requirements and scope clarifications.",
    capabilities: [
      "Parse Division 26 spec structure",
      "Identify cost-driving clauses",
      "Extract product requirements",
      "Flag scope clarification items",
      "Cross-reference with drawings"
    ],
    technology: [
      "PDF text extraction",
      "Section structure parsing",
      "Keyword identification",
      "Requirement classification"
    ],
    useCases: [
      "Identifying dimming requirements",
      "Finding warranty obligations",
      "Spotting testing requirements",
      "Flagging unusual specifications"
    ],
    metrics: [
      { label: "Status", value: "Ready" },
      { label: "Divisions", value: "26, 27, 28" }
    ]
  },
  {
    id: "excel-parsing",
    name: "Excel Bid Sheet Parsing",
    icon: "📑",
    status: "ready",
    description: "Jerry can read and write your company's Excel estimate templates, understanding the structure and formatting requirements.",
    capabilities: [
      "Parse existing estimate workbooks",
      "Extract line item details",
      "Understand formula structures",
      "Read material lists and BOMs",
      "Write formatted estimate output"
    ],
    technology: [
      "openpyxl for Excel processing",
      "Template structure mapping",
      "Formula preservation",
      "Style and formatting handling"
    ],
    useCases: [
      "Importing historical estimates",
      "Generating new estimates",
      "Comparing estimate versions",
      "Extracting pricing patterns"
    ],
    metrics: [
      { label: "Repository", value: "jerry-estimator" },
      { label: "Status", value: "Ready" }
    ]
  },
  {
    id: "quote-reading",
    name: "Vendor Quote Reading",
    icon: "💰",
    status: "ready",
    description: "Jerry can read vendor quotes and supplier pricing sheets to extract material costs and availability.",
    capabilities: [
      "Extract pricing from quote PDFs",
      "Identify part numbers and descriptions",
      "Parse quantity and unit pricing",
      "Recognize vendor formatting variations",
      "Match items to estimate line items"
    ],
    technology: [
      "PDF text and table extraction",
      "Price pattern recognition",
      "Part number matching",
      "Multi-format handling"
    ],
    useCases: [
      "Material cost updates",
      "Quote comparison",
      "Historical pricing lookup",
      "Vendor selection support"
    ],
    metrics: [
      { label: "Vendors", value: "5+" },
      { label: "Quote Types", value: "Multiple" }
    ]
  },
  {
    id: "packing-slip",
    name: "Packing Slip Recognition",
    icon: "📦",
    status: "development",
    description: "Jerry will read packing slips and delivery documents to track material receipts against estimates.",
    capabilities: [
      "Extract delivery information",
      "Match items to purchase orders",
      "Identify quantity discrepancies",
      "Track partial deliveries",
      "Update inventory status"
    ],
    technology: [
      "Document classification",
      "OCR for varied formats",
      "PO matching algorithms",
      "Inventory integration"
    ],
    useCases: [
      "Delivery verification",
      "Material tracking",
      "Invoice reconciliation",
      "Project cost tracking"
    ],
    metrics: [
      { label: "Status", value: "In Development" }
    ]
  },
  {
    id: "photo-analysis",
    name: "Job Site Photo Analysis",
    icon: "📸",
    status: "planned",
    description: "Future capability: Jerry will analyze job site photos to verify installations and identify issues.",
    capabilities: [
      "Identify installed equipment",
      "Compare to drawing specifications",
      "Flag installation issues",
      "Track progress visually",
      "Document conditions"
    ],
    technology: [
      "Image classification",
      "Object detection",
      "Comparison algorithms",
      "Mobile integration"
    ],
    useCases: [
      "Installation verification",
      "Progress documentation",
      "Issue identification",
      "As-built comparison"
    ],
    metrics: [
      { label: "Status", value: "Planned" }
    ]
  }
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case "live":
      return "bg-green-100 text-green-800 border-green-300";
    case "ready":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "development":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "planned":
      return "bg-gray-100 text-gray-800 border-gray-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "live": return "✅";
    case "ready": return "🔵";
    case "development": return "🟡";
    case "planned": return "⚪";
    default: return "⚪";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "live": return "LIVE";
    case "ready": return "READY";
    case "development": return "IN DEV";
    case "planned": return "PLANNED";
    default: return status.toUpperCase();
  }
};

export default function JerryVisionPage() {
  const liveTools = visionTools.filter(t => t.status === "live");
  const readyTools = visionTools.filter(t => t.status === "ready");
  const developmentTools = visionTools.filter(t => t.status === "development");
  const plannedTools = visionTools.filter(t => t.status === "planned");

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6 text-white">
        <div className="flex items-center gap-4">
          <div className="text-5xl">👁️</div>
          <div>
            <h1 className="text-2xl font-bold">Jerry's Eyes: Vision Capabilities</h1>
            <p className="text-blue-100 mt-1">
              A deep dive into what Jerry can see and understand. These tools represent significant
              AI engineering investment to give Jerry the ability to read construction documents like an expert.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{liveTools.length}</div>
          <div className="text-sm text-gray-600">Live Tools</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{readyTools.length}</div>
          <div className="text-sm text-gray-600">Ready to Deploy</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-yellow-600">{developmentTools.length}</div>
          <div className="text-sm text-gray-600">In Development</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-gray-600">{plannedTools.length}</div>
          <div className="text-sm text-gray-600">Planned</div>
        </div>
      </div>

      {/* Key Achievement Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🎯</div>
          <div>
            <div className="font-bold text-green-900">Key Achievement: 99.1% Symbol Detection Accuracy</div>
            <p className="text-green-700 text-sm">
              Started at 75%, achieved 99.1% through Florence-2 fine-tuning on electrical symbols.
              Jerry can now reliably count fixtures, devices, and equipment across 15 real client projects.
            </p>
          </div>
        </div>
      </div>

      {/* Live Tools */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-green-500">✅</span> Live Vision Tools ({liveTools.length})
        </h2>
        <div className="space-y-4">
          {liveTools.map((tool) => (
            <VisionToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>

      {/* Ready Tools */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-blue-500">🔵</span> Ready to Deploy ({readyTools.length})
        </h2>
        <p className="text-gray-600 mb-4">
          These tools are built and tested, ready for integration into Jerry's workflow.
        </p>
        <div className="space-y-4">
          {readyTools.map((tool) => (
            <VisionToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>

      {/* Development Tools */}
      {developmentTools.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-yellow-500">🟡</span> In Development ({developmentTools.length})
          </h2>
          <div className="space-y-4">
            {developmentTools.map((tool) => (
              <VisionToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      )}

      {/* Planned Tools */}
      {plannedTools.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-gray-500">⚪</span> Planned ({plannedTools.length})
          </h2>
          <div className="space-y-4">
            {plannedTools.map((tool) => (
              <VisionToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      )}

      {/* Technology Stack Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Vision Technology Stack</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-purple-500">🧠</span> AI Models
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                Florence-2 (fine-tuned for electrical)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                OCR with domain-specific training
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                Table detection models
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                Document classification
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-500">📄</span> Document Processing
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                PyMuPDF for vector PDFs
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                openpyxl for Excel files
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                Multi-format handling
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                Batch processing support
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-green-500">⚡</span> Performance
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                &lt;3 seconds per drawing
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                GPU acceleration available
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                Parallel sheet processing
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                Confidence thresholds
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* What This Means */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-md p-6 text-white">
        <h2 className="text-xl font-bold mb-4">What This Means for Your Company</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Before Jerry's Eyes</h3>
            <ul className="text-sm text-purple-100 space-y-1">
              <li>• Manual symbol counting on every sheet</li>
              <li>• Hours spent on takeoff for each project</li>
              <li>• Human error in counts and classifications</li>
              <li>• Inconsistent results across estimators</li>
              <li>• Difficult to compare document revisions</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">With Jerry's Eyes</h3>
            <ul className="text-sm text-blue-100 space-y-1">
              <li>• Automated symbol detection at 99.1% accuracy</li>
              <li>• Minutes instead of hours for takeoff</li>
              <li>• Consistent, repeatable results</li>
              <li>• Same accuracy regardless of project size</li>
              <li>• Instant comparison of bid vs construction sets</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

function VisionToolCard({ tool }: { tool: VisionTool }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{tool.icon}</div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{tool.name}</h3>
              {tool.accuracy && (
                <span className="text-sm text-green-600 font-medium">{tool.accuracy} accuracy</span>
              )}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(tool.status)}`}>
            {getStatusIcon(tool.status)} {getStatusLabel(tool.status)}
          </span>
        </div>

        <p className="text-gray-600 mb-4">{tool.description}</p>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Capabilities */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Capabilities</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {tool.capabilities.slice(0, 4).map((cap, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-green-500 text-xs mt-1">✓</span>
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Use Cases */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Use Cases</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {tool.useCases.slice(0, 4).map((use, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-blue-500 text-xs mt-1">→</span>
                  <span>{use}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Metrics */}
          {tool.metrics && tool.metrics.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Metrics</h4>
              <div className="space-y-2">
                {tool.metrics.map((metric, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-500">{metric.label}</span>
                    <span className="font-semibold text-purple-600">{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
