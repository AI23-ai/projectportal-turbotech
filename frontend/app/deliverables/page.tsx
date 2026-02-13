"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "@/components/ui/Navigation";
import { authenticatedFetch } from "@/lib/api";

interface Deliverable {
  id: number;
  name: string;
  description: string;
  due_date: string;
  owner: string;
  status: string;
  completion_percentage: number;
  phase_id: number;
}

export default function Deliverables() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = `/api/auth/login${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION ? `?organization=${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION}` : ''}`;
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchDeliverables() {
      try {
        setLoading(true);
        const response = await authenticatedFetch(`/api/deliverables/month/${selectedMonth}`);
        const data = await response.json();
        setDeliverables(data.deliverables || []);
      } catch (err) {
        console.error("Error fetching deliverables:", err);
        setDeliverables([]);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchDeliverables();
    }
  }, [user, selectedMonth]);

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "REVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "BLOCKED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOwnerColor = (owner: string) => {
    switch (owner) {
      case "PARTNER":
        return "bg-purple-100 text-purple-800";
      case "CLIENT":
        return "bg-blue-100 text-blue-800";
      case "JOINT":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const phaseNames = [
    "Phase 1: Discovery & Foundation",
    "Phase 2: Prototype & Learning",
    "Phase 3: Refinement & Roadmap",
    "Phase 4: Jerry Training"
  ];
  const phaseDates = [
    "October 14 - November 13, 2025",
    "November 14 - December 14, 2025",
    "December 15 - January 14, 2026",
    "January 15, 2026 - Ongoing"
  ];
  const phaseStatus = ["COMPLETED", "COMPLETED", "COMPLETED", "IN_PROGRESS"];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Deliverables</h1>
            <p className="text-gray-600 mt-2">
              Track progress on all project deliverables from the SOW
            </p>
          </div>

          {/* Phase Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px flex-wrap">
                {[1, 2, 3, 4].map((phase) => (
                  <button
                    key={phase}
                    onClick={() => setSelectedMonth(phase)}
                    className={`flex-1 min-w-[120px] py-4 px-4 text-center border-b-2 font-medium text-sm transition-colors ${
                      selectedMonth === phase
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-center gap-2">
                      Phase {phase}
                      {phaseStatus[phase - 1] === "COMPLETED" && <span className="text-green-500">✓</span>}
                      {phaseStatus[phase - 1] === "IN_PROGRESS" && <span className="text-blue-500 animate-pulse">●</span>}
                    </div>
                    <div className="text-xs mt-1">{phaseDates[phase - 1]}</div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Phase Description */}
            <div className={`p-6 ${selectedMonth === 4 ? 'bg-purple-50' : 'bg-blue-50'}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {phaseNames[selectedMonth - 1]}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  phaseStatus[selectedMonth - 1] === "COMPLETED"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {phaseStatus[selectedMonth - 1].replace("_", " ")}
                </span>
              </div>
              {selectedMonth === 4 && (
                <p className="text-sm text-gray-600 mt-2">
                  Training the AI assistant to become an expert on your estimation processes, pricing, and business practices.
                </p>
              )}
            </div>
          </div>

          {/* Deliverables List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Loading deliverables...</div>
            </div>
          ) : deliverables.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-gray-600">No deliverables for this month</div>
            </div>
          ) : (
            <div className="grid gap-6">
              {deliverables.map((deliverable) => (
                <div
                  key={deliverable.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {deliverable.name}
                      </h3>
                      <p className="text-gray-600">{deliverable.description}</p>
                    </div>
                    <div className="ml-4 flex flex-col gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          deliverable.status
                        )}`}
                      >
                        {deliverable.status.replace("_", " ")}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getOwnerColor(
                          deliverable.owner
                        )}`}
                      >
                        {deliverable.owner}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-700 font-medium">Progress</span>
                      <span className="text-gray-900 font-semibold">
                        {deliverable.completion_percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${deliverable.completion_percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Due:</span>{" "}
                      {new Date(deliverable.due_date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <button
                      onClick={() => router.push(`/deliverables/${deliverable.id}`)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
