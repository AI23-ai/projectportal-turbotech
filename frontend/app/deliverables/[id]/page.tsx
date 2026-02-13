"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "@/components/ui/Navigation";
import { authenticatedFetch } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Deliverable {
  id: number;
  name: string;
  description: string;
  due_date: string;
  owner: string;
  status: string;
  completion_percentage: number;
  phase_id: number;
  evidence?: string[];
  comments?: string;
}

export default function DeliverableDetail() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const params = useParams();
  const deliverableId = params.id;

  const [deliverable, setDeliverable] = useState<Deliverable | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newCompletion, setNewCompletion] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = `/api/auth/login${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION ? `?organization=${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION}` : ''}`;
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchDeliverable() {
      try {
        setLoading(true);
        const response = await authenticatedFetch(
          `/api/deliverables/${deliverableId}`
        );
        const data = await response.json();
        setDeliverable(data);
        setNewStatus(data.status);
        setNewCompletion(data.completion_percentage);
      } catch (err) {
        console.error("Error fetching deliverable:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user && deliverableId) {
      fetchDeliverable();
    }
  }, [user, deliverableId]);

  const handleUpdateStatus = async () => {
    if (!deliverable) return;

    try {
      setUpdating(true);
      const response = await authenticatedFetch(
        `/api/deliverables/${deliverableId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            completion_percentage: newCompletion,
            blockers: [],
            comments: "",
          }),
        }
      );

      if (response.ok) {
        // Refresh deliverable data
        const updatedResponse = await authenticatedFetch(
          `/api/deliverables/${deliverableId}`
        );
        const updatedData = await updatedResponse.json();
        setDeliverable(updatedData);
        setNewStatus(updatedData.status);
        setNewCompletion(updatedData.completion_percentage);
        alert("Deliverable updated successfully!");
      } else {
        const errorText = await response.text();
        throw new Error(`Update failed: ${errorText}`);
      }
    } catch (err) {
      console.error("Error updating deliverable:", err);
      alert("Failed to update deliverable");
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading || loading) {
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

  if (!deliverable) {
    return (
      <>
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-600">Deliverable not found</div>
        </div>
      </>
    );
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

  const statusOptions = [
    "NOT_STARTED",
    "IN_PROGRESS",
    "REVIEW",
    "BLOCKED",
    "COMPLETED",
  ];

  const phaseNames = [
    "Month 1: Discovery & Foundation",
    "Month 2: Prototype & Learning",
    "Month 3: Refinement & Roadmap",
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => router.push("/deliverables")}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
          >
            ← Back to Deliverables
          </button>

          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {deliverable.name}
                </h1>
                <p className="text-gray-600 mb-4">{deliverable.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-medium">Phase:</span>
                  <span>{phaseNames[deliverable.phase_id - 1]}</span>
                </div>
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
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${deliverable.completion_percentage}%` }}
                />
              </div>
            </div>

            {/* Due Date */}
            <div className="pt-4 border-t">
              <div className="text-sm">
                <span className="text-gray-500 font-medium">Due Date:</span>{" "}
                <span className="text-gray-900 font-semibold">
                  {new Date(deliverable.due_date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Update Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Update Status
            </h2>

            <div className="space-y-4">
              {/* Status Selector */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Completion Percentage Slider */}
              <div>
                <label
                  htmlFor="completion"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Completion: {newCompletion}%
                </label>
                <input
                  id="completion"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={newCompletion}
                  onChange={(e) => setNewCompletion(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Update Button */}
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {updating ? "Updating..." : "Update Deliverable"}
              </button>
            </div>
          </div>

          {/* Evidence Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Evidence & Deliverables
            </h2>
            {deliverable.evidence && deliverable.evidence.length > 0 ? (
              <div className="space-y-3">
                {deliverable.evidence.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <span className="text-green-600 font-semibold flex-shrink-0">✓</span>
                    <span className="text-gray-800 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No evidence items yet</p>
                <p className="text-sm mt-2">
                  Evidence and deliverable artifacts will appear here
                </p>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Progress Notes & Commentary
            </h2>
            {deliverable.comments ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-strong:text-gray-900 prose-p:text-gray-800 prose-li:text-gray-800">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {deliverable.comments}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No comments yet</p>
                <p className="text-sm mt-2">
                  Progress updates, blockers, and notes will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
