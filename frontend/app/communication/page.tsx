"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "@/components/ui/Navigation";
import { authenticatedFetch } from "@/lib/api";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Update {
  id: number;
  type: string;
  title: string;
  content: string;
  author: string;
  author_email: string;
  priority: string;
  created_at: string;
  acknowledgements: string[];
}

export default function Communication() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [showNewUpdateForm, setShowNewUpdateForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Form state
  const [newUpdate, setNewUpdate] = useState({
    type: "GENERAL",
    title: "",
    content: "",
    priority: "NORMAL",
  });

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = `/api/auth/login${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION ? `?organization=${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION}` : ''}`;
    }
  }, [user, isLoading, router]);

  const fetchUpdates = async (filter?: string) => {
    try {
      setLoading(true);
      const url =
        filter && filter !== "ALL"
          ? `/api/updates?type_filter=${filter}`
          : `/api/updates`;
      const response = await authenticatedFetch(url);
      const data = await response.json();
      setUpdates(data.updates || []);
    } catch (err) {
      console.error("Error fetching updates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUpdates(typeFilter === "ALL" ? undefined : typeFilter);
    }
  }, [user, typeFilter]);

  const handlePostUpdate = async () => {
    if (!newUpdate.title || !newUpdate.content || !user?.email) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setPosting(true);
      const response = await authenticatedFetch(`/api/updates`, {
        method: "POST",
        body: JSON.stringify({
          ...newUpdate,
          author_email: user.email,
        }),
      });

      if (response.ok) {
        setNewUpdate({
          type: "GENERAL",
          title: "",
          content: "",
          priority: "NORMAL",
        });
        setShowNewUpdateForm(false);
        await fetchUpdates(typeFilter === "ALL" ? undefined : typeFilter);
        alert("Update posted successfully!");
      }
    } catch (err) {
      console.error("Error posting update:", err);
      alert("Failed to post update");
    } finally {
      setPosting(false);
    }
  };

  const handleAcknowledge = async (updateId: number) => {
    if (!user?.email) return;

    try {
      const response = await authenticatedFetch(
        `/api/updates/${updateId}/acknowledge?user_email=${encodeURIComponent(
          user.email
        )}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        await fetchUpdates(typeFilter === "ALL" ? undefined : typeFilter);
      }
    } catch (err) {
      console.error("Error acknowledging update:", err);
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "MILESTONE":
        return "bg-green-100 text-green-800 border-green-300";
      case "BLOCKER":
        return "bg-red-100 text-red-800 border-red-300";
      case "SUCCESS":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "GENERAL":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "NORMAL":
        return "bg-blue-100 text-blue-800";
      case "FYI":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "MILESTONE":
        return "🎯";
      case "BLOCKER":
        return "🚫";
      case "SUCCESS":
        return "🎉";
      case "GENERAL":
        return "💬";
      default:
        return "📝";
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Communication Hub
            </h1>
            <p className="text-gray-600 mt-2">
              Project updates, milestones, blockers, and team communication
            </p>
          </div>

          {/* Action Buttons & Filters */}
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setTypeFilter("ALL")}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                  typeFilter === "ALL"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                All Updates ({updates.length})
              </button>
              <button
                onClick={() => setTypeFilter("MILESTONE")}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                  typeFilter === "MILESTONE"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                🎯 Milestones
              </button>
              <button
                onClick={() => setTypeFilter("BLOCKER")}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                  typeFilter === "BLOCKER"
                    ? "bg-red-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                🚫 Blockers
              </button>
              <button
                onClick={() => setTypeFilter("SUCCESS")}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                  typeFilter === "SUCCESS"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                🎉 Successes
              </button>
            </div>

            <button
              onClick={() => setShowNewUpdateForm(!showNewUpdateForm)}
              className="px-4 sm:px-6 py-2 bg-blue-600 text-white font-medium text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              {showNewUpdateForm ? "Cancel" : "+ New Update"}
            </button>
          </div>

          {/* New Update Form */}
          {showNewUpdateForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Post New Update
              </h2>

              <div className="space-y-4">
                {/* Type & Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={newUpdate.type}
                      onChange={(e) =>
                        setNewUpdate({ ...newUpdate, type: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="GENERAL">💬 General Update</option>
                      <option value="MILESTONE">🎯 Milestone</option>
                      <option value="BLOCKER">🚫 Blocker</option>
                      <option value="SUCCESS">🎉 Success</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={newUpdate.priority}
                      onChange={(e) =>
                        setNewUpdate({ ...newUpdate, priority: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="FYI">FYI</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">High Priority</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newUpdate.title}
                    onChange={(e) =>
                      setNewUpdate({ ...newUpdate, title: e.target.value })
                    }
                    placeholder="Brief summary of the update"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Details
                  </label>
                  <textarea
                    value={newUpdate.content}
                    onChange={(e) =>
                      setNewUpdate({ ...newUpdate, content: e.target.value })
                    }
                    placeholder="Detailed information about the update"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Post Button */}
                <button
                  onClick={handlePostUpdate}
                  disabled={posting}
                  className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {posting ? "Posting..." : "Post Update"}
                </button>
              </div>
            </div>
          )}

          {/* Updates Feed */}
          {updates.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-gray-400 text-5xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No updates yet
              </h3>
              <p className="text-gray-600">
                Be the first to post a project update!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {updates.map((update) => {
                const hasAcknowledged = update.acknowledgements.includes(
                  user.name || ""
                );

                return (
                  <div
                    key={update.id}
                    className={`bg-white rounded-lg shadow-md border-l-4 ${getTypeColor(
                      update.type
                    )} p-6`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-3xl">{getTypeIcon(update.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {update.title}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                update.priority
                              )}`}
                            >
                              {update.priority}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Posted by <span className="font-medium">{update.author}</span> •{" "}
                            {new Date(update.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                      <div className="prose prose-slate max-w-none
                        prose-headings:text-gray-900
                        prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-3 prose-h1:mt-4
                        prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-2 prose-h2:mt-3
                        prose-h3:text-lg prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-3
                        prose-p:text-gray-700 prose-p:mb-3 prose-p:leading-relaxed
                        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-gray-900 prose-strong:font-semibold
                        prose-ul:my-3 prose-ul:list-disc prose-ul:pl-6
                        prose-ol:my-3 prose-ol:list-decimal prose-ol:pl-6
                        prose-li:text-gray-700 prose-li:my-1
                        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
                        prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-pink-600
                        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-3 prose-pre:rounded-lg prose-pre:overflow-x-auto
                        prose-table:border-collapse prose-table:w-full prose-table:my-4 prose-table:text-sm
                        prose-th:bg-gray-50 prose-th:border prose-th:border-gray-300 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold
                        prose-td:border prose-td:border-gray-300 prose-td:px-3 prose-td:py-2
                        prose-hr:my-4 prose-hr:border-gray-300
                      ">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {update.content}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        {update.acknowledgements.length > 0 && (
                          <span>
                            ✓ Read by {update.acknowledgements.length}:{" "}
                            {update.acknowledgements.join(", ")}
                          </span>
                        )}
                      </div>

                      {!hasAcknowledged && (
                        <button
                          onClick={() => handleAcknowledge(update.id)}
                          className="px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Mark as Read
                        </button>
                      )}

                      {hasAcknowledged && (
                        <span className="text-sm text-green-600 font-medium">
                          ✓ You've read this
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
