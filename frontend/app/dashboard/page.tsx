"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "@/components/ui/Navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Dashboard() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      window.location.href = `/api/auth/login${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION ? `?organization=${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION}` : ''}`;
    }
  }, [user, isLoading]);

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
    return null; // Will redirect
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user.name}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              AI-Native Estimation Assistant Project
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <a
              href="/deliverables"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="text-3xl mb-3">📋</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Deliverables
              </h2>
              <p className="text-gray-600 text-sm">
                Track progress on SOW deliverables
              </p>
            </a>

            <a
              href="/metrics"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="text-3xl mb-3">📊</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Success Metrics
              </h2>
              <p className="text-gray-600 text-sm">
                Monitor key performance indicators
              </p>
            </a>

            <a
              href="/communication"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="text-3xl mb-3">💬</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Communication Hub
              </h2>
              <p className="text-gray-600 text-sm">
                Project updates and team communication
              </p>
            </a>

            <a
              href="/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="text-3xl mb-3">🔧</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                API Documentation
              </h2>
              <p className="text-gray-600 text-sm">
                View API endpoints and schemas
              </p>
            </a>
          </div>

          {/* Current Phase Banner */}
          <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">Phase 4</span>
                  <span className="animate-pulse">●</span>
                  <span className="text-sm">IN PROGRESS</span>
                </div>
                <h2 className="text-2xl font-bold mb-1">Jerry Training Phase</h2>
                <p className="text-purple-100">Teaching the AI assistant to become a domain expert</p>
              </div>
              <a
                href="/jerry"
                className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors"
              >
                Meet Jerry →
              </a>
            </div>
          </div>

          {/* Phase Summary */}
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Phase 1</span>
                <span className="text-green-500">✓</span>
              </div>
              <div className="font-semibold text-gray-900">Discovery</div>
              <div className="text-xs text-gray-500">Oct - Nov 2025</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Phase 2</span>
                <span className="text-green-500">✓</span>
              </div>
              <div className="font-semibold text-gray-900">Prototype</div>
              <div className="text-xs text-gray-500">Nov - Dec 2025</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Phase 3</span>
                <span className="text-green-500">✓</span>
              </div>
              <div className="font-semibold text-gray-900">Foundation</div>
              <div className="text-xs text-gray-500">Dec 2025 - Jan 2026</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Phase 4</span>
                <span className="text-purple-500 animate-pulse">●</span>
              </div>
              <div className="font-semibold text-gray-900">Training</div>
              <div className="text-xs text-gray-500">Jan 2026 - Ongoing</div>
            </div>
          </div>

          {/* Project Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Foundation Phase Complete
            </h2>
            <div className="text-blue-800 space-y-1">
              <p><strong>Phase 1-3 Results:</strong> Jerry achieved 99.1% symbol detection accuracy, 28 estimates loaded ($71.9M)</p>
              <p><strong>Current Focus:</strong> Training the AI assistant on estimation processes, pricing methods, and business practices</p>
              <p><strong>Goal:</strong> Transform Jerry from apprentice to expert estimator</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
