"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  assignedTo: {
    name: string;
    email: string;
  } | null;
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export default function ClientTasksPage() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    async function fetchTasks() {
      const res = await fetch("/api/tasks/my");
      const data = await res.json();
      setTasks(data);
    }
    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">FixyAds</h1>
          <p className="text-xs text-gray-400 mt-0.5">Client Portal</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          <Link
            href="/client"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/client"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>👤</span> My Profile
          </Link>
          <Link
            href="/client/tasks"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/client/tasks"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>📋</span> My Tasks
          </Link>
          <Link
            href="/client/roadmap"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/client/roadmap"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>🗺️</span> My Roadmap
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-medium text-gray-800">{session?.user?.name}</p>
            <p className="text-xs text-gray-400">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
          <p className="text-gray-500 mt-1">
            Track the progress of your projects.
          </p>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-gray-500">No tasks yet.</p>
            <p className="text-gray-400 text-sm mt-1">
              Your tasks will appear here once assigned by our team.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-lg font-semibold text-gray-800">
                        {task.title}
                      </h2>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[task.status]}`}>
                        {statusLabels[task.status]}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-gray-500 text-sm mt-1">
                        {task.description}
                      </p>
                    )}

                    <div className="mt-3 flex items-center gap-4 flex-wrap">
                      {task.assignedTo ? (
                        <p className="text-sm text-gray-500">
                          Working on this:{" "}
                          <span className="font-medium text-gray-700">
                            {task.assignedTo.name}
                          </span>
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">
                          Not yet assigned to a team member
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(task.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}