"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import { useState } from "react";

interface DropdownProps {
  label: string;
  items: { href: string; label: string }[];
}

function Dropdown({ label, items }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  let closeTimeout: NodeJS.Timeout;

  const handleMouseEnter = () => {
    if (closeTimeout) clearTimeout(closeTimeout);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeout = setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 pt-2 w-48 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navigation() {
  const { user, error, isLoading } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const projectItems = [
    { href: "/deliverables", label: "Deliverables" },
    { href: "/metrics", label: "Metrics" },
    { href: "/communication", label: "Updates" },
  ];

  const jerryItems = [
    { href: "/jerry", label: "Summary" },
    { href: "/jerry/tools", label: "Tools" },
    { href: "/jerry/vision", label: "Vision (Eyes)" },
    { href: "/jerry/training", label: "Training" },
    { href: "/jerry/lookup", label: "LOOKUP Tags" },
    { href: "/jerry/mentors", label: "Mentors" },
  ];

  const resourceItems = [
    { href: "/sample-projects", label: "Sample Projects" },
    { href: "/team", label: "Team" },
    { href: "/research", label: "Research" },
  ];

  const meetingsItems = [
    { href: "/meetings", label: "Meetings" },
    { href: "/action-items", label: "Action Items" },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              TurboTech Portal
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600 transition-colors px-3 py-2"
                >
                  Dashboard
                </Link>
                <Dropdown label="Project" items={projectItems} />
                <Dropdown label="Jerry (AI)" items={jerryItems} />
                <Dropdown label="Resources" items={resourceItems} />
                <Dropdown label="Meetings & Actions" items={meetingsItems} />
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {isLoading && (
              <div className="text-sm text-gray-500">Loading...</div>
            )}

            {!isLoading && !user && (
              <a
                href={`/api/auth/login${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION ? `?organization=${process.env.NEXT_PUBLIC_AUTH0_ORGANIZATION}` : ''}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </a>
            )}

            {!isLoading && user && (
              <>
                {/* Desktop User Info */}
                <div className="hidden md:flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  {user.picture && (
                    <img
                      src={user.picture}
                      alt={user.name || "User"}
                      className="h-10 w-10 rounded-full"
                    />
                  )}
                  <a
                    href="/api/auth/logout"
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Logout
                  </a>
                </div>

                {/* Mobile User Avatar */}
                <div className="flex md:hidden items-center gap-2">
                  {user.picture && (
                    <img
                      src={user.picture}
                      alt={user.name || "User"}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <a
                    href="/api/auth/logout"
                    className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Logout
                  </a>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {mobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && user && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              <Link
                href="/dashboard"
                className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>

              <div className="px-3 py-1 text-sm font-semibold text-gray-500">Project</div>
              {projectItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg pl-6"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="px-3 py-1 text-sm font-semibold text-gray-500 mt-2">Jerry (AI)</div>
              {jerryItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg pl-6"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="px-3 py-1 text-sm font-semibold text-gray-500 mt-2">Resources</div>
              {resourceItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg pl-6"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="px-3 py-1 text-sm font-semibold text-gray-500 mt-2">Meetings & Actions</div>
              {meetingsItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg pl-6"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
