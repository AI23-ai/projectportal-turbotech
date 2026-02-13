"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/ui/Navigation";
import { useUser } from "@auth0/nextjs-auth0/client";

const jerryTabs = [
  { href: "/jerry", label: "Summary", icon: "📊" },
  { href: "/jerry/workflow", label: "Workflow", icon: "🔄" },
  { href: "/jerry/takeoff", label: "Takeoff", icon: "📐" },
  { href: "/jerry/tools", label: "Tools", icon: "🔧" },
  { href: "/jerry/vision", label: "Vision", icon: "👁️" },
  { href: "/jerry/training", label: "Training", icon: "📚" },
  { href: "/jerry/lookup", label: "LOOKUP", icon: "🔍" },
  { href: "/jerry/labor", label: "Labor Units", icon: "⏱️" },
  { href: "/jerry/materials", label: "Materials", icon: "🏷️" },
  { href: "/jerry/specs", label: "Spec Analyzer", icon: "📋" },
  { href: "/jerry/mentors", label: "Mentors", icon: "👨‍🏫" },
];

export default function JerryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoading } = useUser();

  // Handle auth redirect
  if (!isLoading && !user) {
    if (typeof window !== "undefined") {
      window.location.href = `/api/auth/login${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION ? `?organization=${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION}` : ''}`;
    }
    return null;
  }

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

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Jerry Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">🤖</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Jerry</h1>
                <p className="text-lg text-gray-600">
                  Your AI Apprentice - Learning to Work Alongside Your Team
                </p>
              </div>
            </div>
          </div>

          {/* Sub-navigation Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {jerryTabs.map((tab) => {
                  const isActive = pathname === tab.href;
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        isActive
                          ? "border-purple-500 text-purple-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Page Content */}
          {children}
        </div>
      </main>
    </>
  );
}
