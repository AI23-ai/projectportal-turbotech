"use client";

import { useState } from "react";

interface DetectionItem {
  item: string;
  lookFor: string;
  costImpact: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
}

interface DetectionSection {
  name: string;
  icon: string;
  color: string;
  requiredInstead?: string;
  leadTimeAlert?: string;
  materialImpact?: string;
  laborImpact?: string;
  items: DetectionItem[];
}

const DETECTION_CATEGORIES = [
  { category: "PROHIBITION", description: "Something explicitly NOT permitted", impact: "$1,000 - $50,000+", color: "red" },
  { category: "COST_DRIVER", description: "Requirement that increases material cost", impact: "$2,000 - $50,000+", color: "orange" },
  { category: "LABOR_IMPACT", description: "Requirement that increases installation labor", impact: "+10% - 50% labor", color: "amber" },
  { category: "SCOPE_ISSUE", description: "Undefined scope or transferred risk", impact: "$5,000 - $25,000+", color: "purple" },
  { category: "COORDINATION", description: "Multi-trade coordination requirement", impact: "Varies", color: "blue" },
];

const HIGH_IMPACT_ITEMS = [
  { detection: "Die-cast fitting prohibition", costImpact: "$20,000-$50,000", section: "EMT Fittings" },
  { detection: "Custom SS boxes (3+ gang)", costImpact: "$10,000-$50,000", section: "Box Requirements" },
  { detection: "Independent support (no ceiling grid)", costImpact: "$10,000-$30,000", section: "Support" },
  { detection: "Minimum conduit sizing (3/4\" or 1\")", costImpact: "$13,000-$40,000", section: "Sizing" },
  { detection: "Incomplete drawings (contractor scope)", costImpact: "$5,000-$25,000", section: "Scope" },
  { detection: "Clean room sealing/gasketing", costImpact: "$10,000-$33,000", section: "Clean Room" },
  { detection: "Communications routing rules", costImpact: "$6,000-$26,000", section: "Communications" },
];

const LEAD_TIME_ITEMS = [
  { item: "Custom SS boxes (3+ gang)", leadTime: "4-8 weeks", action: "Order at project award" },
  { item: "Special fabricated pull boxes", leadTime: "2-4 weeks", action: "Include in initial order" },
  { item: "Stainless steel strut/hardware", leadTime: "1-2 weeks", action: "Verify availability" },
];

const DETECTION_SECTIONS: DetectionSection[] = [
  {
    name: "EMT Fitting Prohibitions",
    icon: "🔧",
    color: "red",
    requiredInstead: "Steel compression or steel set-screw fittings only",
    items: [
      { item: "Die-cast fittings", lookFor: "\"die-cast not permitted\", \"zinc die-cast\"", costImpact: "$20,000-$50,000", riskLevel: "HIGH" },
      { item: "Indentor fittings", lookFor: "\"indentor...not permitted\"", costImpact: "Included above", riskLevel: "HIGH" },
      { item: "Drive-on fittings", lookFor: "\"drive-on...not permitted\"", costImpact: "Included above", riskLevel: "HIGH" },
      { item: "Pressure cast", lookFor: "\"pressure cast not permitted\"", costImpact: "Included above", riskLevel: "HIGH" },
    ],
  },
  {
    name: "Box Requirements",
    icon: "📦",
    color: "orange",
    leadTimeAlert: "Custom SS boxes require 4-8 weeks fabrication",
    items: [
      { item: "Custom SS boxes (3+ gang)", lookFor: "\"more than 2 gang...stainless steel custom fabricated\"", costImpact: "$10,000-$50,000", riskLevel: "HIGH" },
      { item: "No gangable boxes", lookFor: "\"gangable type boxes are not allowed\"", costImpact: "$2,000-$10,000", riskLevel: "HIGH" },
      { item: "Hinged covers", lookFor: "\"boxes larger than 12\\\"...hinged cover or chain\"", costImpact: "$2,000-$5,000", riskLevel: "MEDIUM" },
      { item: "No field fabrication", lookFor: "\"field-fabricated boxes not allowed\"", costImpact: "$1,000-$5,000", riskLevel: "MEDIUM" },
    ],
  },
  {
    name: "Support Prohibitions",
    icon: "🏗️",
    color: "purple",
    requiredInstead: "Independent support to structure (trapeze, rod, beam clamps)",
    items: [
      { item: "No ceiling grid support", lookFor: "\"suspended ceiling...not considered structural\"", costImpact: "$10,000-$30,000", riskLevel: "HIGH" },
      { item: "No deck attachment", lookFor: "\"do not fasten to corrugated metal roof deck\"", costImpact: "$2,000-$8,000", riskLevel: "HIGH" },
      { item: "No piping attachment", lookFor: "\"do not attach raceways to piping\"", costImpact: "$2,000-$5,000", riskLevel: "MEDIUM" },
      { item: "No tie-wire", lookFor: "\"do not support with wire\"", costImpact: "$1,000-$3,000", riskLevel: "MEDIUM" },
      { item: "No zip ties", lookFor: "\"do not support with...plastic tie-wrap\"", costImpact: "Included above", riskLevel: "MEDIUM" },
    ],
  },
  {
    name: "Minimum Sizing Requirements",
    icon: "📏",
    color: "blue",
    materialImpact: "3/4\" is 78% more than 1/2\"; 1\" is 189% more than 1/2\"",
    items: [
      { item: "No 1/2\" conduit", lookFor: "\"minimum raceway size: 3/4 inch\"", costImpact: "$5,000-$15,000", riskLevel: "HIGH" },
      { item: "1\" minimum home runs", lookFor: "\"minimum home run size: 1 inch\"", costImpact: "$8,000-$25,000", riskLevel: "HIGH" },
    ],
  },
  {
    name: "Communications Raceway",
    icon: "🌐",
    color: "teal",
    laborImpact: "Communications requires vertical up-over-down routing (+30-50% conduit)",
    items: [
      { item: "1\" minimum comm conduit", lookFor: "\"minimum communications raceway size: 1\\\"\"", costImpact: "$2,000-$8,000", riskLevel: "HIGH" },
      { item: "No horizontal wall routing", lookFor: "\"horizontal raceway runs between wall outlet boxes are not allowed\"", costImpact: "$5,000-$15,000", riskLevel: "HIGH" },
      { item: "Max 180° bends", lookFor: "\"no more than 180 degrees of bends\"", costImpact: "$1,000-$3,000", riskLevel: "HIGH" },
      { item: "No 90° condulets", lookFor: "\"do not install 90-degree condulets\"", costImpact: "$2,000-$8,000", riskLevel: "HIGH" },
      { item: "100' max section length", lookFor: "\"do not install continuous sections longer than 100 ft\"", costImpact: "$1,000-$3,000", riskLevel: "MEDIUM" },
    ],
  },
  {
    name: "Clean Room / Wet Areas",
    icon: "🧪",
    color: "cyan",
    materialImpact: "Stainless steel is 5-7x standard galvanized cost",
    laborImpact: "+30-50% for clean room work",
    items: [
      { item: "SS hardware in wet areas", lookFor: "\"stainless steel...when located in wet or wash-down areas\"", costImpact: "$5,000-$20,000", riskLevel: "HIGH" },
      { item: "Penetration sealing", lookFor: "\"proper sealing...to maintain room integrity\"", costImpact: "$3,000-$10,000", riskLevel: "HIGH" },
      { item: "Gasketed covers", lookFor: "\"gasketed covers on all devices\"", costImpact: "$2,000-$8,000", riskLevel: "HIGH" },
    ],
  },
  {
    name: "Scope Issues",
    icon: "⚠️",
    color: "amber",
    requiredInstead: "Add 15-25% contingency for unshown boxes",
    items: [
      { item: "Incomplete drawings", lookFor: "\"drawings do not necessarily show every...box required\"", costImpact: "$5,000-$25,000", riskLevel: "HIGH" },
      { item: "Contractor-added scope", lookFor: "\"add all required boxes as necessary\"", costImpact: "Included above", riskLevel: "HIGH" },
    ],
  },
  {
    name: "Rated Wall Separation",
    icon: "🧱",
    color: "gray",
    items: [
      { item: "24\" rated wall separation", lookFor: "\"minimum 24\\\" separation in acoustic-rated walls and fire-rated walls\"", costImpact: "$2,000-$5,000", riskLevel: "HIGH" },
      { item: "No back-to-back boxes", lookFor: "\"do not install back-to-back\"", costImpact: "$500-$2,000", riskLevel: "MEDIUM" },
      { item: "6\" standard separation", lookFor: "\"minimum 6\\\" horizontal separation\"", costImpact: "Routing impact", riskLevel: "LOW" },
    ],
  },
];

const TRAINING_COVERAGE = [
  { area: "EMT fitting prohibitions", examples: 5, coverage: "Die-cast, indentor, drive-on, hardware" },
  { area: "Box requirements", examples: 8, coverage: "Custom SS, gangable, pull boxes, covers" },
  { area: "Support prohibitions", examples: 6, coverage: "Ceiling, deck, tie-wire, independent" },
  { area: "Communications", examples: 6, coverage: "Routing, bends, condulets, length" },
  { area: "Minimum sizing", examples: 4, coverage: "Conduit, home runs" },
  { area: "Wet/clean areas", examples: 4, coverage: "SS hardware, sealing, gasketed" },
  { area: "Scope issues", examples: 4, coverage: "Incomplete drawings, contingency" },
];

export default function SpecsPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>("EMT Fitting Prohibitions");

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
      red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-800" },
      orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-100 text-orange-800" },
      amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-800" },
      purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-100 text-purple-800" },
      blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-800" },
      teal: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", badge: "bg-teal-100 text-teal-800" },
      cyan: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", badge: "bg-cyan-100 text-cyan-800" },
      gray: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", badge: "bg-gray-100 text-gray-800" },
    };
    return colors[color] || colors.gray;
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-300";
      case "MEDIUM":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const totalExamples = TRAINING_COVERAGE.reduce((sum, t) => sum + t.examples, 0);

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Spec Analyzer - Division 26 Detection Reference
        </h2>
        <p className="text-gray-600">
          What Jerry is trained to detect when analyzing electrical specifications (Section 26 0533 - Raceway and Boxes)
        </p>
      </div>

      {/* Explanation Banner */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">📋</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How Jerry Analyzes Specs
            </h3>
            <p className="text-gray-700 mb-3">
              Jerry scans Division 26 specifications for <strong>cost drivers, prohibitions, and scope issues</strong> that
              estimators need to account for in their bids. Missing these items can cost $10,000-$50,000+ per project.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="font-semibold text-red-700 mb-1">1. Scan Spec Section</div>
                <p className="text-gray-600">"Section 26 0533 - Raceway and Boxes"</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="font-semibold text-red-700 mb-1">2. Detect Prohibitions</div>
                <p className="text-gray-600">"Die-cast fittings not permitted"</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="font-semibold text-red-700 mb-1">3. Flag Cost Impact</div>
                <p className="text-gray-600">Steel fittings required: +$20,000-$50,000</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-red-600">30+</div>
          <div className="text-sm text-gray-600">Detection Items</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-orange-600">5</div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-purple-600">{totalExamples}</div>
          <div className="text-sm text-gray-600">Training Examples</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-green-600">$50K+</div>
          <div className="text-sm text-gray-600">Max Single Impact</div>
        </div>
      </div>

      {/* Detection Categories */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🏷️</span> Detection Categories
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Typical Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {DETECTION_CATEGORIES.map((cat, idx) => {
                const colors = getColorClasses(cat.color);
                return (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-3">
                      <code className={`text-sm px-2 py-1 rounded ${colors.badge}`}>{cat.category}</code>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">{cat.description}</td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{cat.impact}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* High Impact Items */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🚨</span> High-Impact Items - Always Check These
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Detection</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Section</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {HIGH_IMPACT_ITEMS.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{item.detection}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{item.section}</td>
                  <td className="px-6 py-3 text-sm font-bold text-red-600 text-right">{item.costImpact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Time Critical Items */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>⏰</span> Lead Time Critical Items
          </h3>
        </div>
        <div className="p-4">
          <div className="grid md:grid-cols-3 gap-4">
            {LEAD_TIME_ITEMS.map((item, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                <div className="font-semibold text-gray-900 mb-2">{item.item}</div>
                <div className="text-amber-700 font-bold mb-1">{item.leadTime}</div>
                <div className="text-sm text-gray-600">{item.action}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detection Sections Browser */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>📂</span> Detection Items by Section
        </h3>

        {DETECTION_SECTIONS.map((section) => {
          const colors = getColorClasses(section.color);
          const isExpanded = expandedSection === section.name;
          const highRiskCount = section.items.filter(i => i.riskLevel === "HIGH").length;

          return (
            <div key={section.name} className={`rounded-lg border ${colors.border} overflow-hidden`}>
              <button
                onClick={() => setExpandedSection(isExpanded ? null : section.name)}
                className={`w-full px-6 py-4 ${colors.bg} flex items-center justify-between hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">{section.name}</h4>
                    <p className="text-sm text-gray-600">{section.items.length} items, {highRiskCount} HIGH risk</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {highRiskCount > 0 && (
                    <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-800 rounded">
                      {highRiskCount} HIGH
                    </span>
                  )}
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
                  {(section.requiredInstead || section.leadTimeAlert || section.materialImpact || section.laborImpact) && (
                    <div className="px-6 py-3 bg-gray-50 border-b text-sm">
                      {section.requiredInstead && (
                        <div className="text-green-700"><strong>Required Instead:</strong> {section.requiredInstead}</div>
                      )}
                      {section.leadTimeAlert && (
                        <div className="text-amber-700"><strong>Lead Time:</strong> {section.leadTimeAlert}</div>
                      )}
                      {section.materialImpact && (
                        <div className="text-blue-700"><strong>Material Impact:</strong> {section.materialImpact}</div>
                      )}
                      {section.laborImpact && (
                        <div className="text-purple-700"><strong>Labor Impact:</strong> {section.laborImpact}</div>
                      )}
                    </div>
                  )}
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">What Jerry Looks For</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Risk</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {section.items.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-6 py-3 text-sm font-medium text-gray-900">{item.item}</td>
                          <td className="px-6 py-3 text-sm text-gray-600 font-mono text-xs">{item.lookFor}</td>
                          <td className="px-6 py-3 text-center">
                            <span className={`px-2 py-1 text-xs font-bold rounded border ${getRiskBadge(item.riskLevel)}`}>
                              {item.riskLevel}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm font-semibold text-right text-gray-900">{item.costImpact}</td>
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

      {/* Training Coverage */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📚</span> Jerry v3 Training Coverage - {totalExamples} Examples
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TRAINING_COVERAGE.map((item, idx) => (
            <div key={idx} className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-gray-900 text-sm">{item.area}</span>
                <span className="text-purple-600 font-bold">{item.examples}</span>
              </div>
              <div className="text-xs text-gray-500">{item.coverage}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Level Definitions */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📊</span> Risk Level Definitions
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border-l-4 border-red-500 pl-4">
            <div className="font-bold text-red-700">HIGH</div>
            <div className="text-sm text-gray-600">$10,000+ impact</div>
            <div className="text-xs text-gray-500">Missing this could significantly impact bid/project</div>
          </div>
          <div className="border-l-4 border-amber-500 pl-4">
            <div className="font-bold text-amber-700">MEDIUM</div>
            <div className="text-sm text-gray-600">$1,000-$10,000 impact</div>
            <div className="text-xs text-gray-500">Notable cost impact, should be captured</div>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <div className="font-bold text-green-700">LOW</div>
            <div className="text-sm text-gray-600">&lt;$1,000 impact</div>
            <div className="text-xs text-gray-500">Minor impact, but should be tracked</div>
          </div>
        </div>
      </div>
    </>
  );
}
