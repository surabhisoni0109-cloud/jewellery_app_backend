"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import Toggle from "@/components/ui/Toggle";
import type { User, PaginatedResponse } from "@/lib/types";

interface UserTableProps {
  initialData?: PaginatedResponse<User>;
  type: "USER" | "VENDOR";
  apiPath: string;
}

export default function UserTable({ initialData, type, apiPath }: UserTableProps) {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<User>>(
    initialData || { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(!initialData?.data?.length);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetchData(1, "");
  }, []);

  const fetchData = async (p: number, s: string) => {
    setLoading(true);
    try {
      const res = await api.get(apiPath, { params: { page: p, limit: 10, search: s || undefined } });
      setData(res.data.data);
      setPage(p);
    } catch {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(1, search);
  };

  const handleToggle = async (user: User) => {
    setToggling(user.id);
    try {
      const res = await api.patch(`${apiPath}/${user.id}/status`);
      const updated = res.data.data;
      setData((prev) => ({
        ...prev,
        data: prev.data.map((u) => (u.id === updated.id ? updated : u)),
      }));
      toast.success(`${type === "USER" ? "User" : "Vendor"} ${updated.status === "ACTIVE" ? "activated" : "blocked"}`);
      router.refresh();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden shadow-theme-xs">
      {/* Search bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="16" height="16" viewBox="0 0 20 20" fill="none"
            >
              <path fillRule="evenodd" clipRule="evenodd" d="M3.04 9.37a6.33 6.33 0 1112.67 0 6.33 6.33 0 01-12.67 0zm6.33-7.83a7.83 7.83 0 100 15.66A7.83 7.83 0 009.37 1.54zm5.3 13.21l2.82 2.82a.75.75 0 01-1.06 1.06l-2.82-2.82a.75.75 0 011.06-1.06z" fill="currentColor"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${type === "USER" ? "users" : "vendors"}…`}
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="h-10 px-5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); fetchData(1, ""); }}
              className="h-10 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <th className="text-left px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">Mobile</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">Joined</th>
              <th className="text-center px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M8 15H16M9 9H9.01M15 9H15.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <p className="text-sm">No {type === "USER" ? "users" : "vendors"} found</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.data.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 font-semibold text-xs shrink-0">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400 font-mono text-xs">{user.mobileNumber}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.status === "ACTIVE"
                        ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
                        : "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === "ACTIVE" ? "bg-success-500" : "bg-error-500"}`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Toggle
                      checked={user.status === "ACTIVE"}
                      onChange={() => handleToggle(user)}
                      disabled={toggling === user.id}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {((data.meta.page - 1) * data.meta.limit) + 1}–{Math.min(data.meta.page * data.meta.limit, data.meta.total)} of {data.meta.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData(page - 1, search)}
              disabled={page <= 1 || loading}
              className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-400"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === data.meta.totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span key={`dots-${p}`} className="text-gray-400 px-1">…</span>
                  )}
                  <button
                    key={p}
                    onClick={() => fetchData(p, search)}
                    disabled={loading}
                    className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                      page === p
                        ? "bg-brand-500 text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {p}
                  </button>
                </>
              ))}
            <button
              onClick={() => fetchData(page + 1, search)}
              disabled={page >= data.meta.totalPages || loading}
              className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-400"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
