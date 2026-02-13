"use client";

import { useState } from "react";

interface LaborItem {
  description: string;
  unit_price: number;
  labor_hours: number;
}

interface LaborCategory {
  name: string;
  icon: string;
  color: string;
  itemCount: number;
  examples: LaborItem[];
}

// Data extracted from labor_units_for_jerry.json
const LABOR_STATS = {
  totalItems: 1036,
  itemsWithLabor: 762,
  itemsWithPricing: 838,
  categoriesCount: 24,
  laborRange: { min: 0.005, max: 60.0, avg: 1.1 },
  priceRange: { min: 0.14, max: 5500.0, avg: 110.79 },
  sourceTemplate: "M-L TEMPLATE (Production)",
  exportDate: "2026-02-02",
};

const LABOR_CATEGORIES: LaborCategory[] = [
  {
    name: "EMT 1/2\"-2\"",
    icon: "🔧",
    color: "blue",
    itemCount: 57,
    examples: [
      { description: "1/2 EMT", unit_price: 0.45, labor_hours: 0.042 },
      { description: "3/4 EMT", unit_price: 0.80, labor_hours: 0.046 },
      { description: "1 EMT", unit_price: 1.30, labor_hours: 0.05 },
      { description: "JBOX ASSM", unit_price: 5.50, labor_hours: 0.25 },
      { description: "#12 THHN", unit_price: 0.20, labor_hours: 0.006 },
      { description: "#10 THHN", unit_price: 0.28, labor_hours: 0.008 },
    ],
  },
  {
    name: "DEVICES",
    icon: "🔌",
    color: "green",
    itemCount: 33,
    examples: [
      { description: "D ASSM", unit_price: 23.65, labor_hours: 0.65 },
      { description: "S ASSM", unit_price: 18.50, labor_hours: 0.55 },
      { description: "3W ASSM", unit_price: 22.00, labor_hours: 0.60 },
      { description: "GFI ASSM", unit_price: 35.00, labor_hours: 0.70 },
      { description: "USB ASSM", unit_price: 45.00, labor_hours: 0.70 },
    ],
  },
  {
    name: "LIGHTING",
    icon: "💡",
    color: "amber",
    itemCount: 77,
    examples: [
      { description: "2X4 LAY-IN", unit_price: 125.00, labor_hours: 0.75 },
      { description: "2X2 LAY-IN", unit_price: 95.00, labor_hours: 0.65 },
      { description: "6\" CAN", unit_price: 85.00, labor_hours: 0.85 },
      { description: "4\" CAN", unit_price: 75.00, labor_hours: 0.75 },
      { description: "EXIT SIGN", unit_price: 125.00, labor_hours: 0.50 },
      { description: "EMERGENCY", unit_price: 150.00, labor_hours: 0.65 },
    ],
  },
  {
    name: "FIRE ALARM",
    icon: "🔔",
    color: "red",
    itemCount: 34,
    examples: [
      { description: "SMOKE DET", unit_price: 85.00, labor_hours: 0.45 },
      { description: "HEAT DET", unit_price: 65.00, labor_hours: 0.45 },
      { description: "PULL STATION", unit_price: 95.00, labor_hours: 0.50 },
      { description: "HORN/STROBE", unit_price: 125.00, labor_hours: 0.55 },
      { description: "DUCT DET", unit_price: 350.00, labor_hours: 1.25 },
    ],
  },
  {
    name: "ELECTRICAL PANELS",
    icon: "⚡",
    color: "purple",
    itemCount: 24,
    examples: [
      { description: "100A PANEL", unit_price: 450.00, labor_hours: 4.0 },
      { description: "200A PANEL", unit_price: 850.00, labor_hours: 6.0 },
      { description: "400A PANEL", unit_price: 2500.00, labor_hours: 12.0 },
      { description: "45KVA XFMR", unit_price: 3500.00, labor_hours: 8.0 },
      { description: "75KVA XFMR", unit_price: 4500.00, labor_hours: 10.0 },
    ],
  },
  {
    name: "DISCONNECT SWITCHES",
    icon: "🔲",
    color: "indigo",
    itemCount: 21,
    examples: [
      { description: "30A DISC", unit_price: 85.00, labor_hours: 1.0 },
      { description: "60A DISC", unit_price: 125.00, labor_hours: 1.25 },
      { description: "100A DISC", unit_price: 225.00, labor_hours: 1.75 },
      { description: "200A DISC", unit_price: 450.00, labor_hours: 2.5 },
      { description: "400A DISC", unit_price: 1200.00, labor_hours: 4.0 },
    ],
  },
  {
    name: "DATA",
    icon: "🌐",
    color: "teal",
    itemCount: 9,
    examples: [
      { description: "DATA OUTLET", unit_price: 35.00, labor_hours: 0.45 },
      { description: "CAT6 JACK", unit_price: 15.00, labor_hours: 0.25 },
      { description: "PATCH PANEL", unit_price: 250.00, labor_hours: 2.0 },
    ],
  },
  {
    name: "MC CABLE",
    icon: "📦",
    color: "orange",
    itemCount: 45,
    examples: [
      { description: "12/2 MC", unit_price: 0.95, labor_hours: 0.025 },
      { description: "12/3 MC", unit_price: 1.25, labor_hours: 0.028 },
      { description: "10/2 MC", unit_price: 1.45, labor_hours: 0.030 },
      { description: "10/3 MC", unit_price: 1.85, labor_hours: 0.035 },
    ],
  },
  {
    name: "COPPER WIRE (THHN/XHHW)",
    icon: "🔗",
    color: "rose",
    itemCount: 65,
    examples: [
      { description: "#12 THHN", unit_price: 0.20, labor_hours: 0.006 },
      { description: "#10 THHN", unit_price: 0.28, labor_hours: 0.008 },
      { description: "#8 THHN", unit_price: 0.55, labor_hours: 0.011 },
      { description: "#6 THHN", unit_price: 0.75, labor_hours: 0.013 },
      { description: "#4 THHN", unit_price: 1.15, labor_hours: 0.015 },
      { description: "#2 THHN", unit_price: 1.80, labor_hours: 0.019 },
    ],
  },
  {
    name: "Other Categories",
    icon: "📋",
    color: "gray",
    itemCount: 671,
    examples: [
      { description: "STRUT (10')", unit_price: 25.00, labor_hours: 0.35 },
      { description: "CABLE TRAY", unit_price: 45.00, labor_hours: 0.50 },
      { description: "SEALTITE 1/2\"", unit_price: 1.25, labor_hours: 0.08 },
      { description: "AL XHHW 1/0", unit_price: 2.50, labor_hours: 0.025 },
    ],
  },
];

const SAMPLE_CALCULATIONS = [
  {
    title: "Duplex Receptacles",
    quantity: 125,
    item: "D ASSM",
    unitPrice: 23.65,
    laborHours: 0.65,
    get totalMaterial() { return this.quantity * this.unitPrice; },
    get totalLabor() { return this.quantity * this.laborHours; },
  },
  {
    title: "2x4 LED Lay-In Fixtures",
    quantity: 48,
    item: "2X4 LAY-IN",
    unitPrice: 125.00,
    laborHours: 0.75,
    get totalMaterial() { return this.quantity * this.unitPrice; },
    get totalLabor() { return this.quantity * this.laborHours; },
  },
  {
    title: "Smoke Detectors",
    quantity: 85,
    item: "SMOKE DET",
    unitPrice: 85.00,
    laborHours: 0.45,
    get totalMaterial() { return this.quantity * this.unitPrice; },
    get totalLabor() { return this.quantity * this.laborHours; },
  },
];

export default function LaborUnitsPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("DEVICES");

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
      blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-800" },
      green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-100 text-green-800" },
      amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-800" },
      red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-800" },
      purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-100 text-purple-800" },
      indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-800" },
      teal: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", badge: "bg-teal-100 text-teal-800" },
      orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-100 text-orange-800" },
      rose: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", badge: "bg-rose-100 text-rose-800" },
      gray: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", badge: "bg-gray-100 text-gray-800" },
    };
    return colors[color] || colors.gray;
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Labor Units Database - Production Data
        </h2>
        <p className="text-gray-600">
          Jerry's pricing and labor knowledge - extracted from the client's M-L Template used daily by estimators
        </p>
      </div>

      {/* Explanation Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">💰</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How Jerry Uses Labor Units
            </h3>
            <p className="text-gray-700 mb-3">
              When Jerry sees quantities from drawings, he converts them to labor hours and material costs using this database.
              This is your company's <strong>actual production data</strong> - the same rates estimators use every day.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="font-semibold text-green-700 mb-1">1. Quantity Identified</div>
                <p className="text-gray-600">"Drawing shows 125 duplex receptacles..."</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="font-semibold text-green-700 mb-1">2. Labor Lookup</div>
                <p className="text-gray-600">D ASSM = 0.65 hrs/unit, $23.65/unit</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="font-semibold text-green-700 mb-1">3. Calculate Totals</div>
                <p className="text-gray-600">81.25 labor hrs, $2,956.25 material</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-green-600">{LABOR_STATS.totalItems.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-blue-600">{LABOR_STATS.itemsWithLabor}</div>
          <div className="text-sm text-gray-600">With Labor Hours</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-purple-600">{LABOR_STATS.categoriesCount}</div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-amber-600">{LABOR_STATS.laborRange.max}h</div>
          <div className="text-sm text-gray-600">Max Labor (per unit)</div>
        </div>
      </div>

      {/* Data Range Info */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>⏱️</span> Labor Hours Range
          </h4>
          <div className="flex justify-between text-sm">
            <div>
              <div className="text-gray-500">Minimum</div>
              <div className="text-lg font-semibold text-gray-900">{LABOR_STATS.laborRange.min} hrs</div>
              <div className="text-xs text-gray-500">(wire per foot)</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Average</div>
              <div className="text-lg font-semibold text-gray-900">{LABOR_STATS.laborRange.avg} hrs</div>
            </div>
            <div className="text-right">
              <div className="text-gray-500">Maximum</div>
              <div className="text-lg font-semibold text-gray-900">{LABOR_STATS.laborRange.max} hrs</div>
              <div className="text-xs text-gray-500">(large equipment)</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>💵</span> Unit Price Range
          </h4>
          <div className="flex justify-between text-sm">
            <div>
              <div className="text-gray-500">Minimum</div>
              <div className="text-lg font-semibold text-gray-900">${LABOR_STATS.priceRange.min}</div>
              <div className="text-xs text-gray-500">(small fittings)</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Average</div>
              <div className="text-lg font-semibold text-gray-900">${LABOR_STATS.priceRange.avg.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-gray-500">Maximum</div>
              <div className="text-lg font-semibold text-gray-900">${LABOR_STATS.priceRange.max.toLocaleString()}</div>
              <div className="text-xs text-gray-500">(transformers)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Calculations */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🧮</span> Sample Calculations - How Jerry Estimates
          </h3>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {SAMPLE_CALCULATIONS.map((calc) => (
              <div key={calc.title} className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-3">{calc.title}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{calc.quantity} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Item:</span>
                    <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">{calc.item}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit Price:</span>
                    <span className="font-medium">${calc.unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Labor/Unit:</span>
                    <span className="font-medium">{calc.laborHours} hrs</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-green-700">
                    <span className="font-semibold">Material Total:</span>
                    <span className="font-bold">${calc.totalMaterial.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-blue-700">
                    <span className="font-semibold">Labor Hours:</span>
                    <span className="font-bold">{calc.totalLabor.toFixed(2)} hrs</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Browser */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>📂</span> Browse by Category
        </h3>

        {LABOR_CATEGORIES.map((category) => {
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
                    <p className="text-sm text-gray-600">{category.itemCount} items in database</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-lg font-bold ${colors.text}`}>{category.examples.length} examples</div>
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
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Labor Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {category.examples.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-6 py-3">
                            <code className={`text-sm px-2 py-1 rounded ${colors.badge}`}>{item.description}</code>
                          </td>
                          <td className="px-6 py-3 text-right font-medium text-gray-900">
                            ${item.unit_price.toFixed(2)}
                          </td>
                          <td className="px-6 py-3 text-right">
                            {item.labor_hours > 0 ? (
                              <span className={`font-semibold ${colors.text}`}>{item.labor_hours} hrs</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
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

      {/* Source Info */}
      <div className="mt-6 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span>📊</span> Data Source & Integration
        </h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Source Information</h4>
            <ul className="space-y-1 text-gray-600">
              <li><strong>Template:</strong> {LABOR_STATS.sourceTemplate}</li>
              <li><strong>Export Date:</strong> {LABOR_STATS.exportDate}</li>
              <li><strong>Format:</strong> JSON for RAG integration</li>
              <li><strong>Items with Pricing:</strong> {LABOR_STATS.itemsWithPricing} ({Math.round(LABOR_STATS.itemsWithPricing / LABOR_STATS.totalItems * 100)}%)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Jerry Integration</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Connects to <code className="bg-gray-100 px-1 rounded">labor_units</code> LOOKUP tag</li>
              <li>• Supports quantity-to-cost conversions</li>
              <li>• Category-aware for organized estimates</li>
              <li>• Updated from production templates</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
