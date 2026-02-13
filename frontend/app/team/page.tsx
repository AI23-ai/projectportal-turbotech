"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navigation from "@/components/ui/Navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface EstimatorProfile {
  id: number;
  name: string;
  role: string;
  behavioral_type: string;
  profile_icon: string;
  profile_summary: string;
  strengths: string[];
  pain_points: {
    task: string;
    hours_per_week: number;
  }[];
  ai_strategy: {
    pace: string;
    detail_level: string;
    autonomy: number;
    priorities: string[];
  };
}

const ESTIMATOR_PROFILES: EstimatorProfile[] = [
  {
    id: 1,
    name: "Team Member 1",
    role: "President & Lead Estimator",
    behavioral_type: "Captain",
    profile_icon: "🚀",
    profile_summary: "Fast-paced problem solver who likes change and innovation while controlling the big picture. Hates routine plan/spec work.",
    strengths: [
      "Design/Build and Design/Assist estimating",
      "Working with teams on challenges",
      "Customer relations and problem solving",
      "Looking to the future and innovation",
    ],
    pain_points: [
      { task: "Plan/Spec estimating (boring routine work)", hours_per_week: 8 },
      { task: "Going back on notes taken", hours_per_week: 2 },
      { task: "Project managing details", hours_per_week: 4 },
    ],
    ai_strategy: {
      pace: "Fast",
      detail_level: "Summary only",
      autonomy: 95,
      priorities: [
        "Auto-parse specs in background",
        "Show only critical decisions",
        "Eliminate boring Plan/Spec work",
        "Quick approval workflows",
      ],
    },
  },
  {
    id: 2,
    name: "Team Member 2",
    role: "Senior Estimator",
    behavioral_type: "Operator",
    profile_icon: "🔍",
    profile_summary: "Patient, methodical team worker who values accuracy and established processes. Works best with familiar environments and detailed validation.",
    strengths: [
      "Design/Build projects with detailed planning",
      "Articulating scope into accurate designs",
      "Patient, systematic approach",
      "High attention to detail",
    ],
    pain_points: [
      { task: "Plan/Spec projects (dislikes but good at them)", hours_per_week: 10 },
      { task: "Rushed changes or unclear processes", hours_per_week: 3 },
    ],
    ai_strategy: {
      pace: "Steady & methodical",
      detail_level: "Comprehensive with validation",
      autonomy: 60,
      priorities: [
        "Show step-by-step validation",
        "Provide detailed documentation",
        "Allow time to review before proceeding",
        "Ensure consistency with past work",
      ],
    },
  },
  {
    id: 3,
    name: "Team Member 3",
    role: "Project Estimator",
    behavioral_type: "Process Optimizer",
    profile_icon: "⚙️",
    profile_summary: "Loves reviewing plans and solving complex challenges. Dislikes repetitive administrative work and form-filling.",
    strengths: [
      "Reviewing plans and creating accurate estimates",
      "Solving complex estimating challenges",
      "Brainstorming process improvements",
      "Learning new construction tech/software",
    ],
    pain_points: [
      { task: "Filling out repetitive bid forms", hours_per_week: 6 },
      { task: "Creating Gantt chart schedules", hours_per_week: 3 },
      { task: "Organizing folders and documentation", hours_per_week: 2 },
    ],
    ai_strategy: {
      pace: "Balanced",
      detail_level: "Standard with insights",
      autonomy: 80,
      priorities: [
        "Auto-fill all repetitive forms",
        "Highlight complex challenges (his strength)",
        "Suggest process improvements",
        "Learn from his optimizations",
      ],
    },
  },
  {
    id: 4,
    name: "Team Member 4",
    role: "Estimator",
    behavioral_type: "Technical Specialist",
    profile_icon: "🔧",
    profile_summary: "Excels at electrical design budgets and value engineering. Major time drains: reading specs, non-fillable forms, reviewing incomplete estimates.",
    strengths: [
      "Electrical design budgets (8-16 hrs/week)",
      "Value engineering",
      "Change order pricing",
    ],
    pain_points: [
      { task: "Reading and comprehending specifications", hours_per_week: 6 },
      { task: "Non-fillable forms", hours_per_week: 2 },
      { task: "Reviewing incomplete estimates", hours_per_week: 6 },
      { task: "Submittals and documentation", hours_per_week: 2 },
    ],
    ai_strategy: {
      pace: "Efficient",
      detail_level: "Summary with details on demand",
      autonomy: 85,
      priorities: [
        "Auto-extract spec requirements (save 6 hrs/week)",
        "OCR and populate non-fillable forms (save 2 hrs/week)",
        "Pre-validate estimates before review (save 6 hrs/week)",
        "Total time savings: 14+ hours/week",
      ],
    },
  },
  {
    id: 5,
    name: "Team Member 5",
    role: "Senior Estimator",
    behavioral_type: "Field Operations Specialist",
    profile_icon: "🏗️",
    profile_summary: "Excels at figuring out field work timing. Frustrated by slow bidding pace and tedious counting tasks under time pressure.",
    strengths: [
      "Figuring out how long field tasks will take",
      "Field operations planning",
      "Understanding construction sequences",
    ],
    pain_points: [
      { task: "Overall bidding work (too slow, needs faster)", hours_per_week: 10 },
      { task: "Counting light fixtures, outlets, data drops", hours_per_week: 8 },
      { task: "Getting vendor quotes with tight deadlines", hours_per_week: 6 },
    ],
    ai_strategy: {
      pace: "Efficient",
      detail_level: "Field-focused summaries",
      autonomy: 85,
      priorities: [
        "Auto-count fixtures/outlets/data from drawings",
        "Fast field time estimation from historical data",
        "Automated vendor quote collection and comparison",
        "Reduce bidding cycle time by 50%",
      ],
    },
  },
  {
    id: 6,
    name: "Team Member 6",
    role: "Project Manager & Estimator",
    behavioral_type: "Solutions Architect",
    profile_icon: "🎯",
    profile_summary: "Customer-facing problem solver who loves finding solutions but overwhelmed by information fragmentation and constant interruptions.",
    strengths: [
      "Finding solutions and design options for customers",
      "Managing projects and solving problems",
      "Passing jobs to foremen and discussing execution",
    ],
    pain_points: [
      { task: "Tracking others' lack of response (increasingly frustrating)", hours_per_week: 6 },
      { task: "Digging through fragmented information sources", hours_per_week: 8 },
      { task: "Phone interruptions breaking focus", hours_per_week: 5 },
      { task: "Project paperwork and spec books", hours_per_week: 6 },
      { task: "Overwhelmed by constant deadlines", hours_per_week: 8 },
    ],
    ai_strategy: {
      pace: "Fast with focus protection",
      detail_level: "Unified dashboard view",
      autonomy: 75,
      priorities: [
        "Unified information dashboard (no more digging)",
        "Auto-track vendor responses and send reminders",
        "Focus mode: batch notifications during deep work",
        "AI handles documentation while team focuses on customers",
      ],
    },
  },
  {
    id: 7,
    name: "Team Member 7",
    role: "Project Estimator",
    behavioral_type: "Project Controller",
    profile_icon: "📊",
    profile_summary: "Detail-oriented project setup specialist who excels at takeoffs and tracking but buried under documentation work.",
    strengths: [
      "Takeoffs with detailed breakdowns",
      "Project setup (budgets, SoV, schedules)",
      "Job costing and tracking",
    ],
    pain_points: [
      { task: "Submittals (2-40 hrs per project)", hours_per_week: 15 },
      { task: "Closeout & O&M documents (2-10 hrs per project)", hours_per_week: 6 },
      { task: "Front-end docs (schedules, requirements, alternates)", hours_per_week: 4 },
      { task: "Scope letters", hours_per_week: 2 },
    ],
    ai_strategy: {
      pace: "Methodical",
      detail_level: "Detailed with templates",
      autonomy: 70,
      priorities: [
        "Auto-generate submittals from project data (save 15 hrs/week)",
        "Template-based closeout docs with smart defaults",
        "Extract front-end requirements from specs automatically",
        "AI drafts scope letters from estimate data",
      ],
    },
  },
  {
    id: 8,
    name: "Team Member 8",
    role: "IT Controller & Systems Admin",
    behavioral_type: "Tech Enabler",
    profile_icon: "💻",
    profile_summary: "IT/Accounting hybrid who loves automation and technology but wants to escape old accounting burdens and stay current with modern tech.",
    strengths: [
      "Computer hardware and network configuration",
      "Excel automation and data handling",
      "Construction accounting controllership",
      "Microsoft 365 tenant administration",
    ],
    pain_points: [
      { task: "Former accounting work (retired from 450 tax filings/year)", hours_per_week: 0 },
      { task: "Not enough time to learn modern coding/cybersecurity", hours_per_week: 8 },
      { task: "HR functions and incident management (never liked it)", hours_per_week: 3 },
    ],
    ai_strategy: {
      pace: "Exploratory",
      detail_level: "Technical with learning paths",
      autonomy: 90,
      priorities: [
        "AI coding assistant for rapid skill development",
        "Automated cybersecurity monitoring and log analysis",
        "Stay current with GenAI/AI stack without hardware constraints",
        "Free up time from repetitive IT tasks for innovation",
      ],
    },
  },
  {
    id: 9,
    name: "Team Member 9",
    role: "Senior Estimator & Project Manager",
    behavioral_type: "Organizer & Mentor",
    profile_icon: "📋",
    profile_summary: "Excels at organizing complex large bids, change orders, and mentoring younger estimators. Frustrated by time-eating site visits, tiny low-ROI jobs, and workload stress that prevents quality work.",
    strengths: [
      "Organization and micromanagement of complex projects",
      "Large bids with many moving parts",
      "Extras and change orders to maximize profit",
      "Training and helping younger estimators (informal mentor role)",
    ],
    pain_points: [
      { task: "Site visits (big time eaters - 3 hrs for 20 min meetings)", hours_per_week: 8 },
      { task: "Tiny bids/jobs (5-8 hrs each for $500 profit)", hours_per_week: 12 },
      { task: "Field babysitting and accountability issues", hours_per_week: 6 },
      { task: "Large package delivery tracking (fixtures/controls trickling in)", hours_per_week: 4 },
      { task: "Workload stress preventing quality work", hours_per_week: 8 },
    ],
    ai_strategy: {
      pace: "Quality-focused (not rushed)",
      detail_level: "Organized with complete tracking",
      autonomy: 80,
      priorities: [
        "Auto-handle tiny bids/jobs (eliminate 5-8 hour $500 jobs)",
        "Virtual meeting summaries to reduce site visit time",
        "Auto-track large package deliveries and alert on shortages",
        "Field communication assistant to reduce 'babysitting'",
        "Simple, clear AI interface (struggles with complex tech)",
      ],
    },
  },
];

const generatePDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Professional color palette
  const colors = {
    primary: [31, 41, 55] as [number, number, number],      // Dark gray-blue
    accent: [59, 130, 246] as [number, number, number],      // Professional blue
    light: [243, 244, 246] as [number, number, number],      // Light gray
    text: [17, 24, 39] as [number, number, number],          // Almost black
    success: [34, 197, 94] as [number, number, number],      // Professional green
    warning: [251, 146, 60] as [number, number, number],     // Professional orange
  };

  // Cover Page
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 60, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('TEAM BEHAVIORAL ANALYSIS', pageWidth / 2, 25, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Estimation Team', pageWidth / 2, 40, { align: 'center' });
  doc.setFontSize(11);
  doc.text('AI-Native Estimation Assistant - Engagement Report', pageWidth / 2, 50, { align: 'center' });

  // Executive Summary Box
  doc.setFillColor(...colors.light);
  doc.rect(15, 75, pageWidth - 30, 50, 'F');
  doc.setDrawColor(...colors.accent);
  doc.setLineWidth(0.5);
  doc.rect(15, 75, pageWidth - 30, 50, 'S');

  doc.setTextColor(...colors.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('EXECUTIVE SUMMARY', 20, 85);

  const totalTimeSaved = ESTIMATOR_PROFILES.reduce((sum, profile) => {
    return sum + profile.pain_points.reduce((psum, p) => psum + p.hours_per_week, 0);
  }, 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Team Members Analyzed: ${ESTIMATOR_PROFILES.length}`, 20, 98);
  doc.text(`Weekly Time Recovery Potential: ${totalTimeSaved} hours`, 20, 106);
  doc.text(`AI Personalization Level: 100% individualized`, 20, 114);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report Generated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 20, 140);

  // Team Member Pages
  ESTIMATOR_PROFILES.forEach((profile, index) => {
    doc.addPage();

    // Header with name and role
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(profile.name.toUpperCase(), 20, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(profile.role, 20, 28);

    doc.setFontSize(10);
    doc.text(`Behavioral Profile: ${profile.behavioral_type}`, 20, 37);

    let yPos = 55;
    doc.setTextColor(...colors.text);

    // Profile Summary Section
    doc.setFillColor(...colors.light);
    doc.rect(15, yPos - 3, pageWidth - 30, 35, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('PROFILE SUMMARY', 20, yPos + 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(profile.profile_summary, pageWidth - 50);
    doc.text(summaryLines, 20, yPos + 10);
    yPos += 45;

    // Strengths Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...colors.accent);
    doc.text('CORE STRENGTHS', 20, yPos);
    doc.setTextColor(...colors.text);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    profile.strengths.forEach((strength) => {
      const strengthLines = doc.splitTextToSize(`\u2022 ${strength}`, pageWidth - 50);
      doc.text(strengthLines, 20, yPos);
      yPos += strengthLines.length * 5 + 2;
    });
    yPos += 8;

    // Time Drains Table
    const totalTimeLost = profile.pain_points.reduce((sum, p) => sum + p.hours_per_week, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...colors.warning);
    doc.text(`TIME OPTIMIZATION OPPORTUNITIES (${totalTimeLost} hrs/week)`, 20, yPos);
    doc.setTextColor(...colors.text);
    yPos += 7;

    autoTable(doc, {
      startY: yPos,
      head: [['Activity', 'Weekly Hours']],
      body: profile.pain_points.map(p => [p.task, `${p.hours_per_week} hrs`]),
      theme: 'grid',
      headStyles: {
        fillColor: colors.warning,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9
      },
      margin: { left: 20, right: 20 },
      alternateRowStyles: {
        fillColor: colors.light
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 12;

    // AI Strategy Section
    doc.setFillColor(...colors.light);
    doc.rect(15, yPos - 5, pageWidth - 30, 75, 'F');
    doc.setDrawColor(...colors.accent);
    doc.setLineWidth(0.5);
    doc.rect(15, yPos - 5, pageWidth - 30, 75, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...colors.accent);
    doc.text('AI ADAPTATION STRATEGY', 20, yPos + 2);
    doc.setTextColor(...colors.text);
    yPos += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Interaction Pace: ${profile.ai_strategy.pace}`, 25, yPos);
    yPos += 6;
    doc.text(`Information Detail: ${profile.ai_strategy.detail_level}`, 25, yPos);
    yPos += 6;
    doc.text(`AI Autonomy Level: ${profile.ai_strategy.autonomy}%`, 25, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Implementation Priorities:', 25, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    profile.ai_strategy.priorities.forEach((priority, idx) => {
      const priorityLines = doc.splitTextToSize(`${idx + 1}. ${priority}`, pageWidth - 55);
      doc.text(priorityLines, 25, yPos);
      yPos += priorityLines.length * 4 + 2;
    });
  });

  // Save the PDF
  doc.save('Team-Behavioral-Analysis.pdf');
};

export default function TeamInsights() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = `/api/auth/login${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION ? `?organization=${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION}` : ''}`;
    }
  }, [user, isLoading, router]);

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

  const totalTimeSaved = ESTIMATOR_PROFILES.reduce((sum, profile) => {
    return (
      sum +
      profile.pain_points.reduce((psum, p) => psum + p.hours_per_week, 0)
    );
  }, 0);

  // Categorize all pain points for breakdown
  const timeDrainCategories = [
    {
      category: "Documentation & Forms",
      icon: "📝",
      jerryStatus: "ready",
      description: "Jerry can help NOW - clerical work that builds trust",
      items: [
        { task: "Submittals (2-40 hrs per project)", hours: 15, owner: "TM7" },
        { task: "Filling out repetitive bid forms", hours: 6, owner: "TM3" },
        { task: "Closeout & O&M documents", hours: 6, owner: "TM7" },
        { task: "Project paperwork and spec books", hours: 6, owner: "TM6" },
        { task: "Front-end docs (schedules, requirements)", hours: 4, owner: "TM7" },
        { task: "Scope letters", hours: 2, owner: "TM7" },
        { task: "Non-fillable forms (OCR needed)", hours: 2, owner: "TM4" },
        { task: "Submittals and documentation", hours: 2, owner: "TM4" },
      ],
    },
    {
      category: "Information Management",
      icon: "🔍",
      jerryStatus: "ready",
      description: "Jerry can help NOW - searching and tracking",
      items: [
        { task: "Digging through fragmented information", hours: 8, owner: "TM6" },
        { task: "Tracking others' lack of response", hours: 6, owner: "TM6" },
        { task: "Large package delivery tracking", hours: 4, owner: "TM9" },
        { task: "Going back on notes taken", hours: 2, owner: "TM1" },
      ],
    },
    {
      category: "Estimation & Takeoff",
      icon: "📊",
      jerryStatus: "learning",
      description: "Jerry is LEARNING - working alongside estimators",
      items: [
        { task: "Plan/Spec projects (routine estimation)", hours: 10, owner: "TM2" },
        { task: "Overall bidding work (needs speedup)", hours: 10, owner: "TM5" },
        { task: "Plan/Spec estimating (boring routine)", hours: 8, owner: "TM1" },
        { task: "Counting fixtures, outlets, data drops", hours: 8, owner: "TM5" },
        { task: "Reviewing incomplete estimates", hours: 6, owner: "TM4" },
        { task: "Reading and comprehending specs", hours: 6, owner: "TM4" },
      ],
    },
    {
      category: "Low-Value Work",
      icon: "⚡",
      jerryStatus: "ready",
      description: "Jerry can help NOW - automate to free up experts",
      items: [
        { task: "Tiny bids/jobs ($500 profit, 5-8 hrs each)", hours: 12, owner: "TM9" },
        { task: "Vendor quote collection", hours: 6, owner: "TM5" },
        { task: "Project managing details", hours: 4, owner: "TM1" },
        { task: "Creating Gantt chart schedules", hours: 3, owner: "TM3" },
        { task: "Organizing folders and documentation", hours: 2, owner: "TM3" },
      ],
    },
    {
      category: "Focus & Workload",
      icon: "🎯",
      jerryStatus: "assists",
      description: "Jerry assists - protecting focus, reducing stress",
      items: [
        { task: "Overwhelmed by constant deadlines", hours: 8, owner: "TM6" },
        { task: "Workload stress preventing quality", hours: 8, owner: "TM9" },
        { task: "Phone interruptions breaking focus", hours: 5, owner: "TM6" },
      ],
    },
    {
      category: "Field Operations",
      icon: "🏗️",
      jerryStatus: "learning",
      description: "Jerry is LEARNING - needs domain knowledge",
      items: [
        { task: "Site visits (3 hrs for 20 min meetings)", hours: 8, owner: "TM9" },
        { task: "Field babysitting and accountability", hours: 6, owner: "TM9" },
        { task: "Rushed changes or unclear processes", hours: 3, owner: "TM2" },
      ],
    },
    {
      category: "Professional Development",
      icon: "📚",
      jerryStatus: "assists",
      description: "Jerry assists - frees time for learning",
      items: [
        { task: "Not enough time for modern coding/security", hours: 8, owner: "TM8" },
        { task: "HR functions (never liked it)", hours: 3, owner: "TM8" },
      ],
    },
  ];

  // Calculate totals for each status
  const readyHours = timeDrainCategories
    .filter(c => c.jerryStatus === "ready")
    .reduce((sum, c) => sum + c.items.reduce((s, i) => s + i.hours, 0), 0);
  const learningHours = timeDrainCategories
    .filter(c => c.jerryStatus === "learning")
    .reduce((sum, c) => sum + c.items.reduce((s, i) => s + i.hours, 0), 0);
  const assistsHours = timeDrainCategories
    .filter(c => c.jerryStatus === "assists")
    .reduce((sum, c) => sum + c.items.reduce((s, i) => s + i.hours, 0), 0);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Your Estimation Team - Behavioral Insights
                </h1>
                <p className="text-gray-600 mb-4">
                  We've analyzed your team's working styles to build an AI assistant that adapts to each estimator's unique preferences.
                </p>
              </div>
              <button
                onClick={generatePDF}
                className="ml-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF Report
              </button>
            </div>

            {/* Impact Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🎯</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    GenAI Adaptation Strategy
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Unlike traditional software that forces everyone to work the same way, our AI adapts to each estimator's style:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">{ESTIMATOR_PROFILES.length}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Unique Profiles</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">{totalTimeSaved} hrs</div>
                      <div className="text-xs sm:text-sm text-gray-600">Weekly Time Saved</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm col-span-2 sm:col-span-1">
                      <div className="text-xl sm:text-2xl font-bold text-purple-600">100%</div>
                      <div className="text-xs sm:text-sm text-gray-600">Personalized AI</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Time Drains Breakdown Section */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <span>⏱️</span> Time Drains Breakdown
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Understanding the {totalTimeSaved} hours: Where Jerry provides value NOW vs. where he's learning
                    </p>
                  </div>
                </div>
              </div>

              {/* Teamwork Message */}
              <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🤝</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">The Teamwork Approach</h3>
                    <p className="text-gray-700 text-sm">
                      Jerry isn't replacing estimators—he's joining the team. While learning estimation skills from
                      experts like Team Member 4, Jerry immediately contributes by handling clerical tasks. This creates
                      a virtuous cycle: <strong>Jerry helps the team with paperwork → team teaches Jerry estimation →
                      Jerry gets better → team has more time for high-value work</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="px-6 py-4 border-b bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span className="text-sm font-semibold text-green-800">Jerry Ready NOW</span>
                    </div>
                    <div className="text-3xl font-bold text-green-700">{readyHours} hrs</div>
                    <div className="text-xs text-green-600 mt-1">
                      Clerical, forms, tracking - immediate value
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                      <span className="text-sm font-semibold text-amber-800">Jerry Learning</span>
                    </div>
                    <div className="text-3xl font-bold text-amber-700">{learningHours} hrs</div>
                    <div className="text-xs text-amber-600 mt-1">
                      Estimation & takeoff - training in progress
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                      <span className="text-sm font-semibold text-blue-800">Jerry Assists</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-700">{assistsHours} hrs</div>
                    <div className="text-xs text-blue-600 mt-1">
                      Focus protection, workload support
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {timeDrainCategories.map((category) => {
                    const categoryTotal = category.items.reduce((sum, item) => sum + item.hours, 0);
                    const statusBg =
                      category.jerryStatus === "ready" ? "bg-green-50 border-green-200" :
                      category.jerryStatus === "learning" ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200";
                    const statusText =
                      category.jerryStatus === "ready" ? "text-green-700" :
                      category.jerryStatus === "learning" ? "text-amber-700" : "text-blue-700";
                    const statusBadge =
                      category.jerryStatus === "ready" ? "bg-green-100 text-green-800" :
                      category.jerryStatus === "learning" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800";

                    return (
                      <div key={category.category} className={`rounded-lg border ${statusBg} overflow-hidden`}>
                        <div className="px-4 py-3 border-b border-opacity-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{category.icon}</span>
                              <h4 className="font-semibold text-gray-900">{category.category}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${statusText}`}>{categoryTotal} hrs</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge}`}>
                                {category.jerryStatus === "ready" ? "Ready" :
                                 category.jerryStatus === "learning" ? "Learning" : "Assists"}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                        </div>
                        <div className="px-4 py-2">
                          <div className="space-y-1.5">
                            {category.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm bg-white bg-opacity-60 rounded px-2 py-1.5">
                                <span className="text-gray-700 flex-1">{item.task}</span>
                                <div className="flex items-center gap-2 ml-2">
                                  <span className="text-xs text-gray-500">{item.owner}</span>
                                  <span className={`font-semibold ${statusText} min-w-[40px] text-right`}>{item.hours}h</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Key Insight Footer */}
              <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-t">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Key Insight: Immediate ROI Through Clerical Work</h4>
                    <p className="text-sm text-gray-700">
                      <strong>{readyHours} hours per week</strong> ({Math.round(readyHours / totalTimeSaved * 100)}% of total)
                      can be addressed right now with Jerry's current capabilities. While the team lead is right that better estimation
                      will unlock the full {totalTimeSaved} hours, the clerical tasks provide <strong>immediate value</strong> and
                      give Jerry opportunities to interact with and learn from every team member. Each form filled, each submittal
                      prepared, each delivery tracked is a chance for Jerry to observe how the team works and earn their trust.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estimator Profiles */}
          <div className="space-y-6">
            {ESTIMATOR_PROFILES.map((profile) => {
              const totalTimeLost = profile.pain_points.reduce(
                (sum, p) => sum + p.hours_per_week,
                0
              );
              const autonomyColor =
                profile.ai_strategy.autonomy >= 80
                  ? "text-green-600"
                  : profile.ai_strategy.autonomy >= 60
                  ? "text-blue-600"
                  : "text-yellow-600";

              return (
                <div
                  key={profile.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="text-5xl">{profile.profile_icon}</div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {profile.name}
                          </h2>
                          <p className="text-gray-600">{profile.role}</p>
                          <span className="inline-flex items-center px-3 py-1 mt-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {profile.behavioral_type}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">
                          AI Autonomy Level
                        </div>
                        <div className={`text-3xl font-bold ${autonomyColor}`}>
                          {profile.ai_strategy.autonomy}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 grid md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Profile Summary */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Profile Summary
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {profile.profile_summary}
                        </p>
                      </div>

                      {/* Strengths */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          ✅ Strengths & Loves
                        </h3>
                        <ul className="space-y-1">
                          {profile.strengths.map((strength, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-gray-600 flex items-start gap-2"
                            >
                              <span className="text-green-500 mt-0.5">•</span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Pain Points */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          ⚠️ Time Drains ({totalTimeLost} hrs/week)
                        </h3>
                        <div className="space-y-2">
                          {profile.pain_points.map((pain, idx) => (
                            <div
                              key={idx}
                              className="flex items-start justify-between bg-red-50 p-2 rounded"
                            >
                              <span className="text-sm text-gray-700 flex-1">
                                {pain.task}
                              </span>
                              <span className="text-sm font-semibold text-red-600 ml-2">
                                {pain.hours_per_week} hrs
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - AI Strategy */}
                    <div>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 h-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          🤖 AI Adaptation Strategy
                        </h3>

                        {/* Settings */}
                        <div className="space-y-3 mb-4">
                          <div className="bg-white rounded p-3">
                            <div className="text-xs text-gray-500 mb-1">
                              Pace Preference
                            </div>
                            <div className="font-semibold text-gray-900">
                              {profile.ai_strategy.pace}
                            </div>
                          </div>

                          <div className="bg-white rounded p-3">
                            <div className="text-xs text-gray-500 mb-1">
                              Detail Level
                            </div>
                            <div className="font-semibold text-gray-900">
                              {profile.ai_strategy.detail_level}
                            </div>
                          </div>

                          <div className="bg-white rounded p-3">
                            <div className="text-xs text-gray-500 mb-1">
                              Autonomy Slider
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    profile.ai_strategy.autonomy >= 80
                                      ? "bg-green-500"
                                      : profile.ai_strategy.autonomy >= 60
                                      ? "bg-blue-500"
                                      : "bg-yellow-500"
                                  }`}
                                  style={{
                                    width: `${profile.ai_strategy.autonomy}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-semibold">
                                {profile.ai_strategy.autonomy}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* AI Priorities */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            AI Priorities:
                          </h4>
                          <ul className="space-y-1.5">
                            {profile.ai_strategy.priorities.map((priority, idx) => (
                              <li
                                key={idx}
                                className="text-sm text-gray-700 flex items-start gap-2 bg-white rounded p-2"
                              >
                                <span className="text-blue-500 font-bold">
                                  {idx + 1}.
                                </span>
                                {priority}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📚 Our Approach: GenAI Grounding Principles
            </h3>
            <p className="text-gray-700 mb-3">
              These profiles guide our AI development using modern GenAI best practices:
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">✓</span>
                <strong>AI adapts to humans</strong> (not the other way around) - Each estimator gets personalized experiences
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">✓</span>
                <strong>Memory-first systems</strong> - AI remembers each person's corrections and preferences
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">✓</span>
                <strong>Autonomy slider</strong> - Not binary automation; each user controls AI confidence levels
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">✓</span>
                <strong>Continuous learning</strong> - AI improves from your feedback, never "done"
              </li>
            </ul>
            <p className="text-sm text-gray-500 mt-4 italic">
              See GROUNDING.md for full technical details on our GenAI approach.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
