"use client";

import { useState } from "react";

interface LookupTag {
  tag: string;
  freq: number;
  purpose: string;
}

interface TagCategory {
  name: string;
  icon: string;
  description: string;
  color: string;
  tags: LookupTag[];
}

const LOOKUP_CATEGORIES: TagCategory[] = [
  {
    name: "Core Estimating Databases",
    icon: "📊",
    description: "Primary data sources for electrical estimation - the foundation of Jerry's knowledge",
    color: "blue",
    tags: [
      { tag: "labor_units", freq: 292, purpose: "Base labor hours for electrical tasks (install receptacle, pull wire, mount panel, etc.)" },
      { tag: "material_pricing", freq: 206, purpose: "Current pricing for electrical materials (wire, conduit, devices, equipment)" },
      { tag: "labor_factors", freq: 200, purpose: "Multipliers for job conditions (height, temperature, confined space, travel, torque requirements)" },
      { tag: "spec_section", freq: 153, purpose: "Division 26 specification sections and requirements from project documents" },
      { tag: "specifications", freq: 99, purpose: "General project specifications and scope requirements" },
      { tag: "historical_bids", freq: 29, purpose: "Past bid data for similar projects to validate estimates and pricing" },
      { tag: "vendor_catalogs", freq: 5, purpose: "Manufacturer product data, cut sheets, and equipment specifications" },
    ],
  },
  {
    name: "Business Operations",
    icon: "💼",
    description: "Contract terms, pricing strategies, and operational references",
    color: "purple",
    tags: [
      { tag: "terms_and_conditions", freq: 7, purpose: "Contract language, exclusions, and proposal boilerplate" },
      { tag: "pricing_strategy", freq: 7, purpose: "Markup strategies, competitive positioning, profit margin guidance" },
      { tag: "historical_jobs", freq: 4, purpose: "Completed project data for productivity analysis and lessons learned" },
      { tag: "company_oh_rates", freq: 3, purpose: "Overhead rates, burden calculations, indirect costs" },
      { tag: "state_licensing_requirements", freq: 2, purpose: "Electrical contractor licensing requirements by state" },
      { tag: "contractor_state_license_board", freq: 1, purpose: "CSLB and state licensing board references" },
      { tag: "contract_docs", freq: 1, purpose: "Contract document interpretation and analysis" },
      { tag: "change_order", freq: 1, purpose: "Change order pricing and documentation" },
    ],
  },
  {
    name: "NEC Code References (High Frequency)",
    icon: "📖",
    description: "Most commonly referenced National Electrical Code articles",
    color: "amber",
    tags: [
      { tag: "nec_220", freq: 49, purpose: "Branch Circuit & Feeder Calculations - Load calculations, demand factors" },
      { tag: "nec_chapter_9", freq: 35, purpose: "Tables - Conduit fill, wire properties, conductor sizing" },
      { tag: "nec_230", freq: 18, purpose: "Services - Service entrance, metering, disconnects" },
      { tag: "nec_250", freq: 16, purpose: "Grounding & Bonding - Ground electrode systems, equipment grounding" },
      { tag: "nec_210", freq: 15, purpose: "Branch Circuits - Receptacle spacing, circuit requirements" },
      { tag: "nec_760", freq: 12, purpose: "Fire Alarm Systems - Power-limited fire alarm circuits" },
      { tag: "nec_625", freq: 12, purpose: "EV Charging - Electric vehicle charging equipment" },
      { tag: "nec_430", freq: 12, purpose: "Motors - Motor circuits, overload protection, disconnects" },
      { tag: "nec_705", freq: 10, purpose: "Interconnected Power Sources - Solar/generator interconnection" },
      { tag: "nec_725", freq: 9, purpose: "Class 1/2/3 Circuits - Remote control, signaling, power-limited" },
      { tag: "nec_310", freq: 9, purpose: "Conductors - Ampacity tables, conductor sizing" },
      { tag: "nec_706", freq: 8, purpose: "Energy Storage Systems - Battery systems" },
      { tag: "nec_690", freq: 8, purpose: "Solar PV Systems - Photovoltaic installations" },
      { tag: "nec_700", freq: 7, purpose: "Emergency Systems - Emergency power requirements" },
      { tag: "nec_code", freq: 6, purpose: "General NEC reference (non-specific article)" },
      { tag: "nec_800", freq: 6, purpose: "Communications Circuits - Telecom, data cabling" },
      { tag: "nec_517", freq: 6, purpose: "Healthcare Facilities - Hospital/medical electrical requirements" },
      { tag: "nec_450", freq: 5, purpose: "Transformers - Transformer installation and protection" },
      { tag: "nec_240", freq: 5, purpose: "Overcurrent Protection - Breakers, fuses, coordination" },
      { tag: "nec_110", freq: 5, purpose: "General Requirements - Workspace, clearances, installation" },
    ],
  },
  {
    name: "NEC Code References (Lower Frequency)",
    icon: "📚",
    description: "Specialized NEC articles for specific applications",
    color: "orange",
    tags: [
      { tag: "nec_chapter_8", freq: 4, purpose: "Communications systems chapters" },
      { tag: "nec_chapter_7", freq: 4, purpose: "Special conditions chapters" },
      { tag: "nec_chapter_3", freq: 4, purpose: "Wiring methods chapters" },
      { tag: "nec_300", freq: 4, purpose: "Wiring Methods - General installation requirements" },
      { tag: "nec_440", freq: 3, purpose: "Air Conditioning - A/C and refrigeration equipment" },
      { tag: "nec_408", freq: 3, purpose: "Switchboards & Panelboards - Panel installation" },
      { tag: "nec_702", freq: 2, purpose: "Optional Standby Systems - Backup power" },
      { tag: "nec_680", freq: 2, purpose: "Swimming Pools - Pool, spa, fountain electrical" },
      { tag: "nec_645", freq: 2, purpose: "Data Centers - IT equipment rooms" },
      { tag: "nec_547", freq: 2, purpose: "Agricultural Buildings - Farm electrical" },
      { tag: "nec_500", freq: 2, purpose: "Hazardous Locations - Classified areas" },
      { tag: "nec_410", freq: 2, purpose: "Luminaires - Lighting fixtures" },
      { tag: "nec_406", freq: 2, purpose: "Receptacles - Receptacle installation" },
      { tag: "nec_215", freq: 2, purpose: "Feeders - Feeder calculations" },
    ],
  },
  {
    name: "NEC 2026 Updates",
    icon: "🆕",
    description: "New and updated requirements for the 2026 code cycle",
    color: "green",
    tags: [
      { tag: "nec_2026_article_750", freq: 2, purpose: "New article for premises-connected systems" },
      { tag: "nec_2026_updates", freq: 1, purpose: "Summary of 2026 code cycle changes" },
      { tag: "nec_2026_summary", freq: 1, purpose: "Overview of major 2026 changes" },
      { tag: "nec_2026_reorganization_map", freq: 1, purpose: "Article renumbering crosswalk" },
      { tag: "nec_2026_reorganization", freq: 1, purpose: "Structural changes in 2026 edition" },
      { tag: "nec_2026_pcs_requirements", freq: 1, purpose: "Premises-connected system requirements" },
      { tag: "nec_2026_labeling", freq: 1, purpose: "New labeling requirements" },
      { tag: "nec_2026_documentation", freq: 1, purpose: "Documentation requirements" },
      { tag: "nec_afci_requirements_2026", freq: 1, purpose: "Updated AFCI requirements" },
    ],
  },
  {
    name: "Other Standards",
    icon: "📋",
    description: "NFPA, IEEE, and other industry standards",
    color: "indigo",
    tags: [
      { tag: "nfpa_70b", freq: 4, purpose: "Recommended Practice for Electrical Equipment Maintenance" },
      { tag: "nfpa_855", freq: 1, purpose: "Energy Storage Systems standard" },
      { tag: "nfpa_72", freq: 1, purpose: "National Fire Alarm Code" },
      { tag: "nfpa_70e", freq: 1, purpose: "Electrical Safety in the Workplace" },
      { tag: "ieee_1547", freq: 1, purpose: "Interconnection standard for distributed resources" },
    ],
  },
  {
    name: "Specification Sections",
    icon: "📄",
    description: "CSI MasterFormat Division 26 specification references",
    color: "teal",
    tags: [
      { tag: "spec_section_26_05_73", freq: 2, purpose: "Power system studies" },
      { tag: "spec_section_26_27", freq: 1, purpose: "Low voltage distribution" },
      { tag: "spec_section_26_05_33", freq: 1, purpose: "Raceway and boxes" },
    ],
  },
];

const SUMMARY_STATS = [
  { category: "Core Estimating", uniqueTags: 7, totalUses: 784 },
  { category: "Business Operations", uniqueTags: 8, totalUses: 54 },
  { category: "NEC Articles", uniqueTags: 65, totalUses: 361 },
  { category: "Other Standards", uniqueTags: 5, totalUses: 8 },
];

const PRIORITIES = [
  {
    level: 1,
    name: "High Volume (Build First)",
    color: "red",
    items: [
      "labor_units - 292 uses",
      "material_pricing - 206 uses",
      "labor_factors - 200 uses",
      "spec_section / specifications - 252 uses combined",
    ],
  },
  {
    level: 2,
    name: "NEC Core",
    color: "amber",
    items: [
      "nec_220, nec_230, nec_250, nec_210 (branch/service/grounding)",
      "nec_chapter_9 (tables)",
      "nec_310 (conductor sizing)",
    ],
  },
  {
    level: 3,
    name: "Specialty Systems",
    color: "blue",
    items: [
      "nec_625 (EV charging)",
      "nec_690, nec_705, nec_706 (solar/storage)",
      "nec_725, nec_760, nec_800 (low voltage)",
    ],
  },
];

export default function LookupTagsPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Core Estimating Databases");

  const totalTags = SUMMARY_STATS.reduce((sum, s) => sum + s.uniqueTags, 0);
  const totalUses = SUMMARY_STATS.reduce((sum, s) => sum + s.totalUses, 0);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
      blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-800" },
      purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-100 text-purple-800" },
      amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-800" },
      orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-100 text-orange-800" },
      green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-100 text-green-800" },
      indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-800" },
      teal: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", badge: "bg-teal-100 text-teal-800" },
      red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-800" },
    };
    return colors[color] || colors.blue;
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          LOOKUP Tag Library - Jerry v3
        </h2>
        <p className="text-gray-600">
          Jerry's knowledge retrieval system - the tags that trigger information lookups during reasoning
        </p>
      </div>

      {/* Explanation Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🧠</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How LOOKUP Tags Work
            </h3>
            <p className="text-gray-700 mb-3">
              When Jerry reasons through an estimation problem, he generates special <code className="bg-purple-100 px-1.5 py-0.5 rounded text-purple-800 text-sm">&lt;LOOKUP:tag_name&gt;</code> tags
              in his thinking process. These tags signal that Jerry needs to retrieve specific information before continuing.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="font-semibold text-purple-700 mb-1">1. Jerry Thinks</div>
                <p className="text-gray-600">"I need the labor rate for installing a 200A panel..."</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="font-semibold text-purple-700 mb-1">2. LOOKUP Generated</div>
                <p className="text-gray-600"><code className="text-xs">&lt;LOOKUP:labor_units&gt;</code> triggers database query</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="font-semibold text-purple-700 mb-1">3. Jerry Continues</div>
                <p className="text-gray-600">With real data: "Panel install = 8.5 labor hours..."</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-purple-600">{totalTags}</div>
          <div className="text-sm text-gray-600">Unique Tags</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-blue-600">{totalUses.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Uses in Training</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-green-600">93%</div>
          <div className="text-sm text-gray-600">LOOKUP Accuracy (v2)</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-amber-600">7</div>
          <div className="text-sm text-gray-600">Tag Categories</div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📊</span> Summary by Category
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Unique Tags</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Uses</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">% of Training</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {SUMMARY_STATS.map((stat, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{stat.category}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">{stat.uniqueTags}</td>
                  <td className="px-6 py-4 text-sm text-center font-semibold text-gray-900">{stat.totalUses}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">
                    {Math.round((stat.totalUses / totalUses) * 100)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-purple-50 font-semibold">
                <td className="px-6 py-4 text-sm text-purple-900">Total</td>
                <td className="px-6 py-4 text-sm text-center text-purple-900">{totalTags}</td>
                <td className="px-6 py-4 text-sm text-center text-purple-900">{totalUses.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-center text-purple-900">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Implementation Priority */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🎯</span> Database Implementation Priority
          </h3>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {PRIORITIES.map((priority) => {
              const colors = getColorClasses(priority.color);
              return (
                <div key={priority.level} className={`rounded-lg border-2 ${colors.border} overflow-hidden`}>
                  <div className={`px-4 py-2 ${colors.bg}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-full ${colors.badge} flex items-center justify-center font-bold`}>
                        {priority.level}
                      </span>
                      <h4 className={`font-semibold ${colors.text}`}>{priority.name}</h4>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <ul className="space-y-2">
                      {priority.items.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className={colors.text}>•</span>
                          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{item}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full Tag Library */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>📚</span> Complete Tag Library
        </h3>

        {LOOKUP_CATEGORIES.map((category) => {
          const colors = getColorClasses(category.color);
          const isExpanded = expandedCategory === category.name;
          const categoryTotal = category.tags.reduce((sum, t) => sum + t.freq, 0);

          return (
            <div key={category.name} className={`rounded-lg border ${colors.border} overflow-hidden`}>
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.name)}
                className={`w-full px-6 py-4 ${colors.bg} flex items-center justify-between hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-lg font-bold ${colors.text}`}>{category.tags.length} tags</div>
                    <div className="text-sm text-gray-500">{categoryTotal} uses</div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="bg-white">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tag</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">Freq</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {category.tags.map((tag, idx) => (
                        <tr key={tag.tag} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-6 py-3">
                            <code className={`text-sm px-2 py-1 rounded ${colors.badge}`}>{tag.tag}</code>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className={`font-semibold ${colors.text}`}>{tag.freq}</span>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700">{tag.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span>🔮</span> What's Next: Jerry v3 RAG Integration
        </h3>
        <p className="text-gray-700 mb-3">
          With Jerry v2's 93% LOOKUP accuracy, we're ready to build the actual retrieval system. Each tag will connect to:
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-purple-700 mb-2">Your Company's Internal Data</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Labor unit database from 30+ years of projects</li>
              <li>• Historical bid data and win/loss analysis</li>
              <li>• Vendor pricing agreements</li>
              <li>• Company-specific overhead rates</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-purple-700 mb-2">Industry References</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• NEC 2023/2026 code database</li>
              <li>• RS Means labor data</li>
              <li>• Manufacturer spec sheets</li>
              <li>• State licensing requirements</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
