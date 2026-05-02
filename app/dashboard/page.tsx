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
  client: { id: string; name: string } | null;
};

type RoadmapTask = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDay: number | null;
  module: {
    title: string;
    month: {
      title: string;
      roadmap: {
        client: { id: string; name: string };
      };
    };
  };
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

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-500",
  MEDIUM: "bg-yellow-100 text-yellow-600",
  HIGH: "bg-orange-100 text-orange-600",
  URGENT: "bg-red-100 text-red-600",
};

const roadmapStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  BLOCKED: "bg-red-100 text-red-700",
};

const roadmapStatusLabels: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  BLOCKED: "Blocked",
};

export default function EmployeeDashboard() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [roadmapTasks, setRoadmapTasks] = useState<RoadmapTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        // Fetch regular tasks
        const taskRes = await fetch("/api/tasks/my");
        const taskData = await taskRes.json();
        setTasks(Array.isArray(taskData) ? taskData : []);

        // Fetch roadmap tasks assigned to this employee
        const roadmapRes = await fetch("/api/roadmap/my-tasks");
        const roadmapData = await roadmapRes.json();
        setRoadmapTasks(Array.isArray(roadmapData) ? roadmapData : []);
      } catch {
        setTasks([]);
        setRoadmapTasks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  async function handleTaskStatusChange(id: string, status: string) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, status } : task))
    );
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function handleRoadmapTaskStatusChange(id: string, status: string) {
    setRoadmapTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, status } : task))
    );
    await fetch(`/api/roadmap/task/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">FixyAds</h1>
          <p className="text-xs text-gray-400 mt-0.5">Employee Panel</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/dashboard"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>✅</span> My Tasks
          </Link>
          <Link
            href="/dashboard/roadmaps"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/dashboard/roadmaps"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>🗺️</span> Roadmaps
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
{/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {session?.user?.name}!
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-gray-400">Loading tasks...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">

            {/* Top Row — Active Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Column 1 — Regular Tasks (active only) */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Regular Tasks</h2>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                    {tasks.filter(t => t.status !== "COMPLETED").length}
                  </span>
                </div>

                {tasks.filter(t => t.status !== "COMPLETED").length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                    <p className="text-2xl mb-2">📋</p>
                    <p className="text-gray-400 text-sm">No active tasks.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {tasks.filter(t => t.status !== "COMPLETED").map((task) => (
                      <div
                        key={task.id}
                        className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-800">
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-xs text-gray-500 mt-1">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[task.status]}`}>
                                {statusLabels[task.status]}
                              </span>
                              {task.client && (
                                <span className="text-xs text-gray-400">
                                  🤝 {task.client.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <select
                            value={task.status}
                            onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Column 2 — Roadmap Tasks (active only) */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Roadmap Tasks</h2>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                    {roadmapTasks.filter(t => t.status !== "COMPLETED").length}
                  </span>
                </div>

                {roadmapTasks.filter(t => t.status !== "COMPLETED").length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                    <p className="text-2xl mb-2">🗺️</p>
                    <p className="text-gray-400 text-sm">No active roadmap tasks.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {roadmapTasks.filter(t => t.status !== "COMPLETED").map((task) => (
                      <div
                        key={task.id}
                        className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-800">
                              {task.title}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">
                              {task.module.title}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roadmapStatusColors[task.status]}`}>
                                {roadmapStatusLabels[task.status]}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </span>
                              <span className="text-xs text-gray-400">
                                🤝 {task.module.month.roadmap.client.name}
                              </span>
                              {task.dueDay && (
                                <span className="text-xs text-gray-400">
                                  Day {task.dueDay}
                                </span>
                              )}
                            </div>
                          </div>
                          <select
                            value={task.status}
                            onChange={(e) => handleRoadmapTaskStatusChange(task.id, e.target.value)}
                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="BLOCKED">Blocked</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row — Completed Tasks */}
            {(tasks.filter(t => t.status === "COMPLETED").length > 0 ||
              roadmapTasks.filter(t => t.status === "COMPLETED").length > 0) && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Completed</h2>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                    {tasks.filter(t => t.status === "COMPLETED").length +
                     roadmapTasks.filter(t => t.status === "COMPLETED").length}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                  {/* Completed Regular Tasks */}
                  <div className="flex flex-col gap-3">
                    {tasks.filter(t => t.status === "COMPLETED").length > 0 && (
                      <>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                          Regular Tasks
                        </p>
                        {tasks.filter(t => t.status === "COMPLETED").map((task) => (
                          <div
                            key={task.id}
                            className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 opacity-70"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-500 line-through">
                                  {task.title}
                                </h3>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                                    Completed
                                  </span>
                                  {task.client && (
                                    <span className="text-xs text-gray-400">
                                      🤝 {task.client.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <select
                                value={task.status}
                                onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                                className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Completed Roadmap Tasks */}
                  <div className="flex flex-col gap-3">
                    {roadmapTasks.filter(t => t.status === "COMPLETED").length > 0 && (
                      <>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                          Roadmap Tasks
                        </p>
                        {roadmapTasks.filter(t => t.status === "COMPLETED").map((task) => (
                          <div
                            key={task.id}
                            className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 opacity-70"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-500 line-through">
                                  {task.title}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">
                                  {task.module.title}
                                </p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                                    Completed
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    🤝 {task.module.month.roadmap.client.name}
                                  </span>
                                </div>
                              </div>
                              <select
                                value={task.status}
                                onChange={(e) => handleRoadmapTaskStatusChange(task.id, e.target.value)}
                                className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="BLOCKED">Blocked</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}