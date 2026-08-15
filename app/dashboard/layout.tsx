"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  { label: "My Dashboard", href: "/dashboard", icon: "✅" },
  { label: "Client Roadmaps", href: "/dashboard/roadmaps", icon: "🗺️" },
  { label: "Attendance & Logs", href: "/dashboard/attendance", icon: "⏰" },
];

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
            E
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 leading-tight">FixyAds</h1>
            <p className="text-xs font-semibold text-slate-400">Employee Portal</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User profile & Sign Out */}
        <div className="p-4 border-t border-slate-100 sticky bottom-0 bg-white space-y-3">
          <div className="px-2">
            <p className="text-xs font-bold text-slate-800 truncate">{session?.user?.name || "Employee User"}</p>
            <p className="text-[11px] text-slate-400 truncate">{session?.user?.email || "emp@fixyads.com"}</p>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50/60 hover:bg-rose-100 transition-colors w-full cursor-pointer"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
