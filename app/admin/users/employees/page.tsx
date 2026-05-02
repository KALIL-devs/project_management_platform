"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchEmployees() {
    const res = await fetch("/api/users");
    const data = await res.json();
    setEmployees(data.filter((u: User) => u.role === "EMPLOYEE"));
  }

  useEffect(() => { fetchEmployees(); }, []);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Employees</h1>
          <p className="text-gray-500 mt-1">Manage your team members.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Employee"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Employee</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input label="Full Name" type="text" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" type="email" placeholder="jane@fixyads.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Password" type="password" placeholder="Set a password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" fullWidth>{loading ? "Creating..." : "Create Employee"}</Button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Joined</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-12 text-gray-400">
                  No employees yet. Add your first employee above.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{emp.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{emp.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(emp.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}