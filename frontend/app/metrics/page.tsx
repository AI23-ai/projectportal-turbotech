"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "@/components/ui/Navigation";
import { authenticatedFetch } from "@/lib/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

interface Metric {
  id: number;
  name: string;
  current: number;
  target: number;
  unit: string;
  notes: string;
  updated_at: string | null;
}

interface MetricsData {
  [key: string]: Metric;
}

export default function Metrics() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [metrics, setMetrics] = useState<MetricsData>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  const [newValue, setNewValue] = useState<number>(0);

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = `/api/auth/login${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION ? `?organization=${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION}` : ''}`;
    }
  }, [user, isLoading, router]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/metrics/');
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      alert(`Failed to load metrics: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMetrics();
    }
  }, [user]);

  const handleUpdateMetric = async (metricName: string, value: number) => {
    try {
      setUpdating(metricName);
      const metricsArray = Object.values(metrics);
      const metric = metricsArray.find(m => m.name === metricName);
      if (!metric) return;

      const response = await authenticatedFetch(`/api/metrics/${metric.id}`, {
        method: "POST",
        body: JSON.stringify({
          metric_id: metric.id,
          value: value,
          notes: "",
        }),
      });

      if (response.ok) {
        await fetchMetrics();
        setEditingMetric(null);
        alert("Metric updated successfully!");
      } else {
        throw new Error(`API returned ${response.status}`);
      }
    } catch (err) {
      console.error("Error updating metric:", err);
      alert(`Failed to update metric: ${err}`);
    } finally {
      setUpdating(null);
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

  // Calculate overall progress - use "Overall Project Completion" metric if available
  const metricsArray = Object.values(metrics).filter(m => m && m.name && m.current !== undefined && m.target !== undefined);
  const projectCompletionMetric = metricsArray.find(m => m.name === "Overall Project Completion");
  const overallProgress = projectCompletionMetric
    ? projectCompletionMetric.current
    : (metricsArray.length > 0
        ? metricsArray.reduce((sum, m) => {
            const progress = m.target === 0 ? 0 : Math.min((m.current / m.target) * 100, 100);
            return sum + progress;
          }, 0) / metricsArray.length
        : 0);

  // Prepare data for charts
  const progressData = metricsArray.map((metric) => ({
    name: (metric.name || "Unknown")
      .replace("Drawing Parsing ", "")
      .replace("Time Reduction ", "")
      .replace("Estimator ", "")
      .replace("Projects ", ""),
    current: metric.current,
    target: metric.target,
    progress: metric.target === 0 ? 0 : Math.min((metric.current / metric.target) * 100, 100),
  }));

  const radialData = metricsArray
    .filter((m) => m.unit === "percent")
    .map((metric, index) => ({
      name: (metric.name || "Unknown").split(" ")[0],
      value: metric.target === 0 ? 0 : Math.min((metric.current / metric.target) * 100, 100),
      fill: ["#3b82f6", "#10b981", "#f59e0b"][index % 3],
    }));

  const getMetricColor = (current: number, target: number) => {
    if (target === 0) return "text-gray-600";
    const percentage = (current / target) * 100;
    if (percentage >= 100) return "text-green-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressBarColor = (current: number, target: number) => {
    if (target === 0) return "bg-gray-600";
    const percentage = (current / target) * 100;
    if (percentage >= 100) return "bg-green-600";
    if (percentage >= 75) return "bg-blue-600";
    if (percentage >= 50) return "bg-yellow-600";
    return "bg-red-600";
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Success Metrics</h1>
            <p className="text-gray-600 mt-2">
              Track progress toward SOW targets
            </p>
          </div>

          {/* Overall Progress Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Overall Progress
              </h2>
              <span className="text-3xl font-bold text-blue-600">
                {overallProgress.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {projectCompletionMetric
                ? "Phase 1-3 complete, Phase 4 (Value Delivery) in progress"
                : "Average progress across all success metrics"}
            </p>
          </div>

          {/* Progress Comparison Chart */}
          {progressData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Current vs Target
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" fill="#3b82f6" name="Current" />
                  <Bar dataKey="target" fill="#e5e7eb" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Radial Progress Chart */}
          {radialData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Progress Overview
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <RadialBarChart
                  innerRadius="10%"
                  outerRadius="80%"
                  data={radialData}
                  startAngle={180}
                  endAngle={0}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                    label={{ position: "insideStart", fill: "#fff" }}
                  />
                  <Legend
                    iconSize={10}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                  />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Individual Metrics Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {metricsArray.map((metric) => {
              const key = Object.keys(metrics).find(k => metrics[k].id === metric.id) || "";
              const isEditing = editingMetric === metric.name;
              const percentage = metric.target === 0
                ? null
                : Math.min((metric.current / metric.target) * 100, 100);

              return (
                <div
                  key={metric.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {metric.name}
                      </h3>
                      <p className="text-sm text-gray-500">{metric.notes}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div
                        className={`text-3xl font-bold ${getMetricColor(
                          metric.current,
                          metric.target
                        )}`}
                      >
                        {metric.current}
                        {metric.unit === "percent" ? "%" : ""}
                      </div>
                      <div className="text-sm text-gray-500">
                        Target: {metric.target}
                        {metric.unit === "percent" ? "%" : ""}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-700 font-medium">
                        Progress to Target
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {percentage !== null ? `${percentage.toFixed(0)}%` : "-"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(
                          metric.current,
                          metric.target
                        )}`}
                        style={{ width: `${percentage !== null ? Math.min(percentage, 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Update Form */}
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Value
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={metric.unit === "percent" ? 100 : undefined}
                          step={metric.unit === "percent" ? 1 : 0.1}
                          value={newValue}
                          onChange={(e) => setNewValue(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleUpdateMetric(metric.name, newValue)
                          }
                          disabled={updating === metric.name}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                        >
                          {updating === metric.name ? "Updating..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingMetric(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingMetric(metric.name);
                        setNewValue(metric.current);
                      }}
                      className="w-full px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Update Metric
                    </button>
                  )}

                  {/* Last Updated */}
                  {metric.updated_at && (
                    <div className="text-xs text-gray-400 mt-3">
                      Last updated:{" "}
                      {new Date(metric.updated_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
