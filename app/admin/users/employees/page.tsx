"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type Attendance = {
  id: string;
  userId: string;
  status: "PUNCHED_IN" | "PUNCHED_OUT" | "ABSENT";
  punchIn: string;
  punchOut?: string;
};

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<User[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchEmployees() {
    try {
      const [usersRes, attRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/attendance"),
      ]);
      const usersData = await usersRes.json();
      const attData = await attRes.json();

      if (Array.isArray(usersData)) {
        setEmployees(usersData.filter((u: User) => u.role === "EMPLOYEE"));
      }
      if (Array.isArray(attData)) {
        setAttendances(attData);
      }
    } catch (err) {
      console.error("Error fetching employees data:", err);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role: "EMPLOYEE" }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    setName("");
    setEmail("");
    setPassword("");
    setShowForm(false);
    fetchEmployees();
    setLoading(false);
  }

  // Get punch status for employee
  function getPunchStatus(employeeId: string) {
    const userAtts = attendances.filter((a) => a.userId === employeeId);
    if (userAtts.length === 0) return { label: "Offline", class: "bg-gray-100 text-gray-500 border-gray-200" };

    const latest = userAtts[0]; // ordered by punchIn desc
    if (latest.status === "PUNCHED_IN") {
      return { label: "Online", class: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    return { label: "Offline", class: "bg-gray-100 text-gray-500 border-gray-200" };
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employees</h1>
          <p className="text-gray-500 mt-1">Manage your team members and view their activity details.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Employee"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-8 transition-all">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Employee</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input label="Full Name" type="text" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email" type="email" placeholder="jane@fixyads.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password" placeholder="Set a password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            <Button type="submit" fullWidth disabled={loading}>{loading ? "Creating..." : "Create Employee"}</Button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400">
                  No employees yet. Add your first employee above.
                </td>
              </tr>
            ) : (
              employees.map((emp) => {
                const status = getPunchStatus(emp.id);
                const initials = emp.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <tr
                    key={emp.id}
                    onClick={() => router.push(`/admin/users/employees/${emp.id}`)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                          {initials}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {emp.name}
                          </div>
                          <div className="text-xs text-gray-500">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.class}`}>
                        <span className={`w-2 h-2 rounded-full ${status.label === "Punched In" ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}></span>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(emp.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/admin/users/employees/${emp.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white transition-all shadow-xs"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}