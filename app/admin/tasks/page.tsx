"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

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
  createdAt: string;
  assignedTo: User | null;
  client: User | null;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState("");
  const [clientId, setClientId] = useState("");
  const [loading, setLoading] = useState(false);
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
    fetchTasks();
    fetchUsers();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        userId: userId || null,
        clientId: clientId || null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    setTitle("");
    setDescription("");
    setUserId("");
    setClientId("");
    setShowForm(false);
    fetchTasks();
    setLoading(false);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tasks</h1>
          <p className="text-gray-500 mt-1">Create and assign tasks to your team.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Create Task"}
        </Button>
      </div>

      {/* Create Task Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Task</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input
              label="Task Title"
              type="text"
              placeholder="e.g. Design homepage banner"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                placeholder="Task details..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Assign Employee</label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No employee assigned</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Assign Client</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No client assigned</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" fullWidth>
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </form>
        </div>
      )}

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-gray-500">No tasks yet. Create your first task above.</p>
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
                    <h2 className="text-lg font-semibold text-gray-800">{task.title}</h2>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[task.status]}`}>
                      {statusLabels[task.status]}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-gray-500 text-sm mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    {task.assignedTo ? (
                      <p className="text-sm text-gray-500">
                        Employee: <span className="font-medium text-gray-700">{task.assignedTo.name}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">No employee assigned</p>
                    )}
                    {task.client ? (
                      <p className="text-sm text-gray-500">
                        Client: <span className="font-medium text-gray-700">{task.client.name}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">No client assigned</p>
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
                <div className="flex items-center gap-2 ml-4">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-red-400 hover:text-red-600 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}