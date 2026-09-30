"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import StatCard from "@/components/ui/StatCard";
import type { DashboardStats } from "@/lib/types";

export default function DashboardPage() {
  const { admin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, totalVendors: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get("/admin/dashboard");
        setStats(res.data.data);
      } catch (e) {
        console.error("Failed to load dashboard stats", e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Welcome back, {admin?.name || "Admin"}! Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <StatCard
          title="Total Users"
          value={loading ? "..." : stats.totalUsers}
          color="brand"
          description="Registered buyers on the platform"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"/>
            </svg>
          }
        />
        <StatCard
          title="Total Vendors"
          value={loading ? "..." : stats.totalVendors}
          color="success"
          description="Active jewellery store owners"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V8L12 13L20 8V18ZM12 11L4 6H20L12 11Z"/>
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 shadow-theme-xs">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/users"
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:border-brand-300 hover:bg-brand-50 transition-colors dark:border-gray-800 dark:hover:border-brand-800 dark:hover:bg-brand-500/5 group"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 group-hover:bg-brand-100 dark:bg-brand-500/10 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Manage Users</p>
              <p className="text-xs text-gray-500">{stats.totalUsers} total</p>
            </div>
          </Link>
          <Link
            href="/vendors"
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:border-success-300 hover:bg-success-50 transition-colors dark:border-gray-800 dark:hover:border-success-700 dark:hover:bg-success-500/5 group"
          >
            <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center text-success-600 group-hover:bg-success-100 dark:bg-success-500/10 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V8L12 13L20 8V18ZM12 11L4 6H20L12 11Z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Manage Vendors</p>
              <p className="text-xs text-gray-500">{stats.totalVendors} total</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
