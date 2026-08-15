"use client";

import UserManagementView from "@/components/admin/UserManagementView";

export default function ClientsPage() {
  return (
    <UserManagementView
      title="Clients Directory"
      description="View and onboard clients, manage client profiles and 90-day roadmaps."
      filterRole="CLIENT"
    />
  );
}