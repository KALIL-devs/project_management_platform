"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import { ATTENDANCE_STATUS_MAP } from "@/lib/constants";

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE" | "CLIENT";
  createdAt: string;
};

type Attendance = {
  id: string;
  userId: string;
  status: "PUNCHED_IN" | "PUNCHED_OUT" | "ABSENT";
  punchIn: string;
  punchOut?: string;
};

type UserManagementViewProps = {
  title: string;
  description: string;
  filterRole?: "CLIENT" | "EMPLOYEE";
  showAttendanceStatus?: boolean;
};

export default function UserManagementView({
  title,
  description,
  filterRole,
  showAttendanceStatus = false,
}: UserManagementViewProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CLIENT" | "EMPLOYEE">(filterRole || "CLIENT");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function fetchData() {
    try {
      const fetches = [fetch("/api/users")];
      if (showAttendanceStatus) {
        fetches.push(fetch("/api/attendance"));
      }

      const responses = await Promise.all(fetches);
      const usersData = await responses[0].json();

      if (Array.isArray(usersData)) {
        setUsers(
          filterRole
            ? usersData.filter((u: User) => u.role === filterRole)
            : usersData
        );
      }

      if (showAttendanceStatus && responses[1]) {
        const attData = await responses[1].json();
        if (Array.isArray(attData)) {
          setAttendances(attData);
        }
      }
    } catch (err) {
      console.error("Failed to load user data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [filterRole]);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setName("");
      setEmail("");
      setPassword("");
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function getPunchStatus(employeeId: string) {
    const userAtts = attendances.filter((a) => a.userId === employeeId);
    if (userAtts.length === 0) return ATTENDANCE_STATUS_MAP.PUNCHED_OUT;

    const latest = userAtts[0];
    return ATTENDANCE_STATUS_MAP[latest.status] || ATTENDANCE_STATUS_MAP.PUNCHED_OUT;
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          + Add {filterRole ? (filterRole === "EMPLOYEE" ? "Employee" : "Client") : "User"}
        </Button>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Create New ${filterRole ? (filterRole === "EMPLOYEE" ? "Employee" : "Client") : "User"}`}
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Set password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {!filterRole && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 tracking-wide">
                Role Assignment
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="CLIENT">Client</option>
                <option value="EMPLOYEE">Employee</option>
              </select>
            </div>
          )}

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Table Content */}
      {loading ? (
        <Card padding="none">
          <LoadingState message="Loading user directory..." />
        </Card>
      ) : users.length === 0 ? (
        <EmptyState
          icon="👥"
          title={`No ${filterRole ? filterRole.toLowerCase() + "s" : "users"} found`}
          description="Click the button above to add your first user record."
          actionLabel={`+ Add ${filterRole ? (filterRole === "EMPLOYEE" ? "Employee" : "Client") : "User"}`}
          onAction={() => setShowModal(true)}
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  {!filterRole && <th className="px-6 py-4">Role</th>}
                  {showAttendanceStatus && <th className="px-6 py-4">Attendance Status</th>}
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((user) => {
                  const initials = user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  const status = showAttendanceStatus && user.role === "EMPLOYEE" ? getPunchStatus(user.id) : null;

                  return (
                    <tr
                      key={user.id}
                      onClick={() => {
                        if (user.role === "EMPLOYEE") router.push(`/admin/users/employees/${user.id}`);
                        else if (user.role === "CLIENT") router.push(`/admin/roadmaps/${user.id}`);
                      }}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {user.name}
                            </div>
                            <div className="text-xs text-slate-400">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {!filterRole && (
                        <td className="px-6 py-4">
                          <Badge type="role" value={user.role} />
                        </td>
                      )}

                      {showAttendanceStatus && (
                        <td className="px-6 py-4">
                          {status ? (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.bg} ${status.text}`}
                            >
                              <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
                              {status.label}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      )}

                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {user.role === "EMPLOYEE" ? (
                          <Link
                            href={`/admin/users/employees/${user.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-all"
                          >
                            Details →
                          </Link>
                        ) : user.role === "CLIENT" ? (
                          <Link
                            href={`/admin/roadmaps/${user.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-all"
                          >
                            Roadmap →
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
