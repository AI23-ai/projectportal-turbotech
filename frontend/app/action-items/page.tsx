"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "@/components/ui/Navigation";
import { authenticatedFetch } from "@/lib/api";

interface ActionItem {
  id: number;
  title: string;
  description: string;
  responsible_party: string;
  target_date: string;
  status: string;
  priority: string;
  meeting_id?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export default function ActionItems() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedResponsibleParty, setSelectedResponsibleParty] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = `/api/auth/login${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION ? `?organization=${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION}` : ''}`;
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user) {
      fetchActionItems();
    }
  }, [user, selectedStatus, selectedResponsibleParty]);

  const fetchActionItems = async () => {
    try {
      setLoading(true);
      let url = "/api/action-items";

      if (selectedStatus) {
        url += `?status=${selectedStatus}`;
      } else if (selectedResponsibleParty) {
        url += `?responsible_party=${encodeURIComponent(selectedResponsibleParty)}`;
      }

      const response = await authenticatedFetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch action items");
      }

      const data = await response.json();
      setActionItems(data.action_items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching action items:", err);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || loading) {
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

  if (error) {
    return (
      <>
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-red-600">Error: {error}</div>
        </div>
      </>
    );
  }

  // Filter by priority on client side if selected
  const filteredItems = selectedPriority
    ? actionItems.filter((item) => item.priority === selectedPriority)
    : actionItems;

  // Get unique responsible parties
  const responsibleParties = Array.from(
    new Set(actionItems.map((item) => item.responsible_party))
  ).sort();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✓";
      case "in_progress":
        return "⟳";
      case "pending":
        return "○";
      case "blocked":
        return "✕";
      default:
        return "○";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "🔥";
      case "high":
        return "⬆";
      case "medium":
        return "→";
      case "low":
        return "⬇";
      default:
        return "→";
    }
  };

  // Stats
  const stats = {
    total: actionItems.length,
    pending: actionItems.filter((item) => item.status === "pending").length,
    in_progress: actionItems.filter((item) => item.status === "in_progress").length,
    completed: actionItems.filter((item) => item.status === "completed").length,
    urgent: actionItems.filter((item) => item.priority === "urgent").length,
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Action Items
            </h1>
            <p className="text-gray-600 mb-4">
              Track and manage action items from client meetings and project activities.
            </p>

            {/* Stats Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 text-center">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Total</div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.in_progress}</div>
                  <div className="text-xs sm:text-sm text-gray-600">In Progress</div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.completed}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Completed</div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.urgent}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Urgent</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Status:
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedStatus(null)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    selectedStatus === null
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  All ({actionItems.length})
                </button>
                {["pending", "in_progress", "completed", "blocked"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      selectedStatus === status
                        ? getStatusColor(status)
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {getStatusIcon(status)} {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Priority:
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedPriority(null)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    selectedPriority === null
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  All Priorities
                </button>
                {["urgent", "high", "medium", "low"].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setSelectedPriority(priority)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors border ${
                      selectedPriority === priority
                        ? getPriorityColor(priority)
                        : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                    }`}
                  >
                    {getPriorityIcon(priority)} {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Responsible Party Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Responsible Party:
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedResponsibleParty(null)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    selectedResponsibleParty === null
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  All Parties
                </button>
                {responsibleParties.map((party) => (
                  <button
                    key={party}
                    onClick={() => setSelectedResponsibleParty(party)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      selectedResponsibleParty === party
                        ? "bg-purple-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {party}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Items List */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-gray-600">No action items found</div>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredItems
                .sort((a, b) => {
                  // Sort by priority (urgent > high > medium > low), then by target date
                  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                  const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
                  const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;

                  if (aPriority !== bPriority) {
                    return aPriority - bPriority;
                  }

                  return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
                })
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4"
                    style={{
                      borderLeftColor:
                        item.priority === "urgent"
                          ? "#dc2626"
                          : item.priority === "high"
                          ? "#ea580c"
                          : item.priority === "medium"
                          ? "#ca8a04"
                          : "#6b7280",
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                      <div className="ml-4 flex flex-col gap-2">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {getStatusIcon(item.status)} {item.status.replace("_", " ").toUpperCase()}
                        </span>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                            item.priority
                          )}`}
                        >
                          {getPriorityIcon(item.priority)} {item.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <span className="text-sm text-gray-500 font-medium">Responsible Party:</span>
                        <div className="text-sm text-gray-900 font-semibold mt-1">
                          {item.responsible_party}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 font-medium">Target Date:</span>
                        <div className="text-sm text-gray-900 font-semibold mt-1">
                          {new Date(item.target_date).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>

                    {item.notes && (
                      <div className="mt-4 pt-4 border-t">
                        <span className="text-sm text-gray-500 font-medium">Notes:</span>
                        <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
