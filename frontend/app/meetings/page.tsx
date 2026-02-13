"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "@/components/ui/Navigation";
import { authenticatedFetch } from "@/lib/api";

interface Meeting {
  id: number;
  title: string;
  meeting_date: string;
  attendees: string[];
  summary: string;
  topics: string[];
  action_item_ids: number[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface ActionItem {
  id: number;
  title: string;
  status: string;
  responsible_party: string;
  target_date: string;
}

export default function Meetings() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = `/api/auth/login${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION ? `?organization=${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION}` : ''}`;
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user) {
      fetchMeetings();
      fetchActionItems();
    }
  }, [user]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch("/api/meetings");

      if (!response.ok) {
        throw new Error("Failed to fetch meetings");
      }

      const data = await response.json();
      setMeetings(data.meetings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching meetings:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActionItems = async () => {
    try {
      const response = await authenticatedFetch("/api/action-items");

      if (response.ok) {
        const data = await response.json();
        setActionItems(data.action_items || []);
      }
    } catch (err) {
      console.error("Error fetching action items:", err);
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

  const getActionItemsForMeeting = (meetingId: number, actionItemIds: number[]) => {
    return actionItems.filter((item) => actionItemIds.includes(item.id));
  };

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

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Meetings
            </h1>
            <p className="text-gray-600 mb-4">
              View summaries and notes from client meetings and project discussions.
            </p>

            {/* Stats Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">📅</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Meeting History
                  </h3>
                  <p className="text-gray-700 mb-3">
                    {meetings.length} {meetings.length === 1 ? "meeting" : "meetings"} recorded with comprehensive notes and action items.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">{meetings.length}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Total Meetings</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {meetings.reduce((sum, m) => sum + (m.attendees?.length || 0), 0)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Total Attendees</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm col-span-2 sm:col-span-1">
                      <div className="text-xl sm:text-2xl font-bold text-purple-600">
                        {meetings.reduce((sum, m) => sum + (m.action_item_ids?.length || 0), 0)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Action Items</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Meetings List */}
          {meetings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-gray-600">No meetings recorded yet</div>
            </div>
          ) : (
            <div className="grid gap-6">
              {meetings.map((meeting) => {
                const meetingActionItems = getActionItemsForMeeting(meeting.id, meeting.action_item_ids || []);

                return (
                  <div
                    key={meeting.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    {/* Meeting Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {meeting.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              📅 {new Date(meeting.meeting_date).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              👥 {meeting.attendees?.length || 0} attendees
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Meeting Summary */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">📝 Meeting Summary</h4>
                        <p className="text-gray-700">{meeting.summary}</p>
                      </div>

                      {/* Two Column Layout */}
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                          {/* Attendees */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">👥 Attendees</h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <ul className="space-y-2">
                                {meeting.attendees?.map((attendee, idx) => (
                                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">•</span>
                                    {attendee}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Topics Discussed */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">💡 Topics Discussed</h4>
                            <div className="space-y-2">
                              {meeting.topics?.map((topic, idx) => (
                                <div key={idx} className="bg-blue-50 rounded-lg p-3 text-sm text-gray-700">
                                  <div className="flex items-start gap-2">
                                    <span className="text-blue-600 font-semibold">{idx + 1}.</span>
                                    <span>{topic}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div>
                          {/* Action Items */}
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            ✅ Action Items ({meetingActionItems.length})
                          </h4>
                          {meetingActionItems.length === 0 ? (
                            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                              No action items for this meeting
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {meetingActionItems.map((item) => (
                                <div
                                  key={item.id}
                                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                                  onClick={() => router.push("/action-items")}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <h5 className="text-sm font-semibold text-gray-900 flex-1">
                                      {item.title}
                                    </h5>
                                    <span
                                      className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                        item.status
                                      )}`}
                                    >
                                      {item.status.replace("_", " ").toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs text-gray-600">
                                    <span className="font-medium">{item.responsible_party}</span>
                                    <span>
                                      Due: {new Date(item.target_date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      {meeting.notes && (
                        <div className="mt-6 pt-6 border-t">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">📌 Additional Notes</h4>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-gray-700">{meeting.notes}</p>
                          </div>
                        </div>
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
