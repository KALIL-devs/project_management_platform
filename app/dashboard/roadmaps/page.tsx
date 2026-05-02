"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type RoadmapTask = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDay: number | null;
  assignedTo: { id: string; name: string } | null;
};

type RoadmapModule = {
  id: string;
  title: string;
  description: string | null;
  tasks: RoadmapTask[];
};

type RoadmapMonth = {
  id: string;
  monthNumber: number;
  title: string;
  modules: RoadmapModule[];
};

type Roadmap = {
  id: string;
  title: string;
  client: { id: string; name: string; email: string };
  months: RoadmapMonth[];
};

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-500",
  IN_PROGRESS: "bg-blue-100 text-blue-600",
  COMPLETED: "bg-green-100 text-green-600",
  BLOCKED: "bg-red-100 text-red-600",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  BLOCKED: "Blocked",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-500",
  MEDIUM: "bg-yellow-100 text-yellow-600",
  HIGH: "bg-orange-100 text-orange-600",
  URGENT: "bg-red-100 text-red-600",
};

export default function EmployeeRoadmapsPage() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState(0);
  const [activeMonth, setActiveMonth] = useState(0);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoadmaps() {
      try {
        const res = await fetch("/api/roadmap/employee");
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setRoadmaps(list);

        if (list.length > 0) {
          const allModuleIds = list[0].months.flatMap((m: RoadmapMonth) =>
            m.modules.map((mod: RoadmapModule) => mod.id)
          );
          setExpandedModules(new Set(allModuleIds));
        }
      } catch {
        setRoadmaps([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRoadmaps();
  }, []);

  function toggleModule(moduleId: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  function switchRoadmap(index: number) {
    setActiveRoadmap(index);
    setActiveMonth(0);
    if (roadmaps[index]) {
      const allModuleIds = roadmaps[index].months.flatMap((m) =>
        m.modules.map((mod) => mod.id)
      );
      setExpandedModules(new Set(allModuleIds));
    }
  }

  function getModuleStats(tasks: RoadmapTask[]) {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }

  function getOverallStats(roadmap: Roadmap) {
    const allTasks = roadmap.months.flatMap((m) =>
      m.modules.flatMap((mod) => mod.tasks)
    );
    const total = allTasks.length;
    const completed = allTasks.filter((t) => t.status === "COMPLETED").length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }

  const currentRoadmap = roadmaps[activeRoadmap];

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
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Client Roadmaps</h1>
          <p className="text-gray-500 mt-1">View all client 90-day SEO roadmaps.</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-gray-400">Loading roadmaps...</p>
          </div>
        ) : roadmaps.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-4xl mb-4">🗺️</p>
            <p className="text-gray-500">No roadmaps created yet.</p>
          </div>
        ) : (
          <>
            {/* Client Selector */}
            {roadmaps.length > 1 && (
              <div className="flex gap-2 mb-6 flex-wrap">
                {roadmaps.map((roadmap, index) => (
                  <button
                    key={roadmap.id}
                    onClick={() => switchRoadmap(index)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeRoadmap === index
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-blue-200"
                    }`}
                  >
                    {roadmap.client.name}
                  </button>
                ))}
              </div>
            )}

            {currentRoadmap && (
              <>
                {/* Overall Progress */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {currentRoadmap.client.name}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {currentRoadmap.client.email}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {getOverallStats(currentRoadmap).percent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${getOverallStats(currentRoadmap).percent}%` }}
                    />
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500 mt-2">
                    <span>✅ {getOverallStats(currentRoadmap).completed} completed</span>
                    <span>📋 {getOverallStats(currentRoadmap).total} total</span>
                  </div>
                </div>

                {/* Month Tabs */}
                <div className="flex gap-2 mb-6">
                  {currentRoadmap.months.map((month, index) => (
                    <button
                      key={month.id}
                      onClick={() => setActiveMonth(index)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeMonth === index
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-blue-200"
                      }`}
                    >
                      Month {month.monthNumber}
                    </button>
                  ))}
                </div>

                {/* Modules */}
                {currentRoadmap.months[activeMonth] && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      {currentRoadmap.months[activeMonth].title}
                    </h2>
                    <div className="flex flex-col gap-4">
                      {currentRoadmap.months[activeMonth].modules.map((mod) => {
                        const stats = getModuleStats(mod.tasks);
                        const isExpanded = expandedModules.has(mod.id);

                        return (
                          <div
                            key={mod.id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                          >
                            {/* Module Header */}
                            <button
                              onClick={() => toggleModule(mod.id)}
                              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-4 text-left">
                                <span>{isExpanded ? "▼" : "▶"}</span>
                                <div>
                                  <h3 className="font-semibold text-gray-800">{mod.title}</h3>
                                  {mod.description && (
                                    <p className="text-sm text-gray-400 mt-0.5">{mod.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="ml-4 text-right">
                                <p className="text-xs text-gray-400">
                                  {stats.completed}/{stats.total} done
                                </p>
                                <div className="w-24 bg-gray-100 rounded-full h-1.5 mt-1">
                                  <div
                                    className="bg-blue-500 h-1.5 rounded-full"
                                    style={{ width: `${stats.percent}%` }}
                                  />
                                </div>
                              </div>
                            </button>

                            {/* Tasks - Read Only */}
                            {isExpanded && (
                              <div className="border-t border-gray-100">
                                {mod.tasks.map((task, taskIndex) => (
                                  <div
                                    key={task.id}
                                    className={`p-4 flex items-center gap-3 flex-wrap ${
                                      taskIndex !== mod.tasks.length - 1
                                        ? "border-b border-gray-50"
                                        : ""
                                    }`}
                                  >
                                    <span>
                                      {task.status === "COMPLETED" ? "✅" :
                                       task.status === "IN_PROGRESS" ? "⏳" :
                                       task.status === "BLOCKED" ? "🚫" : "⬜"}
                                    </span>

                                    <div className="flex-1 min-w-48">
                                      <p className={`text-sm font-medium ${
                                        task.status === "COMPLETED"
                                          ? "line-through text-gray-400"
                                          : "text-gray-800"
                                      }`}>
                                        {task.title}
                                      </p>
                                      {task.dueDay && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                          Day {task.dueDay}
                                        </p>
                                      )}
                                    </div>

                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
                                      {task.priority}
                                    </span>

                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[task.status]}`}>
                                      {statusLabels[task.status]}
                                    </span>

                                    {task.assignedTo && (
                                      <span className="text-xs text-gray-400">
                                        👤 {task.assignedTo.name}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}