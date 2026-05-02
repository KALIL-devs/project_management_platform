import Link from "next/link";

export default function AdminPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, Admin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/messages">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
            <p className="text-3xl mb-3">📨</p>
            <p className="text-lg font-semibold text-gray-800">Messages</p>
            <p className="text-sm text-gray-500 mt-1">View contact form submissions</p>
          </div>
        </Link>

        <Link href="/admin/users">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
            <p className="text-3xl mb-3">👥</p>
            <p className="text-lg font-semibold text-gray-800">Users</p>
            <p className="text-sm text-gray-500 mt-1">Manage clients and employees</p>
          </div>
        </Link>

        <Link href="/admin/tasks">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
            <p className="text-3xl mb-3">✅</p>
            <p className="text-lg font-semibold text-gray-800">Tasks</p>
            <p className="text-sm text-gray-500 mt-1">Create and assign tasks</p>
          </div>
        </Link>
      </div>
    </div>
  );
}