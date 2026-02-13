"use client";

interface Tool {
  id: string;
  name: string;
  icon: string;
  status: "live" | "ready" | "planned";
  description: string;
  achievement: string;
  technology: string[];
  capabilities: string[];
  trainingModules: string[];
  metrics?: { label: string; value: string }[];
}

const tools: Tool[] = [
  {
    id: "eyes",
    name: "Eyes (Vision)",
    icon: "👁️",
    status: "live",
    description: "Jerry's most sophisticated capability - 9 specialized vision tools for reading drawings, specs, schedules, quotes, and more.",
    achievement: "9 vision sub-tools (4 live, 3 ready, 2 in development)",
    technology: [
      "Florence-2 vision model fine-tuned on electrical symbols",
      "PyMuPDF for vector PDF extraction",
      "openpyxl for Excel bid sheet parsing",
      "OCR with electrical domain training",
      "Table detection and extraction"
    ],
    capabilities: [
      "Symbol Detection - 99.1% accuracy, 124 types",
      "E-001 Legend Parsing - project-specific symbols",
      "Drawing Set Navigation - multi-sheet routing",
      "Schedule Extraction - panels, lighting, equipment",
      "Spec Reading - Division 26 cost drivers",
      "Excel Bid Sheet Parsing - Custom templates",
      "Vendor Quote Reading - pricing extraction",
      "→ See Vision page for full details"
    ],
    trainingModules: ["M-03: Plan navigation & symbols", "M-04: Lighting takeoff", "M-05: Power devices"],
    metrics: [
      { label: "Sub-Tools", value: "9" },
      { label: "Live", value: "4" },
      { label: "Accuracy", value: "99.1%" }
    ]
  },
  {
    id: "ears",
    name: "Ears (Listening)",
    icon: "👂",
    status: "live",
    description: "Jerry can listen to voice commands from the desktop, understanding natural language requests and converting speech to actionable commands.",
    achievement: "Fast, private speech recognition (~2.8s)",
    technology: [
      "Whisper (local) for speech-to-text",
      "Desktop push-to-talk with CapsLock key",
      "Audio stays on workstation (privacy)",
      "Natural language understanding via LLM"
    ],
    capabilities: [
      "Push-to-talk voice input",
      "~2.8 second transcription time",
      "Context-aware command processing",
      "Private - audio never leaves workstation",
      "Works with project/estimating terminology"
    ],
    trainingModules: ["M-01: Estimator onboarding"],
    metrics: [
      { label: "Transcription", value: "~2.8s" },
      { label: "Privacy", value: "Local" }
    ]
  },
  {
    id: "voice",
    name: "Voice (Communication)",
    icon: "🗣️",
    status: "live",
    description: "Jerry can speak responses with a natural, professional voice, providing audio feedback for hands-free operation.",
    achievement: "Natural-sounding voice responses",
    technology: [
      "ChatterBox TTS on dedicated GPU",
      "24kHz sample rate for quality audio",
      "Jerry voice profile: professional, clear, helpful",
      "15 cached acknowledgment phrases for speed"
    ],
    capabilities: [
      "Natural-sounding voice responses",
      "Sub-second response for common phrases",
      "Professional tone matching company culture",
      "Hands-free feedback while working",
      "Customizable voice personality"
    ],
    trainingModules: [],
    metrics: [
      { label: "Sample Rate", value: "24kHz" },
      { label: "Cached Phrases", value: "15" }
    ]
  },
  {
    id: "memory",
    name: "Memory (Knowledge)",
    icon: "🧠",
    status: "live",
    description: "Jerry remembers every estimate, project, and pricing pattern. He can instantly recall historical data to inform new bids.",
    achievement: "Instant recall of any past project",
    technology: [
      "ChromaDB vector store for semantic search",
      "RAG (Retrieval Augmented Generation)",
      "Ollama local LLM for inference",
      "Project fuzzy matching algorithms"
    ],
    capabilities: [
      "28 real estimates totaling $71.9M loaded",
      "Semantic search across all project history",
      "Historical pricing pattern analysis",
      "Estimator-specific insights and preferences",
      "Quick project comparison and lookup"
    ],
    trainingModules: ["M-08: Labor units & factoring", "M-10: Assemblies + estimating methods"],
    metrics: [
      { label: "Estimates", value: "28" },
      { label: "Bid Value", value: "$71.9M" }
    ]
  },
  {
    id: "hands",
    name: "Hands (Actions)",
    icon: "🖐️",
    status: "live",
    description: "Jerry can take actions on the workstation - opening folders, creating projects, launching files, and organizing documents.",
    achievement: "Direct workstation integration",
    technology: [
      "Windows API integration",
      "File system operations",
      "Application launching",
      "Desktop notifications via toast"
    ],
    capabilities: [
      "Open folders in Windows Explorer",
      "Create new project directory structures",
      "Open files and URLs in default apps",
      "Windows notification system",
      "Organize files by project/date"
    ],
    trainingModules: ["M-11: Excel template output"],
    metrics: []
  },
  {
    id: "learning",
    name: "Learning (Growth)",
    icon: "📈",
    status: "ready",
    description: "Jerry learns from every interaction. When the team corrects him, Jerry remembers and improves. This is the apprentice growth system.",
    achievement: "Entering training phase January 2026",
    technology: [
      "SFT (Supervised Fine-Tuning) infrastructure",
      "DPO (Direct Preference Optimization)",
      "LoRA adapters for efficient training",
      "8x V100 GPU cluster available",
      "Tiered adapter system (Industry/Company/User)"
    ],
    capabilities: [
      "Capture corrections as training data",
      "Learn from team feedback loop",
      "Continuous improvement over time",
      "Company-specific knowledge retention",
      "User preference learning"
    ],
    trainingModules: ["All 12 modules"],
    metrics: [
      { label: "GPUs", value: "8x V100" },
      { label: "Status", value: "Ready" }
    ]
  }
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case "live":
      return "bg-green-100 text-green-800 border-green-300";
    case "ready":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "planned":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "live": return "✅";
    case "ready": return "🔵";
    case "planned": return "🟡";
    default: return "⚪";
  }
};

export default function JerryToolsPage() {
  return (
    <>
      {/* Header */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <p className="text-purple-800">
          <strong>Jerry's Tools:</strong> These are the core capabilities that power Jerry. Each tool represents a
          skill that Jerry uses to assist with estimation work. Tools marked "Live" are in production; "Ready" means
          infrastructure is complete and awaiting training data.
        </p>
      </div>

      {/* Vision Deep Dive Banner */}
      <a href="/jerry/vision" className="block bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 mb-6 text-white hover:from-blue-700 hover:to-purple-700 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">👁️</div>
            <div>
              <div className="font-bold text-lg">Vision Deep Dive: 9 Specialized Tools</div>
              <p className="text-blue-100 text-sm">
                Jerry's Eyes are his most sophisticated capability - symbol detection, spec reading, Excel parsing, and more.
              </p>
            </div>
          </div>
          <div className="text-2xl">→</div>
        </div>
      </a>

      {/* Tools Grid */}
      <div className="space-y-6">
        {tools.map((tool) => (
          <div key={tool.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Tool Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{tool.icon}</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{tool.name}</h2>
                    <p className="text-gray-600 mt-1">{tool.description}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(tool.status)}`}>
                  {getStatusIcon(tool.status)} {tool.status.toUpperCase()}
                </span>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg inline-block">
                <span className="text-green-700 text-sm font-medium">✓ {tool.achievement}</span>
              </div>
            </div>

            {/* Tool Details */}
            <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Technology */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">⚙️</span> Technology Stack
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  {tool.technology.map((tech, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Capabilities */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">🎯</span> Capabilities
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  {tool.capabilities.map((cap, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      {cap}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Training & Metrics */}
              <div>
                {tool.metrics && tool.metrics.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-lg">📊</span> Key Metrics
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {tool.metrics.map((metric, i) => (
                        <div key={i} className="bg-gray-50 rounded p-2 text-center">
                          <div className="text-lg font-bold text-purple-600">{metric.value}</div>
                          <div className="text-xs text-gray-500">{metric.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tool.trainingModules.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-lg">📚</span> Training Modules
                    </h3>
                    <div className="space-y-1">
                      {tool.trainingModules.map((module, i) => (
                        <div key={i} className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {module}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Infrastructure Summary */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Production Infrastructure</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-green-600 font-semibold">Frontend</div>
            <div className="text-xs text-gray-500 mt-1">your-frontend.example.com</div>
            <div className="text-green-600 text-sm mt-2">✅ Live</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-green-600 font-semibold">Backend API</div>
            <div className="text-xs text-gray-500 mt-1">your-api.example.com</div>
            <div className="text-green-600 text-sm mt-2">✅ Live</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-green-600 font-semibold">Jerry Assistant</div>
            <div className="text-xs text-gray-500 mt-1">Port 8001</div>
            <div className="text-green-600 text-sm mt-2">✅ Live</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-green-600 font-semibold">TTS Voice</div>
            <div className="text-xs text-gray-500 mt-1">Port 8002</div>
            <div className="text-green-600 text-sm mt-2">✅ Live</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-green-600 font-semibold">Symbol Detection</div>
            <div className="text-xs text-gray-500 mt-1">99.1% accuracy</div>
            <div className="text-green-600 text-sm mt-2">✅ Live</div>
          </div>
        </div>
      </div>

      {/* Software Repositories */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Software Foundation (10 Repositories)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Repository</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Description</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "turbotech-platform-frontend", desc: "React web application (Next.js 15)", status: "production" },
                { name: "turbotech-platform-backend", desc: "FastAPI backend services", status: "production" },
                { name: "turbotech-jerry-assistant", desc: "Jerry's brain (RAG, Ollama)", status: "production" },
                { name: "turbotech-jerry-tools", desc: "Vision + TTS services", status: "production" },
                { name: "turbotech-jerry-training", desc: "ML training (SFT/DPO/LoRA)", status: "ready" },
                { name: "turbotech-jerry-estimator", desc: "Excel workbook parser", status: "ready" },
                { name: "turbotech-desktop-agent", desc: "Windows voice assistant", status: "production" },
                { name: "turbotech-docs", desc: "Documentation & PRDs", status: "active" },
                { name: "turbotech-platform", desc: "Platform architecture", status: "foundation" },
                { name: "turbotech-projectportal", desc: "Project management portal", status: "production" }
              ].map((repo) => (
                <tr key={repo.name} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3 font-mono text-blue-600">{repo.name}</td>
                  <td className="py-2 px-3 text-gray-600">{repo.desc}</td>
                  <td className="py-2 px-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      repo.status === "production" ? "bg-green-100 text-green-800 border-green-300" :
                      repo.status === "ready" ? "bg-blue-100 text-blue-800 border-blue-300" :
                      repo.status === "active" ? "bg-purple-100 text-purple-800 border-purple-300" :
                      "bg-yellow-100 text-yellow-800 border-yellow-300"
                    }`}>
                      {repo.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
