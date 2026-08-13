"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";

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

export default function EmployeeAttendancePage() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [activePunch, setActivePunch] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);

  // Action states
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function fetchMyAttendance() {
    try {
      const res = await fetch("/api/attendance/my");
      if (!res.ok) throw new Error("Failed to fetch attendance");
      const data = await res.json();
      setAttendances(data.attendances || []);
      setActivePunch(data.activePunch || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  async function handlePunch(action: "PUNCH_IN" | "PUNCH_OUT") {
    setActionLoading(true);
    setMessage(null);

    const userId = (session?.user as any)?.id;
    if (!userId) {
      setMessage({ text: "Session error. Please log in again.", type: "error" });
      setActionLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Punch action failed");
      }

      setMessage({
        text: action === "PUNCH_IN" ? "✅ Successfully Punched In!" : "✅ Successfully Punched Out!",
        type: "success",
      });
      setNotes("");
      fetchMyAttendance();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to record punch", type: "error" });
    } finally {
      setActionLoading(false);
    }
  }

  // Calculate stats
  const totalPunchDays = attendances.length;
  const totalMinutesWorked = attendances.reduce((acc, item) => acc + (item.totalMinutes || 0), 0);
  const totalHoursWorked = (totalMinutesWorked / 60).toFixed(1);

  const isPunchedIn = !!activePunch;

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
          <Link
            href="/dashboard/attendance"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/dashboard/attendance"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>⏰</span> Attendance
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
      <main className="flex-1 p-8 overflow-y-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Attendance & Punch Logs</h1>
          <p className="text-gray-500 mt-1">
            Monitor your punch status, start/stop your work sessions, and review your complete log history.
          </p>
        </div>

        {/* Punch Control Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${
                    isPunchedIn
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isPunchedIn ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                    }`}
                  ></span>
                  {isPunchedIn ? "Online" : "Offline"}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {isPunchedIn
                  ? `Active session started at ${new Date(activePunch.punchIn).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : "Ready to start your work session?"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isPunchedIn
                  ? "Click Punch Out when taking a break or wrapping up for the day."
                  : "Click Punch In below to log your daily attendance and start tracking time."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              {!isPunchedIn ? (
                <button
                  onClick={() => handlePunch("PUNCH_IN")}
                  disabled={actionLoading}
                  className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>🟢</span> {actionLoading ? "Processing..." : "Punch In Now"}
                </button>
              ) : (
                <button
                  onClick={() => handlePunch("PUNCH_OUT")}
                  disabled={actionLoading}
                  className="px-8 py-3.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>🔴</span> {actionLoading ? "Processing..." : "Punch Out Now"}
                </button>
              )}
            </div>
          </div>

          {/* Shift Notes Input */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Session Notes / Work Summary (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Working on client ad banners & analytics review..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
            />
          </div>

          {message && (
            <div
              className={`mt-4 p-3 rounded-xl text-sm font-medium ${
                message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Today's Status</div>
            <div className="mt-2 text-2xl font-extrabold text-gray-900">
              {isPunchedIn ? (
                <span className="text-emerald-600">Online</span>
              ) : (
                <span className="text-gray-500">Offline</span>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {activePunch ? `Punched in at ${new Date(activePunch.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "No active session"}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Work Logged</div>
            <div className="mt-2 text-2xl font-extrabold text-gray-900">
              {totalHoursWorked} <span className="text-sm font-normal text-gray-500">hrs</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">Across all recorded sessions</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Attendance Sessions</div>
            <div className="mt-2 text-2xl font-extrabold text-gray-900">{totalPunchDays}</div>
            <div className="text-xs text-gray-400 mt-1">Total recorded logs</div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">My Punch In & Punch Out History</h3>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading attendance history...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Punch In Time</th>
                  <th className="px-6 py-4">Punch Out Time</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendances.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      You have no recorded punch history yet. Punch in above to log your first session!
                    </td>
                  </tr>
                ) : (
                  attendances.map((att) => {
                    const pInDate = new Date(att.punchIn);
                    const pOutDate = att.punchOut ? new Date(att.punchOut) : null;
                    const mins = att.totalMinutes || 0;
                    const hrs = Math.floor(mins / 60);
                    const remMins = mins % 60;
                    const durationStr = att.punchOut
                      ? `${hrs > 0 ? `${hrs}h ` : ""}${remMins}m`
                      : "In Progress";

                    return (
                      <tr key={att.id} className="hover:bg-gray-50 transition-colors text-sm">
                        <td className="px-6 py-4 font-semibold text-gray-800">
                          {new Date(att.date || att.punchIn).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-emerald-700 font-medium">
                          {pInDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-medium">
                          {pOutDate
                            ? pOutDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                            : "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-800 font-medium">{durationStr}</td>
                        <td className="px-6 py-4">
                          {att.status === "PUNCHED_IN" ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Online
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                              Offline
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs max-w-xs truncate">
                          {att.notes || "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
