"use client";

import UserManagementView from "@/components/admin/UserManagementView";

export default function UsersPage() {
  return (
    <UserManagementView
      title="All Users"
      description="Manage all agency clients, employees, and administrative team members."
    />
  );
}