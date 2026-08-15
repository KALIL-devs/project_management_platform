"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import PunchCard from "@/components/attendance/PunchCard";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  estimatedHours?: number | null;
  createdAt: string;
  client: { id: string; name: string } | null;
  dependsOn?: { id: string; title: string; status: string } | null;
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

type ClientUser = {
  id: string;
  name: string;
  email: string;
};

export default function EmployeeDashboard() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [roadmapTasks, setRoadmapTasks] = useState<RoadmapTask[]>([]);
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [activePunch, setActivePunch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Self-Task Creation Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [clientId, setClientId] = useState("");
  const [dependsOnId, setDependsOnId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function fetchMyAttendance() {
    try {
      const res = await fetch("/api/attendance/my");
      if (res.ok) {
        const data = await res.json();
        setActivePunch(data.activePunch || null);
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    }
  }

  async function fetchAllData() {
    try {
      const [taskRes, roadmapRes, userRes] = await Promise.all([
        fetch("/api/tasks/my"),
        fetch("/api/roadmap/my-tasks"),
        fetch("/api/users"),
      ]);

      const taskData = await taskRes.json();
      const roadmapData = await roadmapRes.json();
      const userData = await userRes.json();

      setTasks(Array.isArray(taskData) ? taskData : []);
      setRoadmapTasks(Array.isArray(roadmapData) ? roadmapData : []);

      if (Array.isArray(userData)) {
        setClients(userData.filter((u: any) => u.role === "CLIENT"));
      }

      await fetchMyAttendance();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllData();
  }, []);

  async function handleCreateSelfTask(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          clientId: clientId || null,
          priority,
          dependsOnId: dependsOnId || null,
          dueDate: dueDate || null,
          estimatedHours: estimatedHours || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create task");

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setClientId("");
      setDependsOnId("");
      setDueDate("");
      setEstimatedHours("");
      setShowCreateModal(false);

      // Refresh task list
      const updatedTasksRes = await fetch("/api/tasks/my");
      const updatedTasks = await updatedTasksRes.json();
      setTasks(Array.isArray(updatedTasks) ? updatedTasks : []);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

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

  const activeRegularTasks = tasks.filter((t) => t.status !== "COMPLETED");
  const activeRoadmapTasks = roadmapTasks.filter((t) => t.status !== "COMPLETED");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Workspace</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-800">{session?.user?.name}</span>! Punch in to begin tracking shift work.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowCreateModal(true)}>
            + Create Task for Myself
          </Button>
          <Link
            href="/dashboard/attendance"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all"
          >
            <span>⏰</span> Punch Logs →
          </Link>
        </div>
      </div>

      {/* Self Task Creation Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Task for Myself"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSelfTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Write monthly SEO performance report"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 tracking-wide">
              Description / Notes
            </label>
            <textarea
              placeholder="Task details and steps..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 tracking-wide">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent Priority</option>
              </select>
            </div>

            <Input
              label="Target Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 tracking-wide">
                Link Client Account (Optional)
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">No specific client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 tracking-wide">
                Task Dependency (Prerequisite)
              </label>
              <select
                value={dependsOnId}
                onChange={(e) => setDependsOnId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">No prerequisite task</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    Depends on: {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Estimated Hours"
            type="number"
            step="0.5"
            placeholder="e.g. 2.0"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
          />

          {formError && <p className="text-xs text-rose-600 font-medium">{formError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reusable Punch Card */}
      <PunchCard activePunch={activePunch} onPunchSuccess={fetchMyAttendance} />

      {loading ? (
        <Card padding="none">
          <LoadingState message="Loading your assigned tasks..." />
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active Tasks Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Regular Direct Tasks */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-slate-900">Direct Tasks</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    {activeRegularTasks.length}
                  </span>
                </div>
              </div>

              {activeRegularTasks.length === 0 ? (
                <EmptyState
                  icon="📋"
                  title="No pending direct tasks"
                  description="All direct tasks assigned to you or created by you are completed."
                  actionLabel="+ Create Task"
                  onAction={() => setShowCreateModal(true)}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {activeRegularTasks.map((task) => {
                    const isBlocked = task.dependsOn && task.dependsOn.status !== "COMPLETED";

                    return (
                      <Card key={task.id} padding="sm" className="hover:border-blue-300">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
                            {task.description && (
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              <Badge type="status" value={task.status} />
                              <Badge type="priority" value={task.priority} />

                              {isBlocked && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  🔒 Blocked by: {task.dependsOn?.title}
                                </span>
                              )}

                              {task.client && (
                                <span className="text-xs text-slate-500 font-medium">
                                  🤝 Client: {task.client.name}
                                </span>
                              )}

                              {task.dueDate && (
                                <span className="text-xs text-amber-700 font-semibold">
                                  📅 Due: {new Date(task.dueDate).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </span>
                              )}
                            </div>
                          </div>

                          <select
                            value={task.status}
                            onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                            className="border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Roadmap Tasks */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <h2 className="text-lg font-bold text-slate-900">Roadmap Tasks</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                  {activeRoadmapTasks.length}
                </span>
              </div>

              {activeRoadmapTasks.length === 0 ? (
                <EmptyState
                  icon="🗺️"
                  title="No active roadmap tasks"
                  description="You currently have no pending tasks from client 90-day roadmaps."
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {activeRoadmapTasks.map((task) => (
                    <Card key={task.id} padding="sm" className="hover:border-indigo-300">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
                          <p className="text-xs font-medium text-slate-400 mt-0.5">
                            {task.module.title}
                          </p>
                          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            <Badge type="status" value={task.status} />
                            <Badge type="priority" value={task.priority} />
                            <span className="text-xs text-slate-500 font-medium">
                              🤝 {task.module.month.roadmap.client.name}
                            </span>
                            {task.dueDay && (
                              <span className="text-xs text-slate-400">Day {task.dueDay}</span>
                            )}
                          </div>
                        </div>

                        <select
                          value={task.status}
                          onChange={(e) => handleRoadmapTaskStatusChange(task.id, e.target.value)}
                          className="border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="BLOCKED">Blocked</option>
                        </select>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}