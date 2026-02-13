"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "@/components/ui/Navigation";
import { authenticatedFetch } from "@/lib/api";

interface SampleProject {
  id: number;
  name: string;
  delivery_method: string;
  type: string;
  location?: string;
  size_mb: number;
  size_sf?: number;
  document_counts: {
    pdfs?: number;
    excel?: number;
    cad?: number;
    word?: number;
    publisher?: number;
    total: number;
  };
  key_features: string[];
  ai_value: string;
  key_files?: Array<{
    name: string;
    size_mb?: number;
    description: string;
  }>;
  metrics?: any;
  description: string;
  highlights: string[];
}

interface ProjectStats {
  total_projects: number;
  total_documents: number;
  total_size_mb: number;
  total_size_gb: number;
  delivery_methods: {
    [key: string]: number;
  };
}

const DELIVERY_METHOD_INFO = {
  DATA: {
    name: "DATA Delivery",
    icon: "📋",
    color: "blue",
    description: "Product-focused estimation with specification compliance",
    focus: "Material selection and product data validation"
  },
  DESIGN_BUILD: {
    name: "Design Build / Design Assist",
    icon: "🏗️",
    color: "green",
    description: "Rate-based estimation with transparent cost methodology",
    focus: "Professional rates and pre-construction services"
  },
  PLAN_SPEC_BID: {
    name: "Plan-Spec-Bid",
    icon: "📐",
    color: "purple",
    description: "Competitive bidding with drawing-based quantity takeoff",
    focus: "Change management and competitive analysis"
  }
};

export default function SampleProjects() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [projects, setProjects] = useState<SampleProject[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = `/api/auth/login${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION ? `?organization=${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION}` : ''}`;
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchStats();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const response = await authenticatedFetch("/api/sample-projects");

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authenticatedFetch("/api/sample-projects/stats");

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
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

  const filteredProjects = selectedDeliveryMethod
    ? projects.filter((p) => p.delivery_method === selectedDeliveryMethod)
    : projects;

  const projectsByDeliveryMethod = {
    DATA: projects.filter((p) => p.delivery_method === "DATA"),
    DESIGN_BUILD: projects.filter((p) => p.delivery_method === "DESIGN_BUILD"),
    PLAN_SPEC_BID: projects.filter((p) => p.delivery_method === "PLAN_SPEC_BID"),
  };

  // Featured projects
  const sanitizerProject = projects.find((p) => p.name === "SANITIZER ADDITION");
  const ambroseProject = projects.find((p) => p.name.includes("Ambrose"));

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Training Dataset - Sample Projects
            </h1>
            <p className="text-gray-600 mb-4">
              Real electrical estimation projects providing comprehensive training data for AI-based estimation analysis.
            </p>

            {/* Stats Summary */}
            {stats && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">📁</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Comprehensive Training Dataset
                    </h3>
                    <p className="text-gray-700 mb-3">
                      {stats.total_projects} complete projects spanning 3 delivery methodologies with {stats.total_documents.toLocaleString()} real documents.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.total_projects}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Projects</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.total_documents.toLocaleString()}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Documents</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.total_size_gb} GB</div>
                        <div className="text-xs sm:text-sm text-gray-600">Total Size</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-xl sm:text-2xl font-bold text-orange-600">3</div>
                        <div className="text-xs sm:text-sm text-gray-600">Delivery Methods</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Featured Projects */}
          {(sanitizerProject || ambroseProject) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">⭐ Exceptional for AI Training</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {sanitizerProject && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{sanitizerProject.name}</h3>
                        <p className="text-sm text-gray-600">{sanitizerProject.type}</p>
                      </div>
                      <span className="px-3 py-1 bg-purple-600 text-white text-sm font-semibold rounded-full">
                        {sanitizerProject.size_mb} MB
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between bg-white rounded p-2">
                        <span className="text-sm font-semibold">269 Change Orders Tracked!</span>
                        <span className="text-purple-600 font-bold">🔥</span>
                      </div>
                      <div className="flex items-center justify-between bg-white rounded p-2">
                        <span className="text-sm">{sanitizerProject.document_counts.total.toLocaleString()} Documents</span>
                        <span className="text-gray-600">📄</span>
                      </div>
                      <div className="flex items-center justify-between bg-white rounded p-2">
                        <span className="text-sm">8 Subcontractors Tracked</span>
                        <span className="text-gray-600">👷</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 italic">
                      Exceptional change management case study - 269 documented changes from bid to completion.
                    </p>
                  </div>
                )}
                {ambroseProject && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{ambroseProject.name}</h3>
                        <p className="text-sm text-gray-600">{ambroseProject.type}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                        {ambroseProject.size_mb} MB
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between bg-white rounded p-2">
                        <span className="text-sm font-semibold">5 Competing Contractors!</span>
                        <span className="text-blue-600 font-bold">🏆</span>
                      </div>
                      <div className="flex items-center justify-between bg-white rounded p-2">
                        <span className="text-sm">{ambroseProject.size_sf?.toLocaleString()} SF</span>
                        <span className="text-gray-600">📐</span>
                      </div>
                      <div className="flex items-center justify-between bg-white rounded p-2">
                        <span className="text-sm">Complete Bid Evolution</span>
                        <span className="text-gray-600">📈</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 italic">
                      Full competitive bidding documentation showing how bids evolve through multiple iterations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delivery Method Tabs */}
          <div className="mb-6 flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedDeliveryMethod(null)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedDeliveryMethod === null
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              All Projects ({projects.length})
            </button>
            {Object.entries(DELIVERY_METHOD_INFO).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setSelectedDeliveryMethod(key)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedDeliveryMethod === key
                    ? `bg-${info.color}-600 text-white`
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {info.icon} {info.name} ({projectsByDeliveryMethod[key as keyof typeof projectsByDeliveryMethod].length})
              </button>
            ))}
          </div>

          {/* Projects by Delivery Method */}
          {Object.entries(DELIVERY_METHOD_INFO).map(([method, methodInfo]) => {
            const methodProjects = projectsByDeliveryMethod[method as keyof typeof projectsByDeliveryMethod];

            if (selectedDeliveryMethod && selectedDeliveryMethod !== method) {
              return null;
            }

            if (methodProjects.length === 0) {
              return null;
            }

            return (
              <div key={method} className="mb-10">
                <div className={`bg-${methodInfo.color}-50 border-l-4 border-${methodInfo.color}-600 p-4 mb-4 rounded-r-lg`}>
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{methodInfo.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">{methodInfo.name}</h2>
                      <p className="text-gray-700 text-sm mb-1">{methodInfo.description}</p>
                      <p className="text-gray-600 text-sm italic">Focus: {methodInfo.focus}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6">
                  {methodProjects.map((project) => (
                    <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                      {/* Project Header */}
                      <div className={`bg-gradient-to-r from-${methodInfo.color}-50 to-${methodInfo.color}-100 px-6 py-4 border-b`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{project.name}</h3>
                            <p className="text-gray-600 text-sm mb-2">{project.type}</p>
                            {project.location && (
                              <p className="text-gray-500 text-sm">📍 {project.location}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">{project.size_mb} MB</div>
                            {project.size_sf && (
                              <div className="text-sm text-gray-600">{project.size_sf.toLocaleString()} SF</div>
                            )}
                            <div className="text-sm text-gray-600 mt-1">
                              {project.document_counts.total.toLocaleString()} docs
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 grid md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                          {/* Description */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Project Overview</h4>
                            <p className="text-sm text-gray-600">{project.description}</p>
                          </div>

                          {/* Document Breakdown */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Document Types</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {project.document_counts.pdfs && (
                                <div className="bg-gray-50 rounded p-2">
                                  <div className="text-sm text-gray-500">PDFs</div>
                                  <div className="font-semibold text-gray-900">{project.document_counts.pdfs}</div>
                                </div>
                              )}
                              {project.document_counts.excel && (
                                <div className="bg-gray-50 rounded p-2">
                                  <div className="text-sm text-gray-500">Excel</div>
                                  <div className="font-semibold text-gray-900">{project.document_counts.excel}</div>
                                </div>
                              )}
                              {project.document_counts.cad && (
                                <div className="bg-gray-50 rounded p-2">
                                  <div className="text-sm text-gray-500">CAD</div>
                                  <div className="font-semibold text-gray-900">{project.document_counts.cad}</div>
                                </div>
                              )}
                              {project.document_counts.word && (
                                <div className="bg-gray-50 rounded p-2">
                                  <div className="text-sm text-gray-500">Word</div>
                                  <div className="font-semibold text-gray-900">{project.document_counts.word}</div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Key Highlights */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">✨ Key Highlights</h4>
                            <div className="space-y-1">
                              {project.highlights.map((highlight, idx) => (
                                <div key={idx} className="text-sm text-gray-600 flex items-start gap-2 bg-green-50 rounded p-2">
                                  <span className="text-green-500 mt-0.5">✓</span>
                                  {highlight}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          {/* AI Training Value */}
                          <div className={`bg-gradient-to-br from-${methodInfo.color}-50 to-${methodInfo.color}-100 rounded-lg p-4`}>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              🤖 AI Training Value
                            </h4>
                            <p className="text-sm text-gray-700">{project.ai_value}</p>
                          </div>

                          {/* Key Features */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">📋 Key Features</h4>
                            <ul className="space-y-1">
                              {project.key_features.map((feature, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                  <span className={`text-${methodInfo.color}-500 mt-0.5`}>•</span>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Key Files */}
                          {project.key_files && project.key_files.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">📄 Key Files</h4>
                              <div className="space-y-2">
                                {project.key_files.map((file, idx) => (
                                  <div key={idx} className="bg-gray-50 rounded p-2">
                                    <div className="text-sm font-semibold text-gray-900">{file.name}</div>
                                    <div className="text-xs text-gray-600">{file.description}</div>
                                    {file.size_mb && (
                                      <div className="text-xs text-gray-500 mt-1">{file.size_mb} MB</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Metrics */}
                          {project.metrics && Object.keys(project.metrics).length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">📊 Project Metrics</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(project.metrics).map(([key, value], idx) => (
                                  <div key={idx} className="bg-gray-50 rounded p-2">
                                    <div className="text-xs text-gray-500">{key.replace(/_/g, ' ')}</div>
                                    <div className="text-sm font-semibold text-gray-900">
                                      {Array.isArray(value) ? value.join(', ') : String(value)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Footer Note */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🎯 Training Dataset Value
            </h3>
            <p className="text-gray-700 mb-3">
              This comprehensive collection of real electrical estimation projects provides:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">✓</span>
                  <strong>Real cost data</strong> from actual projects (not academic exercises)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">✓</span>
                  <strong>Complete project lifecycles</strong> from bid to completion
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">✓</span>
                  <strong>269 documented changes</strong> in SANITIZER ADDITION for change impact analysis
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">✓</span>
                  <strong>Competitive bidding patterns</strong> with 5 contractor comparison in Ambrose
                </li>
              </ul>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">✓</span>
                  <strong>Material takeoff examples</strong> from real estimates
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">✓</span>
                  <strong>Specification compliance</strong> documentation and product data
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">✓</span>
                  <strong>Rate transparency</strong> showing professional staff and O&P structures
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">✓</span>
                  <strong>Multi-discipline coordination</strong> visible across all project types
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
