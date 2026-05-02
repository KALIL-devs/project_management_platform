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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CLIENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchUsers() {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
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
    setRole("CLIENT");
    setShowForm(false);
    fetchUsers();
    setLoading(false);
  }

  const roleColors: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-700",
    EMPLOYEE: "bg-blue-100 text-blue-700",
    CLIENT: "bg-green-100 text-green-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-500 mt-1">Manage clients and employees.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add User"}
        </Button>
      </div>

      {/* Create User Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New User</h2>
          <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Set a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CLIENT">Client</option>
                <option value="EMPLOYEE">Employee</option>
              </select>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" fullWidth>
              {loading ? "Creating..." : "Create User"}
            </Button>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400">
                  No users yet. Add your first user above.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
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