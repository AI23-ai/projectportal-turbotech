"use client";

import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import Navigation from "@/components/ui/Navigation";

export default function Home() {
  const { user } = useUser();

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <div className="max-w-4xl mx-auto text-center">

        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Project Portal
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Real-time project tracking and transparency
        </p>
        <p className="text-lg text-gray-500 mb-12">
          Track deliverables, metrics, and communication in one place
        </p>

        <div className="flex gap-4 justify-center">
          {!user ? (
            <Link
              href={`/api/auth/login${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION ? `?organization=${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION}` : ''}`}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Sign In
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Go to Dashboard
            </Link>
          )}
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Real-time Updates
            </h3>
            <p className="text-gray-600">
              Live project metrics and deliverable tracking
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI-Powered Insights
            </h3>
            <p className="text-gray-600">
              Automated weekly digests and summaries
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Transparent Communication
            </h3>
            <p className="text-gray-600">
              Single source of truth for project status
            </p>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
