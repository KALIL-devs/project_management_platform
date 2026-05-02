"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

type Employee = {
  id: string;
  name: string;
  email: string;
};

type RoadmapTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDay: number | null;
  employeeId: string | null;
  assignedTo: { id: string; name: string; email: string } | null;
};

type RoadmapModule = {
  id: string;
  title: string;
  description: string | null;
  order: number;
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
  PENDING: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-100 text-blue-600",
  COMPLETED: "bg-green-100 text-green-600",
  BLOCKED: "bg-red-100 text-red-600",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-500",
  MEDIUM: "bg-yellow-100 text-yellow-600",
  HIGH: "bg-orange-100 text-orange-600",
  URGENT: "bg-red-100 text-red-600",
};

export default function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeMonth, setActiveMonth] = useState(0);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  async function fetchRoadmap() {
    try {
      const res = await fetch(`/api/roadmap/${clientId}`);
      const data = await res.json();
      setRoadmap(data);
      if (data?.months?.length > 0) {
        const allModuleIds = data.months.flatMap((m: RoadmapMonth) =>
          m.modules.map((mod: RoadmapModule) => mod.id)
        );
        setExpandedModules(new Set(allModuleIds));
      }
    } catch {
      setRoadmap(null);
    }
  }

  async function fetchEmployees() {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      const users = Array.isArray(data) ? data : [];
      setEmployees(users.filter((u: Employee & { role: string }) => u.role === "EMPLOYEE"));
    } catch {
      setEmployees([]);
    }
  }

  useEffect(() => {
    fetchRoadmap();
    fetchEmployees();
  }, [clientId]);

  async function handleTaskUpdate(
    taskId: string,
    field: string,
    value: string
  ) {
    setRoadmap((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        months: prev.months.map((month) => ({
          ...month,
          modules: month.modules.map((mod) => ({
            ...mod,
            tasks: mod.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    [field]: value,
                    assignedTo:
                      field === "employeeId"
                        ? employees.find((e) => e.id === value) || null
                        : task.assignedTo,
                  }
                : task
            ),
          })),
        })),
      };
    });

    await fetch(`/api/roadmap/task/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value || null }),
    });
  }

  function toggleModule(moduleId: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  function getModuleStats(tasks: RoadmapTask[]) {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }

  if (!roadmap) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading roadmap...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => router.push("/admin/roadmaps")}
            className="text-sm text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1"
          >
            ← Back to Roadmaps
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            {roadmap.client.name}
          </h1>
          <p className="text-gray-500 mt-1">90-Day SEO Roadmap</p>
        </div>
      </div>

      {/* Month Tabs */}
      <div className="flex gap-2 mb-6">
        {roadmap.months.map((month, index) => (
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

      {/* Active Month */}
      {roadmap.months[activeMonth] && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {roadmap.months[activeMonth].title}
          </h2>

          <div className="flex flex-col gap-4">
            {roadmap.months[activeMonth].modules.map((mod) => {
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
                      <span className="text-lg">{isExpanded ? "▼" : "▶"}</span>
                      <div>
                        <h3 className="font-semibold text-gray-800">{mod.title}</h3>
                        {mod.description && (
                          <p className="text-sm text-gray-400 mt-0.5">{mod.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {stats.completed}/{stats.total} tasks
                        </p>
                        <div className="w-24 bg-gray-100 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${stats.percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Tasks */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {mod.tasks.map((task, taskIndex) => (
                        <div
                          key={task.id}
                          className={`p-4 flex items-center gap-4 flex-wrap ${
                            taskIndex !== mod.tasks.length - 1
                              ? "border-b border-gray-50"
                              : ""
                          }`}
                        >
                          {/* Task Title */}
                          <div className="flex-1 min-w-48">
                            <p className="text-sm font-medium text-gray-800">
                              {task.title}
                            </p>
                            {task.dueDay && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                Day {task.dueDay}
                              </p>
                            )}
                          </div>

                          {/* Priority */}
                          <select
                            value={task.priority}
                            onChange={(e) =>
                              handleTaskUpdate(task.id, "priority", e.target.value)
                            }
                            className={`text-xs px-2 py-1 rounded-lg border-0 font-medium cursor-pointer ${priorityColors[task.priority]}`}
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                          </select>

                          {/* Assign Employee */}
                          <select
                            value={task.employeeId || ""}
                            onChange={(e) =>
                              handleTaskUpdate(task.id, "employeeId", e.target.value)
                            }
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Unassigned</option>
                            {employees.map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.name}
                              </option>
                            ))}
                          </select>

                          {/* Status */}
                          <select
                            value={task.status}
                            onChange={(e) =>
                              handleTaskUpdate(task.id, "status", e.target.value)
                            }
                            className={`text-xs px-2 py-1 rounded-lg border-0 font-medium cursor-pointer ${statusColors[task.status]}`}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="BLOCKED">Blocked</option>
                          </select>
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
    </div>
  );
}