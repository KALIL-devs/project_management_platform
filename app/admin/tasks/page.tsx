"use client";

import { useState, useEffect, useMemo } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  estimatedHours?: number | null;
  createdAt: string;
  assignedTo: User | null;
  client: User | null;
  dependsOn?: { id: string; title: string; status: string } | null;
};

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED" | "ALL">("ACTIVE");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState("");
  const [clientId, setClientId] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dependsOnId, setDependsOnId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");

  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function fetchTasks() {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch {
      setTasks([]);
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      const users = Array.isArray(data) ? data : [];
      setEmployees(users.filter((u: User) => u.role === "EMPLOYEE"));
      setClients(users.filter((u: User) => u.role === "CLIENT"));
    } catch {
      setEmployees([]);
      setClients([]);
    }
  }

  useEffect(() => {
    Promise.all([fetchTasks(), fetchUsers()]).finally(() => setFetching(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          userId: userId || null,
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
      setUserId("");
      setClientId("");
      setPriority("MEDIUM");
      setDependsOnId("");
      setDueDate("");
      setEstimatedHours("");
      setShowModal(false);
      fetchTasks();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
  }

  async function handleStatusChange(id: string, status: string) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, status } : task))
    );
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  // Priority Weights for sorting
  const priorityWeight: Record<string, number> = {
    URGENT: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  // Sort function: Due Date nearest first, then Priority, then Creation Date
  function sortTasksByDueDate(taskList: Task[]) {
    return [...taskList].sort((a, b) => {
      // Due Date comparison
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;

      // Priority comparison
      const weightA = priorityWeight[a.priority] || 0;
      const weightB = priorityWeight[b.priority] || 0;
      if (weightA !== weightB) return weightB - weightA;

      // Creation date fallback
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  // Categorized tasks
  const activeTasks = useMemo(() => {
    return sortTasksByDueDate(tasks.filter((t) => t.status !== "COMPLETED"));
  }, [tasks]);

  const completedTasks = useMemo(() => {
    return sortTasksByDueDate(tasks.filter((t) => t.status === "COMPLETED"));
  }, [tasks]);

  // Filtered list based on activeTab, searchQuery, priorityFilter
  const displayedTasks = useMemo(() => {
    let sourceList: Task[] = [];
    if (activeTab === "ACTIVE") sourceList = activeTasks;
    else if (activeTab === "COMPLETED") sourceList = completedTasks;
    else sourceList = sortTasksByDueDate(tasks);

    return sourceList.filter((task) => {
      // Search query filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        task.title.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q)) ||
        (task.assignedTo && task.assignedTo.name.toLowerCase().includes(q)) ||
        (task.client && task.client.name.toLowerCase().includes(q));

      // Priority filter
      const matchesPriority =
        priorityFilter === "ALL" || task.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, activeTasks, completedTasks, activeTab, searchQuery, priorityFilter]);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Task Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize tasks by due date, set priorities, and track completed deliverables.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Create New Task</Button>
      </div>

      {/* Modal Form */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Task" maxWidth="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Optimize landing page speed"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 tracking-wide">
              Task Description
            </label>
            <textarea
              placeholder="Detailed instructions, requirements, and deliverables..."
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
              label="Due Date (End Date)"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 tracking-wide">
                Task Dependency (Prerequisite Task)
              </label>
              <select
                value={dependsOnId}
                onChange={(e) => setDependsOnId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">No dependency (Standalone task)</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    Depends on: {t.title} ({t.status})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Estimated Hours"
              type="number"
              step="0.5"
              placeholder="e.g. 4.5"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 tracking-wide">
                Assign Employee
              </label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">No employee assigned</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 tracking-wide">
                Assign Client Account
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">No client assigned</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Professional Segmented Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "ACTIVE"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>⏳ Active Work</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === "ACTIVE" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {activeTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("COMPLETED")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "COMPLETED"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>✅ Completed Tasks</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === "COMPLETED" ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {completedTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>📋 All Tasks</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === "ALL" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {tasks.length}
            </span>
          </button>
        </div>

        {/* Search & Priority Filter Controls */}
        <div className="flex items-center gap-2.5">
          <input
            type="text"
            placeholder="Search task, employee, or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-56"
          />

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
            <option value="LOW">Low Only</option>
          </select>
        </div>
      </div>

      {/* Task Content Listing */}
      {fetching ? (
        <Card padding="none">
          <LoadingState message="Loading task directory..." />
        </Card>
      ) : displayedTasks.length === 0 ? (
        <EmptyState
          icon={activeTab === "COMPLETED" ? "✅" : "📋"}
          title={
            searchQuery || priorityFilter !== "ALL"
              ? "No matching tasks found"
              : activeTab === "COMPLETED"
              ? "No completed tasks yet"
              : "No active tasks in queue"
          }
          description={
            activeTab === "COMPLETED"
              ? "Tasks marked as COMPLETED will be organized here."
              : "Create your first task above to start delegating work sorted by due dates."
          }
          actionLabel={activeTab !== "COMPLETED" ? "+ Create Task" : undefined}
          onAction={activeTab !== "COMPLETED" ? () => setShowModal(true) : undefined}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {displayedTasks.map((task) => {
            const isBlocked = task.dependsOn && task.dependsOn.status !== "COMPLETED";
            const isDone = task.status === "COMPLETED";

            // Calculate due date status badge
            let dueBadge = null;
            if (task.dueDate && !isDone) {
              const due = new Date(task.dueDate);
              const now = new Date();
              due.setHours(23, 59, 59, 999);
              const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

              if (diffDays < 0) {
                dueBadge = (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-700 border border-rose-200">
                    ⚠️ Overdue ({Math.abs(diffDays)}d ago)
                  </span>
                );
              } else if (diffDays === 0) {
                dueBadge = (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                    🔥 Due Today
                  </span>
                );
              } else {
                dueBadge = (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    📅 Due in {diffDays}d ({due.toLocaleDateString("en-IN", { day: "numeric", month: "short" })})
                  </span>
                );
              }
            }

            return (
              <Card
                key={task.id}
                className={`transition-all ${
                  isDone
                    ? "bg-slate-50/50 border-slate-200/60 opacity-85"
                    : "hover:border-blue-300"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2
                        className={`text-base font-bold ${
                          isDone ? "line-through text-slate-500" : "text-slate-900"
                        }`}
                      >
                        {task.title}
                      </h2>
                      <Badge type="status" value={task.status} />
                      <Badge type="priority" value={task.priority} />
                      {dueBadge}
                      {isBlocked && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          🔒 Blocked by: {task.dependsOn?.title}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 mt-3 flex-wrap text-xs text-slate-500 font-medium">
                      {task.assignedTo ? (
                        <span>👨‍💼 Employee: <span className="text-slate-800">{task.assignedTo.name}</span></span>
                      ) : (
                        <span className="text-slate-400">No employee assigned</span>
                      )}

                      {task.client ? (
                        <span>🤝 Client: <span className="text-slate-800">{task.client.name}</span></span>
                      ) : (
                        <span className="text-slate-400">No client assigned</span>
                      )}

                      {task.estimatedHours && (
                        <span>⏱️ Est: {task.estimatedHours} hrs</span>
                      )}

                      <span className="text-slate-400">
                        Created: {new Date(task.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className={`border rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 ${
                        isDone
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 focus:ring-emerald-500/20"
                          : "bg-slate-50 text-slate-800 border-slate-200 focus:ring-blue-500/20"
                      }`}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed ✓</option>
                    </select>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(task.id)}
                      className="text-rose-600 hover:bg-rose-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}