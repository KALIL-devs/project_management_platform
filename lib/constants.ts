export const TASK_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  IN_PROGRESS: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  COMPLETED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  BLOCKED: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  BLOCKED: "Blocked",
};

export const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  LOW: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
  MEDIUM: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  HIGH: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  URGENT: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

export const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ADMIN: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  EMPLOYEE: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  CLIENT: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
};

export const ATTENDANCE_STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  PUNCHED_IN: { label: "Online", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500 animate-pulse" },
  PUNCHED_OUT: { label: "Offline", bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  ABSENT: { label: "Absent", bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};
