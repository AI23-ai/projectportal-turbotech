"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "@/components/ui/Navigation";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ResearchSection {
  id: string;
  title: string;
  icon: string;
  summary: string;
  status: "completed" | "in_progress" | "pending";
}

const RESEARCH_SECTIONS: ResearchSection[] = [
  {
    id: "mccormick-overview",
    title: "McCormick Systems Overview",
    icon: "🔍",
    summary: "Cloud-based electrical estimating with 40+ years in market. Key features: Auto Count, Auto Home Run, Design Estimating Pro digital takeoff tool.",
    status: "completed",
  },
  {
    id: "auto-count-feature",
    title: "Auto Count Feature Analysis",
    icon: "🎯",
    summary: "Point-and-click digital takeoff with preloaded symbols. Lacks true OCR/computer vision for automatic symbol detection. Requires manual clicking for each symbol.",
    status: "completed",
  },
  {
    id: "andrew-workflow",
    title: "Andrew's Current Workflow",
    icon: "👤",
    summary: "Spends 27 hrs/week on pain points: Submittals (15h), Closeout docs (6h), Front-end docs (4h), Scope letters (2h). Loves takeoffs, hates documentation.",
    status: "completed",
  },
  {
    id: "andrew-feedback",
    title: "Andrew's Real User Feedback",
    icon: "💡",
    summary: "CRITICAL: Andrew uses McCormick for filtering/breakdown (34% of time), NOT takeoff tools (17%). Marketing emphasizes wrong features. #1 value: Multi-dimensional breakdowns.",
    status: "completed",
  },
  {
    id: "digital-takeoff",
    title: "Digital Takeoff Team Results",
    icon: "🤖",
    summary: "Phase 1 Complete! AI-powered electrical symbol detection: 92.9% vector PDF coverage, 95-100% accuracy, <3 sec processing. Workflow-based approach with E-001 legend parsing. Production ready.",
    status: "completed",
  },
  {
    id: "prd-development",
    title: "Product Requirements Document",
    icon: "📋",
    summary: "AI-powered replacement tool targeting 74% reduction in pain point tasks (20 hrs/week savings). Computer vision for symbol detection, AI for document automation.",
    status: "completed",
  },
  {
    id: "technical-research",
    title: "Technical Implementation Research",
    icon: "⚙️",
    summary: "YOLOv8/Detectron2 for symbol detection, Claude for document generation, Next.js frontend. Training on Andrew's actual drawings.",
    status: "in_progress",
  },
  {
    id: "visual-gallery",
    title: "Visual Feature Gallery",
    icon: "🖼️",
    summary: "38 screenshots from McCormick demo organized by feature. See the actual UI, workflow, and pain points in action.",
    status: "completed",
  },
  {
    id: "competitor-analysis",
    title: "Competitor Analysis",
    icon: "📊",
    summary: "ConEst, Accubid, Trimble comparison. Our competitive advantage: AI-first, Andrew-optimized, learning system, pain point focus.",
    status: "pending",
  },
  {
    id: "togal-ai",
    title: "Togal.AI Competitive Research",
    icon: "🚀",
    summary: "AI-powered construction takeoff software. 76% faster than competitors (Kansas University study). 4.9/5 stars, $2,999/year. Cloud-native with AI automation via 'The Togal Button'. Key differentiator vs McCormick: AI speed vs breakdown/filtering power.",
    status: "completed",
  },
];

export default function Research() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState<string>("mccormick-overview");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<string>("");
  const [modalTitle, setModalTitle] = useState<string>("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = `/api/auth/login${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION ? `?organization=${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION}` : ''}`;
    }
  }, [user, userLoading, router]);

  const loadMarkdown = async (fileId: string, title: string) => {
    setIsLoadingContent(true);
    setModalTitle(title);
    setShowModal(true);

    try {
      const response = await fetch(`/api/research/${fileId}`);
      if (!response.ok) {
        throw new Error('Failed to load content');
      }

      const data = await response.json();
      setModalContent(data.content);
    } catch (error) {
      console.error('Error loading markdown:', error);
      setModalContent('# Error\n\nFailed to load content. Please try again.');
    } finally {
      setIsLoadingContent(false);
    }
  };

  if (userLoading) {
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
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case "mccormick-overview":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Company Overview</h3>
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <p className="text-gray-700"><strong>Company:</strong> McCormick Systems (Foundation Software family)</p>
                <p className="text-gray-700"><strong>Location:</strong> Chandler, Arizona</p>
                <p className="text-gray-700"><strong>Experience:</strong> 40+ years in construction estimating</p>
                <p className="text-gray-700"><strong>Platform:</strong> Cloud-based, accessible from any device</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Offerings</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">McCormick</h4>
                  <p className="text-sm text-gray-600">Essential estimating solution for small to mid-size contractors</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">McCormick Pro</h4>
                  <p className="text-sm text-gray-600">Advanced estimating with customizable features</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-3">
                  <span className="text-green-500">✓</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Auto Count & Auto Home Run</h4>
                    <p className="text-sm text-gray-600">Patented features for automated takeoff calculations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-3">
                  <span className="text-green-500">✓</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Design Estimating Pro</h4>
                    <p className="text-sm text-gray-600">Point-and-click digital takeoff tool built-in</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-3">
                  <span className="text-green-500">✓</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Electrical Database</h4>
                    <p className="text-sm text-gray-600">55,000+ items, 25,000+ prebuilt assemblies, NECA labor units</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-3">
                  <span className="text-green-500">✓</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Cloud Integration</h4>
                    <p className="text-sm text-gray-600">Foundation Software ecosystem (accounting, payroll, project management)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "auto-count-feature":
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">⚠️ Critical Finding</h3>
              <p className="text-gray-700">
                Despite marketing as "Auto Count", the feature requires <strong>manual point-and-click for each symbol</strong>.
                There is NO true OCR or computer vision for automatic symbol detection.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How It Works</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">1</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Import PDF/CAD Drawing</h4>
                    <p className="text-sm text-gray-600">Upload drawings to Design Estimating Pro</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">2</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Select Symbol from Library</h4>
                    <p className="text-sm text-gray-600">Choose from preloaded electrical symbols (customizable)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">3</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Manual Point-and-Click</h4>
                    <p className="text-sm text-gray-600">Click on each occurrence of the symbol on the drawing</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">4</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Count Accumulates</h4>
                    <p className="text-sm text-gray-600">Software counts clicks and adds to estimate</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Strengths vs. Weaknesses</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">✓ Strengths</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Preloaded electrical symbol library</li>
                    <li>• Customizable symbols (line width, opacity)</li>
                    <li>• Integrated with estimating software</li>
                    <li>• Tracks counts automatically</li>
                    <li>• Supports PDF and CAD formats</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">✗ Weaknesses</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Requires manual clicking for EACH symbol</li>
                    <li>• No automatic symbol recognition</li>
                    <li>• Time-consuming (20+ min per sheet)</li>
                    <li>• No batch processing</li>
                    <li>• No learning/AI capabilities</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Time Analysis</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-gray-700 mb-2">
                  <strong>Current McCormick Workflow:</strong> 20+ minutes per sheet
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Typical Project:</strong> 50 sheets × 20 min = <span className="text-red-700 font-semibold">16.7 hours</span>
                </p>
                <p className="text-green-700 font-semibold">
                  <strong>AI-Powered Target:</strong> 2-3 minutes per sheet = <span className="text-green-700 font-semibold">2.5 hours</span> (85% reduction)
                </p>
              </div>
            </div>
          </div>
        );

      case "andrew-feedback":
        return (
          <div className="space-y-6">
            {/* Critical Finding */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">CRITICAL: Marketing vs. Reality Gap</h3>
                  <p className="text-gray-700 mb-4">
                    <strong>Andrew's live demo reveals what he ACTUALLY values vs. what McCormick's marketing emphasizes.</strong>
                    This is critical intelligence for the Project Platform - we must build what users actually need, not what vendors think they want.
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Andrew's Quote (0:21):</h4>
                    <p className="text-gray-700 italic">
                      "The first thing, one of the main reasons why I choose to use this on larger jobs over our Excel templates
                      is the ability to break my takeoff down into sections."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Allocation Comparison */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Marketing vs. Real User Priorities</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Marketing Demo */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">📺 McCormick Marketing Demo (31 min)</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">Digital takeoff tools</span>
                        <span className="text-sm font-semibold text-gray-900">46%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '46%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">Assemblies</span>
                        <span className="text-sm font-semibold text-gray-900">14%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-400 h-2 rounded-full" style={{width: '14%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">Filtering/reporting</span>
                        <span className="text-sm font-semibold text-gray-900">13%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-400 h-2 rounded-full" style={{width: '13%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Andrew's Real Usage */}
                <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">✓ Andrew's Real Usage (11 min demo)</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 font-semibold">Filtering and reporting</span>
                        <span className="text-sm font-bold text-green-700">34%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '34%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 font-semibold">Assemblies</span>
                        <span className="text-sm font-bold text-green-700">21%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '21%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">On-screen takeoff</span>
                        <span className="text-sm font-semibold text-gray-900">17%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-400 h-2 rounded-full" style={{width: '17%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Key Insight:</strong> Marketing spends 46% of time on digital takeoff, but Andrew only uses it 17% of the time.
                  The <strong>real value</strong> (34% of his time) is in <strong>filtering and multi-dimensional breakdowns</strong> - which marketing only covers for 13% of the demo.
                </p>
              </div>
            </div>

            {/* What Andrew Actually Values */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What Andrew Actually Values (Priority Order)</h3>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Multi-Dimensional Breakdown Structure</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Hierarchical labels: Base bid/Alternates → Area A/B → Floor 1/2/3 → System type.
                        <strong> This is THE primary reason he chooses McCormick over Excel.</strong>
                      </p>
                      <div className="bg-white rounded p-2 text-sm text-gray-600 italic">
                        "At the end I can break it down and see how the hours shake out, how labor material can be divided out"
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-sky-50 border-l-4 border-blue-500 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Instant Multi-Dimensional Filtering</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Real use case: Customer called asking about hours for sound systems on third floor.
                        Andrew filtered and answered in seconds.
                      </p>
                      <div className="bg-white rounded p-2 text-sm text-gray-600 italic">
                        "I had a phone call this morning... I know that he has 66 hours to install these items on the third floor for this particular system"
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Assembly-Based Takeoff Efficiency</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        One click enters 9 components (conduit, box, hanger, wire, device, labor, hardware).
                        Pull station assembly example.
                      </p>
                      <div className="bg-white rounded p-2 text-sm text-gray-600 italic">
                        "Huge advantage over using this tool versus our Excel spreadsheet... having the ability to put items together into a single assembly"
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">On-Screen Takeoff Tools</h4>
                      <p className="text-sm text-gray-700">
                        Useful but not the primary driver. Count-based, linear takeoff for wire.
                        <strong>This is what marketing emphasizes (46%) but Andrew uses least (17%).</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pain Points */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Andrew's Pain Points</h3>
              <div className="space-y-3">
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⚠️</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 mb-2">1. Label Selection Workflow (PRIMARY PAIN POINT)</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Must set active label BEFORE every takeoff operation. If you forget, items go into wrong category and it's very difficult to fix.
                      </p>
                      <div className="bg-white rounded p-2 text-sm text-gray-600 italic">
                        "That is one of the pain points where you kind of have to pay attention before you select anything or else it's a pain to go back and edit it after the fact."
                      </div>
                      <div className="mt-2 bg-yellow-50 border border-yellow-300 rounded p-2">
                        <p className="text-xs text-gray-700">
                          <strong>For Project Platform:</strong> Make label selection automatic based on drawing location, or make it trivially easy to bulk re-label items.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-xl">⚠️</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-orange-900 mb-2">2. General Usability Issues</h4>
                      <p className="text-sm text-gray-700 italic">
                        "It's not super user-friendly always... it does not always do what you think it's going to do"
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Unexpected behaviors, deletion/editing requires multiple screens, screen switching doesn't work as expected.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decision Criteria */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">When Andrew Chooses McCormick vs. Excel</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">✓ Uses McCormick When:</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• <strong>Larger jobs</strong></li>
                    <li>• <strong>Schedule of values breakdown needed</strong> (by floor, area, system)</li>
                    <li>• <strong>Uncertain future requirements</strong> - "I don't always know what it is"</li>
                    <li>• Needs <strong>instant filtering</strong> for customer questions</li>
                  </ul>
                  <div className="mt-3 bg-white rounded p-2 text-xs text-gray-600 italic">
                    "If I take it off from the beginning with all that information there, at the end, it's as easy as going through and just clicking a few checkboxes"
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Uses Excel When:</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Smaller jobs (implied)</li>
                    <li>• Simple estimates without breakdown requirements</li>
                    <li>• When multi-dimensional filtering isn't needed</li>
                    <li>• Quick turnaround estimates</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Product Implications */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Implications for Project Platform</h3>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">1. PRIORITIZE: Multi-Dimensional Breakdown & Filtering</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    This is the #1 reason Andrew uses McCormick. The Project Platform MUST have:
                  </p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Flexible label hierarchy (bid type → area → floor → system)</li>
                    <li>• Instant filtering by any dimension or combination</li>
                    <li>• One-click reporting (hours by floor, materials by system, etc.)</li>
                    <li>• Real-time audit trail as Andrew works</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-600 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">2. EMPHASIZE: Assembly-Based Efficiency</h4>
                  <p className="text-sm text-gray-700">
                    Andrew called this a "huge advantage". Build comprehensive assembly library with one-click entry of all components.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-600 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">3. ENHANCE: Takeoff Tools (but don't over-emphasize)</h4>
                  <p className="text-sm text-gray-700">
                    Make AI-powered symbol detection better than McCormick's manual clicking, but remember: this isn't why Andrew chooses the tool.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-600 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">4. FIX: Label Selection Pain Point</h4>
                  <p className="text-sm text-gray-700">
                    Make it impossible to forget label selection. Options: auto-detect from location, prominent visual reminder, easy bulk re-labeling.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-600 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">5. POSITIONING: "Excel on Steroids"</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Andrew's mental model: McCormick = Excel + Filters + Assemblies. Market to estimators currently using Excel templates.
                  </p>
                  <div className="bg-white rounded p-2 text-xs text-gray-600 italic">
                    "It takes an Excel file and it adds a bunch of filters to it to see the information that you're trying to see."
                  </div>
                </div>
              </div>
            </div>

            {/* Andrew's Quotes */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💬 Key Quotes for Marketing/Sales</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border-l-4 border-indigo-400">
                  <p className="text-sm text-gray-700 italic mb-1">
                    "The first thing, one of the main reasons why I choose to use this on larger jobs over our Excel templates
                    is the ability to break my takeoff down into sections."
                  </p>
                  <p className="text-xs text-gray-500">— On primary value (0:21)</p>
                </div>
                <div className="bg-white rounded-lg p-3 border-l-4 border-indigo-400">
                  <p className="text-sm text-gray-700 italic mb-1">
                    "It allows you to sort through a lot of information very quickly, whereas with the Excel file,
                    it's a lot of manual time and work and copying and pasting and inserting calculations."
                  </p>
                  <p className="text-xs text-gray-500">— On Excel comparison (10:23)</p>
                </div>
                <div className="bg-white rounded-lg p-3 border-l-4 border-indigo-400">
                  <p className="text-sm text-gray-700 italic mb-1">
                    "Another huge advantage over using this tool versus our Excel spreadsheet is having the ability to put
                    items together into a single assembly and take off the entire assembly."
                  </p>
                  <p className="text-xs text-gray-500">— On assemblies (2:04)</p>
                </div>
              </div>
            </div>

            {/* Source Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">📊 Analysis Methodology</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Source:</strong> 11:48 screen recording from Andrew (Oct 23, 2025)</p>
                <p><strong>Context:</strong> Real workflow demonstration on fire alarm estimate (not a sales demo)</p>
                <p><strong>Analysis:</strong> Timestamped transcript + 9 screenshots + comparison to 31-min marketing demo</p>
                <p><strong>Location:</strong> <code className="bg-gray-200 px-1 py-0.5 rounded text-xs">/mnt/c/Prj/Active/AITools/yt2prd/product-eval/mccormick/user-feedback/</code></p>
              </div>
            </div>
          </div>
        );

      case "digital-takeoff":
        return (
          <div className="space-y-6">
            {/* Executive Summary */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🎉</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Phase 1 Complete - Production Ready!</h3>
                  <p className="text-gray-700 mb-4">
                    The Digital Takeoff team has successfully completed Phase 1 of AI-powered electrical symbol detection.
                    The system achieves <strong>92.9% vector PDF coverage</strong> with <strong>95-100% accuracy</strong> and
                    processes drawings in <strong>&lt;3 seconds</strong>. The workflow-based approach mirrors how estimators
                    actually work, making it immediately intuitive and production-ready.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">PRODUCTION READY</span>
                    <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">37/37 TESTS PASSING</span>
                    <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">E-001 PARSER</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Key Performance Metrics</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-700 mb-1">92.9%</div>
                  <div className="text-sm text-gray-700 font-medium">Vector PDF Coverage</div>
                  <div className="text-xs text-gray-600 mt-1">2,846 PDFs analyzed</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-700 mb-1">95-100%</div>
                  <div className="text-sm text-gray-700 font-medium">Detection Accuracy</div>
                  <div className="text-xs text-gray-600 mt-1">On vector PDFs</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-700 mb-1">&lt;3 sec</div>
                  <div className="text-sm text-gray-700 font-medium">Processing Time</div>
                  <div className="text-xs text-gray-600 mt-1">Per drawing</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-orange-700 mb-1">219</div>
                  <div className="text-sm text-gray-700 font-medium">Total Symbols</div>
                  <div className="text-xs text-gray-600 mt-1">100 symbols + 119 abbrev</div>
                </div>
              </div>
            </div>

            {/* Key Innovation */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">💡</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Innovation: Workflow-Based Approach</h3>
                  <p className="text-gray-700 mb-4">
                    Unlike traditional OCR tools, our system <strong>mirrors how estimators actually work</strong>.
                    The E-001 legend parser automatically extracts project-specific symbol definitions from the drawing legend,
                    then uses those definitions to classify symbols throughout the project. This matches the estimator's
                    mental model: "Check the legend first, then identify symbols on the drawings."
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">E-001 Legend Parser</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• <strong>52 power symbols</strong> (outlets, switches, panels)</li>
                        <li>• <strong>48 lighting symbols</strong> (fixtures, controls)</li>
                        <li>• <strong>119 abbreviations</strong> (AFF, EMT, etc.)</li>
                        <li>• Automatic extraction from E-001 sheet</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Context-Aware Classification</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• Uses legend as ground truth</li>
                        <li>• Handles project-specific variations</li>
                        <li>• Rule-based + visual matching</li>
                        <li>• Extensible for custom symbols</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Achievements */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🔧 Technical Achievements</h3>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-blue-50 to-sky-50 border-l-4 border-blue-600 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">1. Vector PDF Extraction Pipeline</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Complete extraction system using <strong>pdfplumber</strong> for text, shapes, and paths.
                    Processes 92.9% of construction PDFs with high fidelity.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">Python 3.11</span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">pdfplumber</span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">FastAPI</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-600 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">2. E-001 Legend Parser</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Automatically extracts and parses electrical symbol legends. Handles both standard IEEE/NFPA symbols
                    and project-specific variations. Builds project symbol taxonomy on-the-fly.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">52 Power Symbols</span>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">48 Lighting Symbols</span>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">119 Abbreviations</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-600 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">3. Interactive Viewer</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Beautiful web interface using <strong>PDF.js</strong> with real-time symbol highlighting.
                    Click any symbol to see classification details, confidence scores, and bounding box coordinates.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">PDF.js Viewer</span>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">Real-time Highlights</span>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">Interactive</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-600 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">4. Symbol Classification Engine</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Rule-based classifier with context-aware symbol recognition. Handles shape-based (circles, triangles)
                    and text-based symbols. Extensible architecture for YOLOv11 integration in Phase 4.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">Rule-Based</span>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">Context-Aware</span>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">YOLOv11-Ready</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-600 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">5. Comprehensive Testing & Quality</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>37/37 unit tests passing</strong> with comprehensive coverage. Test suite includes
                    E-001 parsing, symbol classification, API endpoints, and edge cases.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">37 Tests Passing</span>
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">pytest</span>
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">CI/CD Ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Integration Points */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🔗 Integration Opportunities</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">API Endpoints</h4>
                  <div className="space-y-2 text-sm">
                    <div className="bg-gray-50 rounded p-2 font-mono text-xs">
                      <strong>Base URL:</strong> http://192.168.1.25:8002
                    </div>
                    <ul className="space-y-1 text-gray-700">
                      <li>• <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">POST /api/extract</code> - Extract symbols from PDF</li>
                      <li>• <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">GET /api/projects</code> - List analyzed projects</li>
                      <li>• <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">GET /api/symbols/{'{id}'}</code> - Get symbol details</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Database Schema</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Complete schema provided for integration with TurboTech Portal database.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• <strong>Projects:</strong> Project metadata, PDFs</li>
                    <li>• <strong>Symbols:</strong> Detected symbols with coordinates</li>
                    <li>• <strong>Classifications:</strong> Symbol types, confidence</li>
                    <li>• <strong>E001_Legends:</strong> Project symbol definitions</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Reusable UI Components</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    PDF viewer and symbol overlay components ready for Next.js integration.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• PDF.js viewer wrapper</li>
                    <li>• Symbol highlight overlays</li>
                    <li>• Interactive tooltips</li>
                    <li>• Classification confidence UI</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Live Demo</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Working demo with real project data available now.
                  </p>
                  <div className="space-y-2">
                    <a
                      href="http://192.168.1.25:3002"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View Live Demo →
                    </a>
                    <a
                      href="http://192.168.1.25:8002/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-gray-600 text-white text-center py-2 px-4 rounded hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      API Documentation →
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Coverage Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📈 PDF Coverage Analysis</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Vector PDFs (Excellent Quality)</span>
                    <span className="text-sm font-bold text-green-700">92.9% (2,645 files)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-600 h-3 rounded-full" style={{width: '92.9%'}}></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">✓ Full extraction support with 95-100% accuracy</p>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Raster PDFs (Images/Scans)</span>
                    <span className="text-sm font-bold text-yellow-700">7.1% (201 files)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-yellow-500 h-3 rounded-full" style={{width: '7.1%'}}></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">⚠️ Requires YOLOv11 (Phase 4 - Raster Support)</p>
                </div>

                <div className="bg-blue-50 rounded p-3 mt-4">
                  <p className="text-sm text-gray-700">
                    <strong>Phase 1 Focus:</strong> Vector PDFs represent the vast majority (93%) of construction drawings.
                    Phase 4 will add YOLOv11 for the remaining 7% of raster/scanned PDFs.
                  </p>
                </div>
              </div>
            </div>

            {/* Next Phases Roadmap */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🚀 Roadmap: Next Phases</h3>
              <div className="space-y-3">
                <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-green-900">Phase 1: Symbol Detection ✓</h4>
                    <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">COMPLETE</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Vector PDF extraction, E-001 parser, interactive viewer, 37 tests passing. Production ready!
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-900">Phase 2: Workflow Integration</h4>
                    <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">NEXT</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Integrate with McCormick-style estimating workflow: label selection, assembly-based takeoff,
                    multi-dimensional breakdowns (Andrew's #1 feature request).
                  </p>
                  <div className="text-xs text-gray-600">
                    <strong>Deliverables:</strong> Label hierarchy, assembly library, filtering UI, export to estimate format
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-purple-900">Phase 3: Multi-Project Testing</h4>
                    <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">PLANNED</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Test across all 15 projects (DATA, DESIGN BUILD, PLAN-SPEC-BID). Refine E-001 parser,
                    improve classification accuracy, handle edge cases.
                  </p>
                  <div className="text-xs text-gray-600">
                    <strong>Deliverables:</strong> 99%+ accuracy, cross-project validation, auto-labeling training data
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-yellow-900">Phase 4: Raster PDF Support</h4>
                    <span className="bg-yellow-600 text-white text-xs font-semibold px-3 py-1 rounded-full">FUTURE</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Add YOLOv11 for raster/scanned PDFs (7.1% of drawings). Train on 50K+ auto-labeled images
                    from vector PDFs. Complete 100% coverage.
                  </p>
                  <div className="text-xs text-gray-600">
                    <strong>Deliverables:</strong> YOLOv11 model, 50K training dataset, unified vector+raster pipeline
                  </div>
                </div>
              </div>
            </div>

            {/* Team & Timeline */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">📊 Project Summary</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Team</div>
                  <div className="font-medium text-gray-900">Digital Takeoff Team</div>
                  <div className="text-xs text-gray-600">AI Symbol Detection</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Server</div>
                  <div className="font-medium text-gray-900">192.168.1.25 (ai1)</div>
                  <div className="text-xs text-gray-600">Ports 8002/3002</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Timeline</div>
                  <div className="font-medium text-gray-900">Phase 1: 6 weeks</div>
                  <div className="text-xs text-gray-600">October-November 2025</div>
                </div>
              </div>
            </div>
          </div>
        );

      case "andrew-workflow":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Andrew Nyitray - Project Estimator Profile</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">✓ Strengths (Leverage)</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Takeoffs with detailed breakdowns</li>
                    <li>• Project setup (budgets, SoV, schedules)</li>
                    <li>• Job costing and tracking</li>
                    <li>• Methodical, detail-oriented approach</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">⚠️ Pain Points (Solve)</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• <strong>Submittals:</strong> 15 hrs/week (TOP PRIORITY)</li>
                    <li>• <strong>Closeout docs:</strong> 6 hrs/week</li>
                    <li>• <strong>Front-end docs:</strong> 4 hrs/week</li>
                    <li>• <strong>Scope letters:</strong> 2 hrs/week</li>
                    <li className="font-semibold text-red-700 pt-1">TOTAL: 27 hrs/week wasted</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Current McCormick Workflow</h3>
              <div className="space-y-2">
                {[
                  { step: 1, task: "Receive drawings from GC", time: "", pain: false },
                  { step: 2, task: "Import PDFs into McCormick", time: "", pain: false },
                  { step: 3, task: "Manual symbol clicking", time: "20+ min/sheet", pain: true },
                  { step: 4, task: "Build assembly estimates", time: "", pain: false },
                  { step: 5, task: "Generate estimate", time: "", pain: false },
                  { step: 6, task: "Manual submittal creation", time: "2-40 hrs/project", pain: true },
                  { step: 7, task: "Project awarded - setup", time: "", pain: false },
                  { step: 8, task: "Manual front-end docs", time: "4 hrs/week", pain: true },
                  { step: 9, task: "Project execution", time: "", pain: false },
                  { step: 10, task: "Manual closeout docs", time: "2-10 hrs/project", pain: true },
                ].map((item) => (
                  <div
                    key={item.step}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      item.pain ? "bg-red-50 border border-red-200" : "bg-white border border-gray-200"
                    }`}
                  >
                    <div className={`rounded-full w-8 h-8 flex items-center justify-center font-semibold ${
                      item.pain ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-900 font-medium">{item.task}</span>
                      {item.time && <span className="text-red-700 font-semibold ml-2">({item.time})</span>}
                    </div>
                    {item.pain && <span className="text-red-600 font-semibold">⚠️</span>}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Andrew's AI Strategy</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Pace</div>
                  <div className="font-semibold text-gray-900">Methodical</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Detail Level</div>
                  <div className="font-semibold text-gray-900">Detailed with templates</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Autonomy</div>
                  <div className="font-semibold text-gray-900">70%</div>
                </div>
              </div>
            </div>
          </div>
        );

      case "prd-development":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Product Vision</h3>
              <p className="text-gray-700 mb-4">
                Build an AI-powered electrical estimating tool that automates Andrew's 27 hrs/week of pain point tasks
                while enhancing (not replacing) his takeoff expertise.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">74%</div>
                  <div className="text-sm text-gray-600">Time Reduction</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">20 hrs</div>
                  <div className="text-sm text-gray-600">Weekly Savings</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">70%</div>
                  <div className="text-sm text-gray-600">AI Autonomy</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Core Features</h3>
              <div className="space-y-3">
                <div className="bg-white border-l-4 border-blue-500 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">1. Intelligent Symbol Detection</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Computer vision (YOLOv8) for automatic symbol recognition from PDF/CAD drawings
                  </p>
                  <p className="text-sm text-green-700 font-semibold">
                    Time Savings: 20 min/sheet → 2 min/sheet (90% reduction)
                  </p>
                </div>

                <div className="bg-white border-l-4 border-green-500 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">2. One-Click Submittal Generation</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    AI auto-populates submittals from takeoff data and manufacturer databases
                  </p>
                  <p className="text-sm text-green-700 font-semibold">
                    Time Savings: 15 hrs/week → 3 hrs/week (80% reduction)
                  </p>
                </div>

                <div className="bg-white border-l-4 border-purple-500 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">3. Intelligent Closeout Documentation</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Template-driven O&M manual assembly, as-builts, warranty docs, test reports
                  </p>
                  <p className="text-sm text-green-700 font-semibold">
                    Time Savings: 6 hrs/week → 1 hr/week (83% reduction)
                  </p>
                </div>

                <div className="bg-white border-l-4 border-yellow-500 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">4. Spec Intelligence & Front-End Extraction</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    AI parses specs, extracts Division 26 requirements, identifies alternates
                  </p>
                  <p className="text-sm text-green-700 font-semibold">
                    Time Savings: 4 hrs/week → 1 hr/week (75% reduction)
                  </p>
                </div>

                <div className="bg-white border-l-4 border-red-500 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">5. AI Scope Letter Drafting</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Generate scope letters from estimate data in Andrew's writing style
                  </p>
                  <p className="text-sm text-green-700 font-semibold">
                    Time Savings: 2 hrs/week → 0.5 hrs/week (75% reduction)
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Development Phases</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <span className="text-green-600 font-semibold">Phase 1</span>
                  <span className="text-gray-700">Core Takeoff (Weeks 1-4)</span>
                  <span className="ml-auto text-sm text-gray-600">Replace McCormick's basic takeoff</span>
                </div>
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="text-blue-600 font-semibold">Phase 2</span>
                  <span className="text-gray-700">Submittal Automation (Weeks 5-8)</span>
                  <span className="ml-auto text-sm text-gray-600">15 hrs/week → 3 hrs/week</span>
                </div>
                <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <span className="text-purple-600 font-semibold">Phase 3</span>
                  <span className="text-gray-700">Document Automation (Weeks 9-12)</span>
                  <span className="ml-auto text-sm text-gray-600">All 27 hrs/week pain points</span>
                </div>
                <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <span className="text-yellow-600 font-semibold">Phase 4</span>
                  <span className="text-gray-700">Learning & Optimization (Weeks 13-16)</span>
                  <span className="ml-auto text-sm text-gray-600">70% autonomy, high accuracy</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "technical-research":
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-700">
                <strong>Status:</strong> In Progress - Researching optimal technical stack for Andrew's tool
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Proposed Technical Architecture</h3>

              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Frontend</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• <strong>Framework:</strong> Next.js (consistent with current portal)</li>
                    <li>• <strong>Drawing Viewer:</strong> PDF.js or react-pdf for PDF rendering</li>
                    <li>• <strong>CAD Viewer:</strong> DXF parser for vector drawings</li>
                    <li>• <strong>Symbol Overlay:</strong> Canvas-based detection overlay</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Backend</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• <strong>Symbol Detection:</strong> Python + YOLOv8/Detectron2</li>
                    <li>• <strong>Document Processing:</strong> LangChain + Claude for AI generation</li>
                    <li>• <strong>Database:</strong> DynamoDB for project data, S3 for drawings</li>
                    <li>• <strong>APIs:</strong> AWS Lambda for serverless processing</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">AI/ML Components</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• <strong>Computer Vision:</strong> YOLOv8 trained on electrical symbols</li>
                    <li>• <strong>Document Generation:</strong> Claude 3.5 Sonnet with RAG</li>
                    <li>• <strong>Learning System:</strong> Store corrections, retrain periodically</li>
                    <li>• <strong>Manufacturer Data:</strong> API integrations + web scraping</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Research Needed</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-yellow-500">◯</span>
                  <span>Electrical symbol datasets for YOLOv8 training</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-yellow-500">◯</span>
                  <span>Manufacturer API availability (Eaton, Schneider, Legrand)</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-yellow-500">◯</span>
                  <span>Test symbol detection with your actual drawings</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-yellow-500">◯</span>
                  <span>Analyze Andrew's past submittals for template patterns</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "visual-gallery":
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📸 McCormick Interface Screenshots</h3>
              <p className="text-gray-700 mb-4">
                38 high-quality screenshots from McCormick's official demo video, organized by feature area.
                These provide visual reference for understanding the current workflow and identifying improvement opportunities.
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">38</div>
                  <div className="text-sm text-gray-600">Screenshots</div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-2xl font-bold text-pink-600">8</div>
                  <div className="text-sm text-gray-600">Feature Areas</div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-2xl font-bold text-indigo-600">46%</div>
                  <div className="text-sm text-gray-600">Core Feature Time</div>
                </div>
              </div>
            </div>

            {/* Feature Areas */}
            <div className="space-y-8">
              {/* Job Management */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">Job Management & Organization</h3>
                    <span className="text-sm text-gray-500">13% of demo time</span>
                  </div>
                  <p className="text-gray-600 text-sm">Filing cabinet system for organizing multiple projects and jobs</p>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { num: "01", title: "Job Screen Filing Cabinet", desc: "Main job organization interface" },
                    { num: "02", title: "Job Folders Organization", desc: "Folder structure for different job types" },
                    { num: "03", title: "Job Details Screen", desc: "Detailed view of job information" }
                  ].map((img) => (
                    <div key={img.num} className="bg-gray-50 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <a
                        href={`/research/mccormick/${img.num}_${img.title.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '')}.png`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <div className="aspect-video rounded mb-2 relative overflow-hidden group cursor-pointer">
                          <img
                            src={`/research/mccormick/${img.num}_${img.title.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '')}.png`}
                            alt={img.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-sm font-bold px-2 py-1 rounded shadow-lg">
                            {img.num}
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200 flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm font-semibold">Click to view</span>
                          </div>
                        </div>
                      </a>
                      <h4 className="font-semibold text-sm text-gray-900">{img.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{img.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Digital Takeoff - CORE FEATURE */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold text-gray-900">Digital Takeoff</h3>
                      <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded">CORE FEATURE</span>
                    </div>
                    <span className="text-sm font-semibold text-orange-700">46% of demo time</span>
                  </div>
                  <p className="text-gray-700 text-sm font-medium">The heart of McCormick - point-and-click digital takeoff with real-time estimation</p>
                </div>
                <div className="grid md:grid-cols-4 gap-3">
                  {[
                    { num: "09", title: "Active Label Set", filename: "09_active_label_set.png" },
                    { num: "10", title: "Database Items", filename: "10_database_items.png" },
                    { num: "11", title: "Assemblies Database", filename: "11_assemblies_database.png" },
                    { num: "12", title: "Assembly Byproducts", filename: "12_assembly_byproducts.png" },
                    { num: "13", title: "Design Estimating Pro", filename: "13_design_estimating_pro_plan.png" },
                    { num: "14", title: "Basic Counting", filename: "14_basic_counting_receptacles.png" },
                    { num: "15", title: "Audit Trail", filename: "15_audit_trail_tracking.png" },
                    { num: "16", title: "Branch Assembly", filename: "16_branch_assembly_selection.png" },
                    { num: "17", title: "Linear Takeoff", filename: "17_linear_takeoff_branch.png" },
                    { num: "18", title: "Text Overlay", filename: "18_text_overlay_branch.png" },
                    { num: "19", title: "Drop Values", filename: "19_drop_values_vertical.png" },
                    { num: "20", title: "Hot List", filename: "20_hot_list_feature.png" }
                  ].map((img) => (
                    <div key={img.num} className="bg-white rounded-lg p-2 hover:shadow-md transition-shadow">
                      <a
                        href={`/research/mccormick/${img.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <div className="aspect-video rounded mb-2 relative overflow-hidden group cursor-pointer">
                          <img
                            src={`/research/mccormick/${img.filename}`}
                            alt={img.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute top-2 left-2 bg-orange-600 text-white text-sm font-bold px-2 py-1 rounded shadow-lg">
                            {img.num}
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200 flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm font-semibold">Click to view</span>
                          </div>
                        </div>
                      </a>
                      <h4 className="font-semibold text-xs text-gray-900">{img.title}</h4>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto-Count Feature */}
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold text-gray-900">Auto-Count Feature</h3>
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">HIGH PRIORITY</span>
                    </div>
                    <span className="text-sm text-yellow-700">8% of demo time</span>
                  </div>
                  <p className="text-gray-700 text-sm">McCormick's "automated" symbol counting (requires manual symbol definition)</p>
                </div>
                <div className="grid md:grid-cols-5 gap-3">
                  {[
                    { num: "22", title: "Search Area", filename: "22_auto_count_search_area.png" },
                    { num: "23", title: "Symbol Select", filename: "23_auto_count_symbol_select.png" },
                    { num: "24", title: "Results", filename: "24_auto_count_results.png" },
                    { num: "25", title: "Complete", filename: "25_auto_count_complete.png" },
                    { num: "26", title: "Legend Audit", filename: "26_legend_live_audit.png" }
                  ].map((img) => (
                    <div key={img.num} className="bg-white rounded-lg p-2 hover:shadow-md transition-shadow">
                      <a
                        href={`/research/mccormick/${img.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <div className="aspect-video rounded mb-2 relative overflow-hidden group cursor-pointer">
                          <img
                            src={`/research/mccormick/${img.filename}`}
                            alt={img.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute top-2 left-2 bg-yellow-600 text-white text-sm font-bold px-2 py-1 rounded shadow-lg">
                            {img.num}
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200 flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm font-semibold">Click to view</span>
                          </div>
                        </div>
                      </a>
                      <h4 className="font-semibold text-xs text-gray-900">{img.title}</h4>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Features - Compact View */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* Plan Management */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Plan Import & Management</h3>
                  <p className="text-sm text-gray-600 mb-3">8% of demo time • 3 screenshots</p>
                  <div className="text-xs text-gray-500">Screenshots 04-06</div>
                </div>

                {/* Labels */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Labels & Hierarchy</h3>
                  <p className="text-sm text-gray-600 mb-3">6% of demo time • 2 screenshots</p>
                  <div className="text-xs text-gray-500">Screenshots 07-08</div>
                </div>

                {/* Extension Reports */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Extension Reports</h3>
                  <p className="text-sm text-gray-600 mb-3">10% of demo time • 4 screenshots</p>
                  <div className="text-xs text-gray-500">Screenshots 27-30</div>
                </div>

                {/* Bid Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 md:col-span-2">
                  <h3 className="font-semibold text-gray-900 mb-2">Bid Summary & Pricing</h3>
                  <p className="text-sm text-gray-600 mb-3">18% of demo time • 7 screenshots</p>
                  <div className="text-xs text-gray-500">Screenshots 31-37: Labor, quotes, overhead, final pricing</div>
                </div>

                {/* Workflow Overview */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Workflow Overview</h3>
                  <p className="text-sm text-gray-600 mb-3">Complete 5-step process</p>
                  <div className="text-xs text-gray-500">Screenshot 38</div>
                </div>
              </div>
            </div>

            {/* Download Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">📥 Access Full Resolution Images</h4>
              <p className="text-sm text-gray-700">
                Click any "View →" link above to see high-resolution screenshots (up to 1MB each).
                All 38 screenshots are available for analysis and discussion with your team.
              </p>
            </div>
          </div>
        );

      case "competitor-analysis":
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-gray-700">
                <strong>Status:</strong> Pending - Detailed competitor analysis to be conducted
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Competitors to Analyze</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">ConEst</h4>
                  <p className="text-sm text-gray-600">Industry standard electrical estimating</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Accubid</h4>
                  <p className="text-sm text-gray-600">Trimble ecosystem integration</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">McCormick</h4>
                  <p className="text-sm text-gray-600">Current tool (analyzed above)</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Competitive Advantages</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <span className="text-green-500">✓</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">AI-First Approach</h4>
                    <p className="text-sm text-gray-600">Computer vision + document automation vs. manual processes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <span className="text-green-500">✓</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Andrew-Optimized</h4>
                    <p className="text-sm text-gray-600">Built for his specific workflow and preferences</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <span className="text-green-500">✓</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Learning System</h4>
                    <p className="text-sm text-gray-600">Gets better with use, learns from corrections</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <span className="text-green-500">✓</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Pain Point Focus</h4>
                    <p className="text-sm text-gray-600">Addresses 27 hrs/week of tedious documentation work</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "togal-ai":
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-700">
                <strong>Status:</strong> ✅ Research Complete - Comprehensive competitive analysis available
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Executive Summary</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <p className="text-gray-700">
                  <strong>What is Togal.AI?</strong> Cloud-based AI-powered construction takeoff software that uses machine learning to automate the tedious clicking and counting work traditionally done manually by estimators.
                </p>
                <p className="text-gray-700">
                  <strong>Key Claim:</strong> <span className="text-blue-600 font-semibold">76% faster than other leading takeoff software</span> (independent Kansas University study, 2025)
                </p>
                <p className="text-gray-700">
                  <strong>User Satisfaction:</strong> 4.9/5 stars on G2 (39 verified reviews)
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Monthly</h4>
                  <p className="text-2xl font-bold text-blue-600 mb-2">$299/mo</p>
                  <p className="text-sm text-gray-600">Per user</p>
                </div>
                <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Growth Plan</h4>
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">RECOMMENDED</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mb-2">$2,999/yr</p>
                  <p className="text-sm text-gray-600">Unlimited AI features</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Trial</h4>
                  <p className="text-2xl font-bold text-green-600 mb-2">14 Days</p>
                  <p className="text-sm text-gray-600">No credit card required</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Differentiators</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="text-blue-500">🚀</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">The Togal Button (AI Automation)</h4>
                    <p className="text-sm text-gray-600">Automatically detects, measures, and categorizes plan components. Eliminates hours of manual clicking.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="text-blue-500">☁️</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Cloud-Native Platform</h4>
                    <p className="text-sm text-gray-600">Web browser access, no software installation. Real-time collaboration with unlimited users.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="text-blue-500">💬</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Togal.CHAT</h4>
                    <p className="text-sm text-gray-600">Conversational AI for construction plans. Ask: "How many doors on floor 3?"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="text-blue-500">⚡</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Speed & Efficiency</h4>
                    <p className="text-sm text-gray-600">Users complete takeoffs 80% faster. "Taking weeks of work and compressing it into seconds" - CEO</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Togal vs McCormick: Strategic Comparison</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Aspect</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">McCormick</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Togal.AI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Primary Value</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Multi-dimensional breakdowns (floor/area/system)</td>
                      <td className="px-4 py-3 text-sm text-gray-700">AI speed (76% faster)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Why Users Choose</td>
                      <td className="px-4 py-3 text-sm text-gray-700">"Stop copying/pasting in Excel"</td>
                      <td className="px-4 py-3 text-sm text-gray-700">"Complete takeoffs 80% faster"</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Platform</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Desktop</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Cloud/web</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">AI Features</td>
                      <td className="px-4 py-3 text-sm text-gray-700">None</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Core differentiator</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Collaboration</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Unknown</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Real-time, unlimited</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Assemblies</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Major feature</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Unknown</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Best For</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Detailed breakdowns, schedule of values</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Speed-focused, remote teams</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">User Reviews (4.9/5 stars)</h3>
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 italic">"The image search features reduces the time to do a Take Off from hours to minutes"</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 italic">"Estimators are using Togal.AI to complete takeoffs 80% faster, allowing them to place more bids, and win more business"</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 italic">"Outstanding customer support from Togal.AI, appreciating their responsiveness and commitment to improvement"</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700"><strong>ROI Case Study:</strong> Coastal Construction saved almost $1 million in their first year using Togal</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Strategic Questions</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-700 mb-3 font-semibold">Big Opportunity Question:</p>
                <p className="text-gray-700">
                  Is there an opportunity to combine:<br/>
                  • Togal's AI automation speed (76% faster)<br/>
                  • McCormick's breakdown/filtering power (why Andrew chooses it)<br/>
                  • Cloud collaboration (remote teams)<br/>
                  • Assembly workflows (massive efficiency gain)<br/>
                  <br/>
                  → Could create the "best of all worlds" estimating solution?
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Research Resources Available</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => loadMarkdown('togal-readme', 'Togal.AI - README')}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer text-left"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">📄 README.md</h4>
                  <p className="text-sm text-gray-600 mb-2">15-minute comprehensive overview with pricing, competitive positioning, and strategic questions</p>
                  <p className="text-xs text-blue-600 font-medium">Click to view →</p>
                </button>
                <button
                  onClick={() => loadMarkdown('togal-initial-research', 'Togal.AI - Initial Research')}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer text-left"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">📋 TOGAL_INITIAL_RESEARCH.md</h4>
                  <p className="text-sm text-gray-600 mb-2">25+ page deep dive with feature analysis, user reviews, and SWOT analysis</p>
                  <p className="text-xs text-blue-600 font-medium">Click to view →</p>
                </button>
                <button
                  onClick={() => loadMarkdown('patrick-murphy-analysis', 'Patrick Murphy CEO Interview Analysis')}
                  className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-300 rounded-lg p-4 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">🎯 Patrick Murphy Interview Analysis</h4>
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">NEW!</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2"><strong>30+ page comprehensive analysis</strong> of Togal.AI founder interview</p>
                  <p className="text-sm text-gray-600 mb-2">Key insights: $1M validated ROI, 50-60% efficiency crisis, insider advantage, future roadmap (predictive change orders, generative docs)</p>
                  <p className="text-xs text-blue-600 font-medium">Click to view →</p>
                </button>
                <button
                  onClick={() => loadMarkdown('patrick-murphy-transcript', 'Patrick Murphy CEO Interview Transcript')}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer text-left"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">📝 Interview Transcript</h4>
                  <p className="text-sm text-gray-600 mb-2">Full 10-minute transcript with timestamps - "Built by Builders" interview</p>
                  <p className="text-xs text-blue-600 font-medium">Click to view →</p>
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-gray-600">Content not available</div>;
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
              Research: McCormick Systems Replacement Tool
            </h1>
            <p className="text-gray-600 mb-4">
              Comprehensive analysis of McCormick Systems and development of an AI-powered replacement tool optimized for Andrew's workflow.
            </p>

            {/* Stats Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🔬</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Research Project Goals
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Build an AI-powered estimating tool to replace McCormick Systems, targeting 74% reduction in Andrew's pain point tasks (20 hrs/week savings).
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">6</div>
                      <div className="text-xs sm:text-sm text-gray-600">Research Areas</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">27 hrs</div>
                      <div className="text-xs sm:text-sm text-gray-600">Weekly Pain Points</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xl sm:text-2xl font-bold text-purple-600">74%</div>
                      <div className="text-xs sm:text-sm text-gray-600">Time Reduction</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xl sm:text-2xl font-bold text-yellow-600">5</div>
                      <div className="text-xs sm:text-sm text-gray-600">Core Features</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Research Sections Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {RESEARCH_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`text-left p-4 rounded-lg transition-all ${
                  selectedSection === section.id
                    ? "bg-blue-100 border-2 border-blue-500 shadow-md"
                    : "bg-white border border-gray-200 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-3xl">{section.icon}</div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(section.status)}`}>
                    {section.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{section.title}</h3>
                <p className="text-sm text-gray-600">{section.summary}</p>
              </button>
            ))}
          </div>

          {/* Selected Section Content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b">
              <div className="text-4xl">
                {RESEARCH_SECTIONS.find((s) => s.id === selectedSection)?.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {RESEARCH_SECTIONS.find((s) => s.id === selectedSection)?.title}
                </h2>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                RESEARCH_SECTIONS.find((s) => s.id === selectedSection)?.status || "pending"
              )}`}>
                {RESEARCH_SECTIONS.find((s) => s.id === selectedSection)?.status.replace("_", " ").toUpperCase()}
              </span>
            </div>

            {renderSectionContent(selectedSection)}
          </div>

          {/* Next Steps */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Next Steps</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 text-sm">Immediate Actions</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Interview Andrew about current McCormick workflow</li>
                  <li>• Collect sample drawings from recent projects</li>
                  <li>• Analyze Andrew's past submittals for patterns</li>
                  <li>• Test symbol detection with client drawings</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 text-sm">Research Needed</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Manufacturer API availability research</li>
                  <li>• Electrical symbol datasets for training</li>
                  <li>• Competitor tool deep-dive analysis</li>
                  <li>• Build prototype of takeoff interface</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Markdown Viewer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{modalTitle}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingContent ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-600">Loading content...</div>
                </div>
              ) : modalTitle.includes('Transcript') ? (
                // Display transcript with preserved formatting
                <div className="bg-gray-50 rounded-lg p-6">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                    {modalContent}
                  </pre>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none
                  prose-headings:text-gray-900
                  prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4 prose-h1:mt-8 prose-h1:pb-2 prose-h1:border-b prose-h1:border-gray-200
                  prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:mt-6
                  prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-4
                  prose-p:text-gray-700 prose-p:mb-4 prose-p:leading-relaxed
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                  prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                  prose-li:text-gray-700 prose-li:my-1
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
                  prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-pink-600
                  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                  prose-table:border-collapse prose-table:w-full prose-table:my-4
                  prose-th:bg-gray-50 prose-th:border prose-th:border-gray-300 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold
                  prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2
                  prose-hr:my-8 prose-hr:border-gray-300
                  prose-img:rounded-lg prose-img:shadow-md
                ">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {modalContent}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
