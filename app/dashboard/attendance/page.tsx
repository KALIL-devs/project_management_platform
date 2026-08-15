"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import PunchCard from "@/components/attendance/PunchCard";
import SessionDetailModal, { AttendanceSession } from "@/components/attendance/SessionDetailModal";

type Attendance = {
  id: string;
  date: string;
  punchIn: string;
  punchOut?: string | null;
  totalMinutes?: number | null;
  status: "PUNCHED_IN" | "PUNCHED_OUT" | "ABSENT";
  notes?: string | null;
  createdAt: string;
};

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority?: string;
  updatedAt?: string;
  createdAt?: string;
  client?: { name: string } | null;
};

export default function EmployeeAttendancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [activePunch, setActivePunch] = useState<Attendance | null>(null);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [myRoadmapTasks, setMyRoadmapTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected session for modal
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [showModal, setShowModal] = useState(false);

  async function fetchMyData() {
    try {
      const [attRes, taskRes, roadmapRes] = await Promise.all([
        fetch("/api/attendance/my"),
        fetch("/api/tasks/my"),
        fetch("/api/roadmap/my-tasks"),
      ]);

      if (attRes.ok) {
        const attData = await attRes.json();
        setAttendances(attData.attendances || []);
        setActivePunch(attData.activePunch || null);
      }

      if (taskRes.ok) {
        const taskData = await taskRes.json();
        setMyTasks(Array.isArray(taskData) ? taskData : []);
      }

      if (roadmapRes.ok) {
        const rmData = await roadmapRes.json();
        setMyRoadmapTasks(Array.isArray(rmData) ? rmData : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMyData();
  }, []);

  function handleOpenSessionDetails(session: Attendance) {
    setSelectedSession(session);
    setShowModal(true);
  }

  const totalPunchDays = attendances.length;
  const totalMinutesWorked = attendances.reduce((acc, item) => acc + (item.totalMinutes || 0), 0);
  const totalHoursWorked = (totalMinutesWorked / 60).toFixed(1);

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Attendance & Work Logs
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Punch in/out for daily work sessions and click any shift log to view detailed session activities.
        </p>
      </div>

      {/* Shared Punch Card */}
      <PunchCard activePunch={activePunch} onPunchSuccess={fetchMyData} />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Status</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {activePunch ? (
              <span className="text-emerald-600">Online</span>
            ) : (
              <span className="text-slate-500">Offline</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {activePunch
              ? `Started at ${new Date(activePunch.punchIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : "No active shift in progress"}
          </p>
        </Card>

        <Card>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Time Logged</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {totalHoursWorked} <span className="text-sm font-normal text-slate-500">hrs</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Across all completed shifts</p>
        </Card>

        <Card>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recorded Sessions</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{totalPunchDays}</div>
          <p className="text-xs text-slate-400 mt-1">Total attendance records</p>
        </Card>
      </div>

      {/* Log Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">My Attendance History</h3>
            <p className="text-xs text-slate-400 mt-0.5">Click any shift log to inspect detailed session notes & tasks.</p>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading attendance logs..." />
        ) : attendances.length === 0 ? (
          <EmptyState
            icon="⏰"
            title="No punch history found"
            description="Use the punch card above to start your first work session."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Punch In</th>
                  <th className="px-6 py-4">Punch Out</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Session Notes</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {attendances.map((att) => {
                  const pInDate = new Date(att.punchIn);
                  const pOutDate = att.punchOut ? new Date(att.punchOut) : null;
                  const mins = att.totalMinutes || 0;
                  const hrs = Math.floor(mins / 60);
                  const remMins = mins % 60;
                  const durationStr = att.punchOut
                    ? `${hrs > 0 ? `${hrs}h ` : ""}${remMins}m`
                    : "In Progress";

                  return (
                    <tr
                      key={att.id}
                      onClick={() => handleOpenSessionDetails(att)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900 group-hover:text-blue-600">
                        {new Date(att.date || att.punchIn).toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 font-medium text-emerald-700">
                        {pInDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {pOutDate
                          ? pOutDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{durationStr}</td>
                      <td className="px-6 py-4">
                        {att.status === "PUNCHED_IN" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Online
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Offline
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                        {att.notes || "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-800 transition-colors">
                          View Details →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Session Details Floating Modal */}
      <SessionDetailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        session={selectedSession}
        relatedTasks={myTasks}
        relatedRoadmapTasks={myRoadmapTasks}
      />
    </div>
  );
}
