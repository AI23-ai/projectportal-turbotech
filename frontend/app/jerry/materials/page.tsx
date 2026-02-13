"use client";

import { useState } from "react";

interface MaterialItem {
  description: string;
  unit_price: number;
  category: string;
}

interface MaterialCategory {
  name: string;
  icon: string;
  color: string;
  itemCount: number;
  priceRange: { min: number; max: number };
  examples: MaterialItem[];
}

// Data extracted from labor_units_for_jerry.json - focusing on material pricing
const MATERIAL_STATS = {
  totalItems: 1036,
  itemsWithPricing: 838,
  categoriesCount: 24,
  priceRange: { min: 0.14, max: 5500.0, avg: 110.79 },
  sourceTemplate: "M-L TEMPLATE (Production)",
  exportDate: "2026-02-02",
};

const MATERIAL_CATEGORIES: MaterialCategory[] = [
  {
    name: "EMT 1/2\"-2\"",
    icon: "🔧",
    color: "blue",
    itemCount: 57,
    priceRange: { min: 0.20, max: 12.50 },
    examples: [
      { description: "1/2 EMT", unit_price: 0.45, category: "EMT 1/2\"-2\"" },
      { description: "3/4 EMT", unit_price: 0.80, category: "EMT 1/2\"-2\"" },
      { description: "1 EMT", unit_price: 1.30, category: "EMT 1/2\"-2\"" },
      { description: "1-1/4 EMT", unit_price: 2.15, category: "EMT 1/2\"-2\"" },
      { description: "1-1/2 EMT", unit_price: 2.65, category: "EMT 1/2\"-2\"" },
      { description: "2 EMT", unit_price: 3.50, category: "EMT 1/2\"-2\"" },
    ],
  },
  {
    name: "EMT 2-1/2\" - 4\"",
    icon: "🔩",
    color: "indigo",
    itemCount: 35,
    priceRange: { min: 5.50, max: 45.00 },
    examples: [
      { description: "2-1/2 EMT", unit_price: 5.50, category: "EMT 2-1/2\" - 4\"" },
      { description: "3 EMT", unit_price: 7.25, category: "EMT 2-1/2\" - 4\"" },
      { description: "4 EMT", unit_price: 12.00, category: "EMT 2-1/2\" - 4\"" },
      { description: "3 EMT 90", unit_price: 35.00, category: "EMT 2-1/2\" - 4\"" },
      { description: "4 EMT 90", unit_price: 45.00, category: "EMT 2-1/2\" - 4\"" },
    ],
  },
  {
    name: "COPPER THHN",
    icon: "🔌",
    color: "orange",
    itemCount: 42,
    priceRange: { min: 0.20, max: 12.50 },
    examples: [
      { description: "#14 THHN", unit_price: 0.14, category: "COPPER THHN" },
      { description: "#12 THHN", unit_price: 0.20, category: "COPPER THHN" },
      { description: "#10 THHN", unit_price: 0.28, category: "COPPER THHN" },
      { description: "#8 THHN", unit_price: 0.55, category: "COPPER THHN" },
      { description: "#6 THHN", unit_price: 0.75, category: "COPPER THHN" },
      { description: "#4 THHN", unit_price: 1.15, category: "COPPER THHN" },
      { description: "#2 THHN", unit_price: 1.80, category: "COPPER THHN" },
      { description: "#1/0 THHN", unit_price: 3.25, category: "COPPER THHN" },
    ],
  },
  {
    name: "MC CABLE",
    icon: "📦",
    color: "purple",
    itemCount: 45,
    priceRange: { min: 0.85, max: 8.50 },
    examples: [
      { description: "12/2 MC", unit_price: 0.95, category: "MC CABLE" },
      { description: "12/3 MC", unit_price: 1.25, category: "MC CABLE" },
      { description: "12/4 MC", unit_price: 1.65, category: "MC CABLE" },
      { description: "10/2 MC", unit_price: 1.45, category: "MC CABLE" },
      { description: "10/3 MC", unit_price: 1.85, category: "MC CABLE" },
      { description: "10/4 MC", unit_price: 2.45, category: "MC CABLE" },
    ],
  },
  {
    name: "DEVICES",
    icon: "🔌",
    color: "green",
    itemCount: 33,
    priceRange: { min: 8.50, max: 125.00 },
    examples: [
      { description: "D ASSM (Duplex)", unit_price: 23.65, category: "DEVICES" },
      { description: "S ASSM (Switch)", unit_price: 18.50, category: "DEVICES" },
      { description: "3W ASSM (3-Way)", unit_price: 22.00, category: "DEVICES" },
      { description: "GFI ASSM", unit_price: 35.00, category: "DEVICES" },
      { description: "USB ASSM", unit_price: 45.00, category: "DEVICES" },
      { description: "DIMMER ASSM", unit_price: 65.00, category: "DEVICES" },
    ],
  },
  {
    name: "LIGHTING",
    icon: "💡",
    color: "amber",
    itemCount: 77,
    priceRange: { min: 45.00, max: 850.00 },
    examples: [
      { description: "2X4 LAY-IN LED", unit_price: 125.00, category: "LIGHTING" },
      { description: "2X2 LAY-IN LED", unit_price: 95.00, category: "LIGHTING" },
      { description: "1X4 LAY-IN LED", unit_price: 85.00, category: "LIGHTING" },
      { description: "6\" CAN LED", unit_price: 85.00, category: "LIGHTING" },
      { description: "4\" CAN LED", unit_price: 75.00, category: "LIGHTING" },
      { description: "EXIT SIGN", unit_price: 125.00, category: "LIGHTING" },
      { description: "EMERGENCY LIGHT", unit_price: 150.00, category: "LIGHTING" },
      { description: "HIGH BAY LED", unit_price: 450.00, category: "LIGHTING" },
    ],
  },
  {
    name: "FIRE ALARM",
    icon: "🔔",
    color: "red",
    itemCount: 34,
    priceRange: { min: 45.00, max: 650.00 },
    examples: [
      { description: "SMOKE DETECTOR", unit_price: 85.00, category: "FIRE ALARM" },
      { description: "HEAT DETECTOR", unit_price: 65.00, category: "FIRE ALARM" },
      { description: "PULL STATION", unit_price: 95.00, category: "FIRE ALARM" },
      { description: "HORN/STROBE", unit_price: 125.00, category: "FIRE ALARM" },
      { description: "DUCT DETECTOR", unit_price: 350.00, category: "FIRE ALARM" },
      { description: "FA PANEL", unit_price: 650.00, category: "FIRE ALARM" },
    ],
  },
  {
    name: "ELECTRICAL PANELS",
    icon: "⚡",
    color: "cyan",
    itemCount: 24,
    priceRange: { min: 250.00, max: 5500.00 },
    examples: [
      { description: "100A MLO PANEL", unit_price: 450.00, category: "ELECTRICAL PANELS" },
      { description: "200A MLO PANEL", unit_price: 850.00, category: "ELECTRICAL PANELS" },
      { description: "400A MLO PANEL", unit_price: 2500.00, category: "ELECTRICAL PANELS" },
      { description: "225A MDP", unit_price: 3500.00, category: "ELECTRICAL PANELS" },
      { description: "400A MDP", unit_price: 5500.00, category: "ELECTRICAL PANELS" },
    ],
  },
  {
    name: "DISCONNECT SWITCHES",
    icon: "🔲",
    color: "teal",
    itemCount: 21,
    priceRange: { min: 85.00, max: 1200.00 },
    examples: [
      { description: "30A DISC NF", unit_price: 85.00, category: "DISCONNECT SWITCHES" },
      { description: "60A DISC NF", unit_price: 125.00, category: "DISCONNECT SWITCHES" },
      { description: "100A DISC NF", unit_price: 225.00, category: "DISCONNECT SWITCHES" },
      { description: "200A DISC NF", unit_price: 450.00, category: "DISCONNECT SWITCHES" },
      { description: "400A DISC NF", unit_price: 1200.00, category: "DISCONNECT SWITCHES" },
    ],
  },
  {
    name: "TRANSFORMERS",
    icon: "🔋",
    color: "rose",
    itemCount: 12,
    priceRange: { min: 1500.00, max: 5500.00 },
    examples: [
      { description: "15KVA XFMR", unit_price: 1500.00, category: "TRANSFORMERS" },
      { description: "25KVA XFMR", unit_price: 2200.00, category: "TRANSFORMERS" },
      { description: "45KVA XFMR", unit_price: 3500.00, category: "TRANSFORMERS" },
      { description: "75KVA XFMR", unit_price: 4500.00, category: "TRANSFORMERS" },
      { description: "112.5KVA XFMR", unit_price: 5500.00, category: "TRANSFORMERS" },
    ],
  },
  {
    name: "DATA / LOW VOLTAGE",
    icon: "🌐",
    color: "sky",
    itemCount: 28,
    priceRange: { min: 8.00, max: 450.00 },
    examples: [
      { description: "CAT6 JACK", unit_price: 15.00, category: "DATA" },
      { description: "DATA OUTLET ASSM", unit_price: 35.00, category: "DATA" },
      { description: "CAT6 CABLE /FT", unit_price: 0.35, category: "DATA" },
      { description: "FIBER CABLE /FT", unit_price: 0.85, category: "DATA" },
      { description: "24-PORT PATCH PANEL", unit_price: 250.00, category: "DATA" },
      { description: "DATA RACK", unit_price: 450.00, category: "DATA" },
    ],
  },
  {
    name: "CABLE TRAY",
    icon: "📐",
    color: "slate",
    itemCount: 18,
    priceRange: { min: 25.00, max: 185.00 },
    examples: [
      { description: "6\" CABLE TRAY /FT", unit_price: 25.00, category: "CABLE TRAY" },
      { description: "12\" CABLE TRAY /FT", unit_price: 35.00, category: "CABLE TRAY" },
      { description: "18\" CABLE TRAY /FT", unit_price: 45.00, category: "CABLE TRAY" },
      { description: "24\" CABLE TRAY /FT", unit_price: 55.00, category: "CABLE TRAY" },
      { description: "TRAY 90 ELBOW", unit_price: 125.00, category: "CABLE TRAY" },
    ],
  },
];

const PRICE_TIERS = [
  { tier: "Small Parts", range: "$0.14 - $5", examples: "Wire, fittings, connectors", color: "green" },
  { tier: "Assemblies", range: "$5 - $50", examples: "Devices, boxes, small fixtures", color: "blue" },
  { tier: "Fixtures", range: "$50 - $200", examples: "Lighting, fire alarm devices", color: "amber" },
  { tier: "Equipment", range: "$200 - $1,000", examples: "Disconnects, small panels", color: "orange" },
  { tier: "Major Equipment", range: "$1,000 - $5,500", examples: "Panels, transformers, gear", color: "red" },
];

export default function MaterialsPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("DEVICES");

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
      blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-800" },
      indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-800" },
      green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-100 text-green-800" },
      amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-800" },
      red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-800" },
      purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-100 text-purple-800" },
      orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-100 text-orange-800" },
      teal: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", badge: "bg-teal-100 text-teal-800" },
      cyan: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", badge: "bg-cyan-100 text-cyan-800" },
      rose: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", badge: "bg-rose-100 text-rose-800" },
      sky: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", badge: "bg-sky-100 text-sky-800" },
      slate: { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700", badge: "bg-slate-100 text-slate-800" },
      gray: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", badge: "bg-gray-100 text-gray-800" },
    };
    return colors[color] || colors.gray;
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Material Pricing Database - Production Data
        </h2>
        <p className="text-gray-600">
          Jerry's material cost knowledge - extracted from the client's M-L Template for accurate bid pricing
        </p>
      </div>

      {/* Explanation Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🏷️</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How Jerry Prices Materials
            </h3>
            <p className="text-gray-700 mb-3">
              When Jerry identifies items from drawings or takeoffs, he looks up <strong>unit prices</strong> from this database
              to calculate material costs. Combined with labor hours, this enables complete installed cost estimates.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="font-semibold text-emerald-700 mb-1">1. Identify Item</div>
                <p className="text-gray-600">"48x 2x4 LED lay-in fixtures"</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="font-semibold text-emerald-700 mb-1">2. Price Lookup</div>
                <p className="text-gray-600">2X4 LAY-IN LED = $125.00/ea</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="font-semibold text-emerald-700 mb-1">3. Calculate Total</div>
                <p className="text-gray-600">48 × $125.00 = $6,000 material</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-emerald-600">{MATERIAL_STATS.itemsWithPricing}</div>
          <div className="text-sm text-gray-600">Items with Pricing</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-blue-600">{MATERIAL_STATS.categoriesCount}</div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-amber-600">${MATERIAL_STATS.priceRange.avg.toFixed(0)}</div>
          <div className="text-sm text-gray-600">Avg Unit Price</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-purple-600">${MATERIAL_STATS.priceRange.max.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Max Unit Price</div>
        </div>
      </div>

      {/* Price Tiers */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📊</span> Price Tiers
          </h3>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-5 gap-4">
            {PRICE_TIERS.map((tier) => {
              const colors = getColorClasses(tier.color);
              return (
                <div key={tier.tier} className={`rounded-lg border-2 ${colors.border} overflow-hidden`}>
                  <div className={`px-3 py-2 ${colors.bg}`}>
                    <h4 className={`font-semibold ${colors.text} text-sm`}>{tier.tier}</h4>
                  </div>
                  <div className="p-3 bg-white">
                    <div className="text-lg font-bold text-gray-900 mb-1">{tier.range}</div>
                    <div className="text-xs text-gray-500">{tier.examples}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Browser */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>📂</span> Browse Materials by Category
        </h3>

        {MATERIAL_CATEGORIES.map((category) => {
          const colors = getColorClasses(category.color);
          const isExpanded = expandedCategory === category.name;

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
                    <p className="text-sm text-gray-600">{category.itemCount} items • ${category.priceRange.min.toFixed(2)} - ${category.priceRange.max.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-lg font-bold ${colors.text}`}>{category.examples.length} shown</div>
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
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {category.examples.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-6 py-3">
                            <code className={`text-sm px-2 py-1 rounded ${colors.badge}`}>{item.description}</code>
                          </td>
                          <td className="px-6 py-3 text-right font-bold text-gray-900">
                            ${item.unit_price.toFixed(2)}
                          </td>
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

      {/* Sample Estimate */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🧮</span> Sample Material Estimate
        </h3>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-3">Small Office Lighting Package:</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Item</th>
                <th className="text-center py-2">Qty</th>
                <th className="text-right py-2">Unit</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-2">2X4 LAY-IN LED</td>
                <td className="text-center">24</td>
                <td className="text-right">$125.00</td>
                <td className="text-right font-medium">$3,000.00</td>
              </tr>
              <tr>
                <td className="py-2">2X2 LAY-IN LED</td>
                <td className="text-center">12</td>
                <td className="text-right">$95.00</td>
                <td className="text-right font-medium">$1,140.00</td>
              </tr>
              <tr>
                <td className="py-2">6" CAN LED</td>
                <td className="text-center">8</td>
                <td className="text-right">$85.00</td>
                <td className="text-right font-medium">$680.00</td>
              </tr>
              <tr>
                <td className="py-2">EXIT SIGN</td>
                <td className="text-center">4</td>
                <td className="text-right">$125.00</td>
                <td className="text-right font-medium">$500.00</td>
              </tr>
              <tr>
                <td className="py-2">EMERGENCY LIGHT</td>
                <td className="text-center">4</td>
                <td className="text-right">$150.00</td>
                <td className="text-right font-medium">$600.00</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-bold">
                <td className="py-3" colSpan={3}>Material Total</td>
                <td className="text-right text-lg text-emerald-700">$5,920.00</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Source Info */}
      <div className="mt-6 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span>📊</span> Data Source
        </h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Source Information</h4>
            <ul className="space-y-1 text-gray-600">
              <li><strong>Template:</strong> {MATERIAL_STATS.sourceTemplate}</li>
              <li><strong>Export Date:</strong> {MATERIAL_STATS.exportDate}</li>
              <li><strong>Total Items:</strong> {MATERIAL_STATS.totalItems}</li>
              <li><strong>With Pricing:</strong> {MATERIAL_STATS.itemsWithPricing} ({Math.round(MATERIAL_STATS.itemsWithPricing / MATERIAL_STATS.totalItems * 100)}%)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Jerry Integration</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Connects to <code className="bg-gray-100 px-1 rounded">material_pricing</code> LOOKUP tag</li>
              <li>• Supports quantity-to-cost calculations</li>
              <li>• Combined with labor for total installed cost</li>
              <li>• Updated from production templates</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
