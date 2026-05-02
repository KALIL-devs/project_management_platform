"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

type Client = {
  id: string;
  name: string;
  email: string;
};

type Roadmap = {
  id: string;
  title: string;
  clientId: string;
  client: Client;
  months: {
    modules: {
      tasks: { status: string }[];
    }[];
  }[];
  createdAt: string;
};

export default function RoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [clientId, setClientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchRoadmaps() {
    try {
      const res = await fetch("/api/roadmap");
      const data = await res.json();
      setRoadmaps(Array.isArray(data) ? data : []);
    } catch {
      setRoadmaps([]);
    }
  }

  async function fetchClients() {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      const allUsers = Array.isArray(data) ? data : [];
      setClients(allUsers.filter((u: Client & { role: string }) => u.role === "CLIENT"));
    } catch {
      setClients([]);
    }
  }

  useEffect(() => {
    fetchRoadmaps();
    fetchClients();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    setClientId("");
    setShowForm(false);
    fetchRoadmaps();
    setLoading(false);
  }

  function getStats(roadmap: Roadmap) {
    const allTasks = roadmap.months.flatMap((m) =>
      m.modules.flatMap((mod) => mod.tasks)
    );
    const total = allTasks.length;
    const completed = allTasks.filter((t) => t.status === "COMPLETED").length;
    const inProgress = allTasks.filter((t) => t.status === "IN_PROGRESS").length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, percent };
  }

  const clientsWithoutRoadmap = clients.filter(
    (c) => !roadmaps.find((r) => r.clientId === c.id)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Roadmaps</h1>
          <p className="text-gray-500 mt-1">Manage 90-day SEO roadmaps for clients.</p>
        </div>
        {clientsWithoutRoadmap.length > 0 && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Create Roadmap"}
          </Button>
        )}
      </div>

      {/* Create Roadmap Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Create 90-Day SEO Roadmap
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            This will automatically create all 13 modules and 67 tasks from the SEO template.
          </p>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 max-w-md">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Select Client</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a client</option>
                {clientsWithoutRoadmap.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" fullWidth>
              {loading ? "Creating..." : "Create Roadmap"}
            </Button>
          </form>
        </div>
      )}

      {/* Roadmaps List */}
      {roadmaps.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <p className="text-4xl mb-4">🗺️</p>
          <p className="text-gray-500">No roadmaps yet.</p>
          <p className="text-gray-400 text-sm mt-1">
            Create a roadmap for a client to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roadmaps.map((roadmap) => {
            const stats = getStats(roadmap);
            return (
              <Link key={roadmap.id} href={`/admin/roadmaps/${roadmap.clientId}`}>
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {roadmap.client.name}
                      </h2>
                      <p className="text-sm text-gray-400">{roadmap.client.email}</p>
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                      90-Day SEO
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Overall Progress</span>
                      <span>{stats.percent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${stats.percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>✅ {stats.completed} completed</span>
                    <span>⏳ {stats.inProgress} in progress</span>
                    <span>📋 {stats.total} total</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}