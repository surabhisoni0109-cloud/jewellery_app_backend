"use client";

import UserTable from "@/components/ui/UserTable";

export default function UsersPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage all registered buyers — view, search, and activate/block accounts.
        </p>
      </div>

      <UserTable type="USER" apiPath="/admin/users" />
    </>
  );
}
