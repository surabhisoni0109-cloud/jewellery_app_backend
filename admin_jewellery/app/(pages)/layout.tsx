"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AppSidebar from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login");
    }
  }, [isLoading, token, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="animate-spin h-6 w-6 text-brand-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3H4z"/>
          </svg>
          <span className="text-sm font-medium">Loading Admin...</span>
        </div>
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        {/* Backdrop for mobile */}
        {isMobileOpen && (
          <div className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden" />
        )}
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <main className="p-4 mx-auto max-w-screen-2xl md:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
