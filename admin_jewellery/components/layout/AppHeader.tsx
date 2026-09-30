"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import Link from "next/link";
import Image from "next/image";

export default function AppHeader() {
  const { toggleSidebar, toggleMobileSidebar, isMobileOpen } = useSidebar();
  const { admin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-40 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between grow px-4 py-3 lg:px-6">
        {/* Left: hamburger + logo on mobile */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggle}
            className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.22 7.28a1 1 0 011.42-1.42L12 10.59l4.36-4.73a1 1 0 111.46 1.36L13.06 12l4.76 4.78a1 1 0 01-1.42 1.42L12 13.41l-4.36 4.79a1 1 0 01-1.46-1.36L10.94 12 6.22 7.28z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M0 1a1 1 0 011-1h16a1 1 0 010 2H1a1 1 0 01-1-1zm0 6a1 1 0 011-1h16a1 1 0 010 2H1a1 1 0 01-1-1zm0 6a1 1 0 011-1h9a1 1 0 010 2H1a1 1 0 01-1-1z" fill="currentColor" />
              </svg>
            )}
          </button>

          <Link href="/dashboard" className="lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-base font-bold text-gray-900">Jewellery Admin</span>
            </div>
          </Link>
        </div>

        {/* Right: user dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-200"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-brand-500 flex items-center justify-center shrink-0">
              {admin?.avatar ? (
                <Image src={admin.avatar} alt={admin.name || ""} fill className="object-cover" />
              ) : (
                <span className="text-white text-sm font-semibold">
                  {admin?.name?.[0]?.toUpperCase() || "A"}
                </span>
              )}
            </div>
            <span className="hidden sm:block max-w-[120px] truncate">{admin?.name || "Admin"}</span>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-gray-400">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-theme-lg z-40 dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{admin?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{admin?.email}</p>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    My Profile
                  </Link>
                  <Link
                    href="/change-password"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                    Change Password
                  </Link>
                </div>
                <div className="p-1.5 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
