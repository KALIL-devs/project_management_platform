"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "🏠" },
  { label: "Messages", href: "/admin/messages", icon: "📨" },
  { label: "Clients", href: "/admin/users/clients", icon: "🤝" },
  { label: "Employees", href: "/admin/users/employees", icon: "👨‍💼" },
  { label: "Tasks", href: "/admin/tasks", icon: "✅" },
  { label: "Roadmaps", href: "/admin/roadmaps", icon: "🗺️" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">

        {/* Brand */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">FixyAds</h1>
          <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
          >
            <span>🚪</span>
            Sign Out
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}