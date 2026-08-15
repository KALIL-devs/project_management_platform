"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SessionDetailModal, { AttendanceSession } from "@/components/attendance/SessionDetailModal";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority?: string;
  createdAt: string;
  updatedAt?: string;
};

type RoadmapTask = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDay?: number | null;
  createdAt: string;
};

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

type UserDetail = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  assignedTasks: Task[];
  roadmapTasks: RoadmapTask[];
  attendances: Attendance[];
};

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<"attendance" | "tasks" | "settings">("attendance");

  // Selected Session Modal State
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);

  // Edit form state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  async function fetchUserDetail() {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) {
        throw new Error("Failed to load employee details");
      }
      const data = await res.json();
      setUser(data);
      setEditName(data.name || "");
      setEditEmail(data.email || "");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  function handleOpenSessionDetails(session: Attendance) {
    if (!user) return;
    setSelectedSession({
      ...session,
      user: { name: user.name, email: user.email },
    });
    setShowSessionModal(true);
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setEditError("");
    setEditSuccess("");

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          ...(editPassword ? { password: editPassword } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setEditSuccess("Profile updated successfully!");
      setEditPassword("");
      setShowEditModal(false);
      fetchUserDetail();
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm font-medium">Loading employee details...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-6xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700 font-semibold">{error || "Employee not found"}</p>
          <Link
            href="/admin/users/employees"
            className="inline-block mt-4 text-sm text-blue-600 hover:underline font-medium"
          >
            ← Back to Employees
          </Link>
        </div>
      </div>
    );
  }

  // Calculate attendance statistics
  const totalPunchDays = user.attendances.length;
  const totalMinutesWorked = user.attendances.reduce(
    (acc, item) => acc + (item.totalMinutes || 0),
    0
  );
  const totalHoursWorked = (totalMinutesWorked / 60).toFixed(1);

  // Today's attendance record
  const latestAttendance = user.attendances[0];
  const isPunchedIn = latestAttendance?.status === "PUNCHED_IN";

  // Task statistics
  const totalAssignedTasks = user.assignedTasks.length + user.roadmapTasks.length;
  const completedAssignedTasks =
    user.assignedTasks.filter((t) => t.status === "COMPLETED").length +
    user.roadmapTasks.filter((t) => t.status === "COMPLETED").length;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Header & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin/users/employees" className="hover:text-blue-600 transition-colors">
            Employees
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{user.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/users/employees"
              className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 shadow-xs"
              title="Back to Employees"
            >
              ←
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employee Profile</h1>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
          >
            ✏️ Edit Employee
          </button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {user.role}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{user.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Current Punch Status Box */}
        <div className="w-full md:w-auto bg-gray-50/80 border border-gray-200/80 rounded-xl p-4 flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${isPunchedIn ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}></div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Today's Status</div>
            <div className="text-base font-bold text-gray-900 flex items-center gap-2">
              {isPunchedIn ? (
                <span className="text-emerald-700">Online ({new Date(latestAttendance.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
              ) : (
                <span className="text-gray-600">Offline</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Today's Punch Time */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Latest Punch Log</div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">
            {latestAttendance ? (
              <span>
                {new Date(latestAttendance.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            ) : (
              <span className="text-gray-400">No Activity</span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {latestAttendance?.punchOut
              ? `Punched Out at ${new Date(latestAttendance.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : latestAttendance
              ? "Active session in progress"
              : "No punch records recorded"}
          </div>
        </div>

        {/* Card 2: Total Hours & Days */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Work Logged</div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">
            {totalHoursWorked} <span className="text-sm font-normal text-gray-500">hrs</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Across {totalPunchDays} attendance record(s)</div>
        </div>

        {/* Card 3: Tasks Overview */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tasks Completion</div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">
            {completedAssignedTasks} / {totalAssignedTasks}
          </div>
          <div className="text-xs text-gray-500 mt-1">Assigned direct & roadmap tasks</div>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="border-b border-gray-200 flex gap-8 text-sm font-medium">
        <button
          onClick={() => setActiveTab("attendance")}
          className={`pb-4 px-1 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "attendance"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span>⏰</span> Punch & Attendance History ({user.attendances.length})
        </button>

        <button
          onClick={() => setActiveTab("tasks")}
          className={`pb-4 px-1 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "tasks"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span>📋</span> Assigned Tasks ({totalAssignedTasks})
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-4 px-1 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "settings"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span>⚙️</span> Account & Profile Settings
        </button>
      </div>

      {/* Tab 1: Attendance Logs */}
      {activeTab === "attendance" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Punch In / Punch Out Log Details</h3>
              <p className="text-xs text-gray-500 mt-0.5">Click any shift log to inspect detailed session notes & tasks worked on for {user.name}.</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Punch In Time</th>
                <th className="px-6 py-4">Punch Out Time</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Notes / Activity</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {user.attendances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No punch records found for this employee.
                  </td>
                </tr>
              ) : (
                user.attendances.map((att) => {
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
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group text-sm"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-800 group-hover:text-blue-600">
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
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-800 transition-colors">
                          View Details →
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Assigned Tasks */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          {/* Direct Tasks Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Assigned Tasks ({user.assignedTasks.length})</h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Task Title</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {user.assignedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">
                      No direct tasks assigned to this employee.
                    </td>
                  </tr>
                ) : (
                  user.assignedTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors text-sm">
                      <td className="px-6 py-4 font-semibold text-gray-800">{t.title}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{t.description || "—"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          t.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : t.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Roadmap Tasks Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Roadmap Tasks ({user.roadmapTasks.length})</h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Task Title</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {user.roadmapTasks.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-400">
                      No roadmap tasks assigned.
                    </td>
                  </tr>
                ) : (
                  user.roadmapTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors text-sm">
                      <td className="px-6 py-4 font-semibold text-gray-800">{t.title}</td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-600">{t.priority}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          t.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Settings */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Account & Credentials</h3>
          <p className="text-sm text-gray-500 mb-6">Update profile information or set a new password for this employee.</p>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />
            <Input
              label="Reset Password (leave blank to keep current)"
              type="password"
              placeholder="Enter new password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
            />

            {editError && <p className="text-red-500 text-sm font-medium">{editError}</p>}
            {editSuccess && <p className="text-emerald-600 text-sm font-medium">{editSuccess}</p>}

            <Button type="submit" disabled={saving}>
              {saving ? "Saving Changes..." : "Save Account Settings"}
            </Button>
          </form>
        </div>
      )}

      {/* Session Details Floating Modal */}
      <SessionDetailModal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        session={selectedSession}
        relatedTasks={user.assignedTasks}
        relatedRoadmapTasks={user.roadmapTasks}
      />

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Edit Employee Info</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
              <Input
                label="New Password (optional)"
                type="password"
                placeholder="New password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />
              {editError && <p className="text-red-500 text-sm font-medium">{editError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
