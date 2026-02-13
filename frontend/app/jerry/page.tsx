"use client";

import { useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/api";
import Link from "next/link";

export default function JerrySummaryPage() {
  const [jerryData, setJerryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJerryData = async () => {
      try {
        const response = await authenticatedFetch("/api/jerry");
        const data = await response.json();
        setJerryData(data);
      } catch (err) {
        console.error("Error fetching Jerry data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJerryData();
  }, []);

  const metrics = jerryData?.metrics || {
    symbolAccuracy: 99.1,
    estimatesLoaded: 28,
    totalBidValue: 71900000,
    symbolTypes: 124,
    timeSavingsPerWeek: 24.5,
    annualValue: 63000
  };

  const capabilities = [
    { name: "Eyes", icon: "👁️", status: "live", desc: "99.1% symbol detection" },
    { name: "Ears", icon: "👂", status: "live", desc: "Voice commands via Whisper" },
    { name: "Voice", icon: "🗣️", status: "live", desc: "ChatterBox TTS responses" },
    { name: "Memory", icon: "🧠", status: "live", desc: "28 estimates, $71.9M" },
    { name: "Hands", icon: "🖐️", status: "live", desc: "Workstation actions" },
    { name: "Learning", icon: "📈", status: "ready", desc: "SFT/DPO training ready" },
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600">Loading Jerry status...</div>
      </div>
    );
  }

  return (
    <>
      {/* Status Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800">
          <strong>January 2026 Status:</strong> Foundation complete. Entering Jerry Training Phase.
          Jerry achieved 99.1% symbol detection accuracy - up from 75% when he started - and is ready to learn estimation.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{metrics.symbolAccuracy}%</div>
          <div className="text-sm text-gray-600">Symbol Accuracy</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{metrics.estimatesLoaded}</div>
          <div className="text-sm text-gray-600">Estimates Loaded</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">${(metrics.totalBidValue / 1000000).toFixed(1)}M</div>
          <div className="text-sm text-gray-600">Total Bid Value</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">{metrics.symbolTypes}</div>
          <div className="text-sm text-gray-600">Symbol Types</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-teal-600">{metrics.timeSavingsPerWeek}h</div>
          <div className="text-sm text-gray-600">Hours Saved/Week</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-green-600">${(metrics.annualValue / 1000).toFixed(0)}K</div>
          <div className="text-sm text-gray-600">Annual Value</div>
        </div>
      </div>

      {/* Capabilities Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Capabilities at a Glance</h2>
          <Link href="/jerry/tools" className="text-purple-600 hover:text-purple-800 text-sm font-medium">
            View Details →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {capabilities.map((cap) => (
            <div key={cap.name} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-2">{cap.icon}</div>
              <div className="font-semibold text-gray-900">{cap.name}</div>
              <div className="text-xs text-gray-600 mt-1">{cap.desc}</div>
              <div className={`mt-2 text-xs font-medium ${cap.status === "live" ? "text-green-600" : "text-blue-600"}`}>
                {cap.status === "live" ? "✅ Live" : "🔵 Ready"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Jerry's Philosophy */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">The Jerry Philosophy</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-l-4 border-red-400 pl-4">
            <h3 className="font-semibold text-gray-900 mb-2">Traditional Approach</h3>
            <ul className="text-gray-600 space-y-1 text-sm">
              <li>• Build software for humans to use</li>
              <li>• Train humans on new tools</li>
              <li>• Software stays static</li>
              <li>• ROI = efficiency gains</li>
            </ul>
          </div>
          <div className="border-l-4 border-green-400 pl-4">
            <h3 className="font-semibold text-gray-900 mb-2">AI-Native Approach</h3>
            <ul className="text-gray-600 space-y-1 text-sm">
              <li>• Build capabilities for Jerry to use</li>
              <li>• Train Jerry on your way of working</li>
              <li>• Jerry learns and improves over time</li>
              <li>• ROI = intelligence amplification</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700 italic">
            "I want my team doing the stuff AI can't - visiting job sites, keeping projects on track, keeping clients happy."
            <span className="block text-sm text-gray-500 mt-1">— Project Sponsor</span>
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Link href="/jerry/tools" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-3">🔧</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Jerry's Tools</h3>
          <p className="text-gray-600 text-sm">
            Detailed breakdown of Jerry's 6 core capabilities and the technology behind them.
          </p>
          <div className="mt-4 text-purple-600 font-medium text-sm">Explore Tools →</div>
        </Link>

        <Link href="/jerry/training" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-3">📚</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Training Curriculum</h3>
          <p className="text-gray-600 text-sm">
            12-module syllabus teaching Jerry to become an expert electrical estimator.
          </p>
          <div className="mt-4 text-purple-600 font-medium text-sm">View Syllabus →</div>
        </Link>

        <Link href="/jerry/mentors" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-3">👨‍🏫</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Mentors & Learning</h3>
          <p className="text-gray-600 text-sm">
            How team mentors teach Jerry through corrections and real-world feedback.
          </p>
          <div className="mt-4 text-purple-600 font-medium text-sm">Meet the Mentors →</div>
        </Link>
      </div>

      {/* What's Next */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-6 text-white">
        <h2 className="text-xl font-bold mb-4">What's Next: Training Jerry</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Now</h3>
            <ul className="text-sm text-blue-100 space-y-1">
              <li>• See drawings at 99.1% accuracy</li>
              <li>• Remember 28 estimates ($71.9M)</li>
              <li>• Talk to team via voice</li>
              <li>• Take actions on workstation</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Next</h3>
            <ul className="text-sm text-blue-100 space-y-1">
              <li>• Calculate conduit runs</li>
              <li>• Compare bid vs construction sets</li>
              <li>• Learn domain pricing methods</li>
              <li>• Email triage automation</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Future</h3>
            <ul className="text-sm text-blue-100 space-y-1">
              <li>• Predict project profitability</li>
              <li>• Flag risky bids</li>
              <li>• Draft proposals</li>
              <li>• Full estimation assistance</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-400">
          <p className="text-sm text-blue-100">
            <strong>Key Principle:</strong> "Jerry's a few months into his apprenticeship. By this time next year, he'll be a seasoned estimator who knows your business inside and out."
          </p>
        </div>
      </div>
    </>
  );
}
