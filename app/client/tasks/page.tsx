"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";

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

export default function ClientTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("/api/tasks/my");
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Project Deliverables</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track real-time progress on tasks assigned to your business account.
        </p>
      </div>

      {loading ? (
        <Card padding="none">
          <LoadingState message="Loading project tasks..." />
        </Card>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No project tasks assigned yet"
          description="Your active deliverables will appear here as soon as our team assigns tasks."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {tasks.map((task) => (
            <Card key={task.id}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold text-slate-900">{task.title}</h2>
                    <Badge type="status" value={task.status} />
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{task.description}</p>
                  )}

                  <div className="mt-3 flex items-center gap-4 flex-wrap text-xs text-slate-400">
                    {task.assignedTo ? (
                      <span className="font-semibold text-slate-700">
                        👨‍💼 Assigned Specialist: {task.assignedTo.name}
                      </span>
                    ) : (
                      <span>Unassigned</span>
                    )}
                    <span>
                      Created:{" "}
                      {new Date(task.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}