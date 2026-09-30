"use client";

import UserTable from "@/components/ui/UserTable";

export default function VendorsPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vendor Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage all registered jewellery store owners — view, search, and activate/block accounts.
        </p>
      </div>

      <UserTable type="VENDOR" apiPath="/admin/vendors" />
    </>
  );
}
