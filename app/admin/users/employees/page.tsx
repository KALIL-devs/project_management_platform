"use client";

import UserManagementView from "@/components/admin/UserManagementView";

export default function EmployeesPage() {
  return (
    <UserManagementView
      title="Team Members & Employees"
      description="Monitor live employee punch statuses, review attendance logs, and assign project tasks."
      filterRole="EMPLOYEE"
      showAttendanceStatus
    />
  );
}