"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";

const navItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity=".8" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity=".8" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity=".8" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity=".8" />
      </svg>
    ),
  },
  {
    name: "User Management",
    path: "/users",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "Vendor Management",
    path: "/vendors",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M20 4H4v2l8 5 8-5V4zM4 13v7h16v-7l-8 5-8-5z"
          fill="currentColor"
          opacity=".3"
        />
        <path
          d="M12 3L2 8.5v1l10 6 10-6v-1L12 3zM4 13.09V18h16v-4.91l-8 4.8-8-4.8z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "Content Management",
    path: "/content",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 2V8H20"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 13H8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 17H8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 9H8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const profileItems = [
  {
    name: "My Profile",
    path: "/profile",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "Change Password",
    path: "/change-password",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const show = isExpanded || isMobileOpen || isHovered;

  const isActive = (path: string) => pathname === path;

  const renderItem = (item: { name: string; path: string; icon: React.ReactNode }) => (
    <li key={item.name}>
      <Link
        href={item.path}
        className={`menu-item group ${isActive(item.path) ? "menu-item-active" : "menu-item-inactive"} ${!show ? "lg:justify-center" : ""}`}
      >
        <span className={`menu-item-icon-size ${isActive(item.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
          {item.icon}
        </span>
        {show && <span className="font-medium text-theme-sm">{item.name}</span>}
      </Link>
    </li>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className={`py-8 flex ${!show ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/dashboard" className="flex items-center gap-2">
          {show ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Jewellery</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <div className="flex flex-col overflow-y-auto no-scrollbar flex-1">
        <nav className="flex flex-col gap-6">
          {/* Main */}
          <div>
            {show && <h2 className="mb-3 text-xs uppercase font-semibold text-gray-400 tracking-wider">Main</h2>}
            {!show && <div className="mb-3 flex justify-center"><div className="w-5 h-px bg-gray-300 dark:bg-gray-700" /></div>}
            <ul className="flex flex-col gap-1">
              {navItems.map(renderItem)}
            </ul>
          </div>

          {/* Account */}
          <div>
            {show && <h2 className="mb-3 text-xs uppercase font-semibold text-gray-400 tracking-wider">Account</h2>}
            {!show && <div className="mb-3 flex justify-center"><div className="w-5 h-px bg-gray-300 dark:bg-gray-700" /></div>}
            <ul className="flex flex-col gap-1">
              {profileItems.map(renderItem)}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
}
