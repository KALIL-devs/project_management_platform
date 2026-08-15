import React from "react";
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS, PRIORITY_COLORS, ROLE_COLORS } from "@/lib/constants";

type BadgeProps = {
  type?: "status" | "priority" | "role" | "custom";
  value: string;
  className?: string;
  customColor?: { bg: string; text: string; border?: string };
};

export default function Badge({ type = "status", value, className = "", customColor }: BadgeProps) {
  let style = { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" };
  let displayLabel = value;

  if (type === "status" && TASK_STATUS_COLORS[value]) {
    style = TASK_STATUS_COLORS[value];
    displayLabel = TASK_STATUS_LABELS[value] || value;
  } else if (type === "priority" && PRIORITY_COLORS[value]) {
    style = PRIORITY_COLORS[value];
  } else if (type === "role" && ROLE_COLORS[value]) {
    style = ROLE_COLORS[value];
  } else if (customColor) {
    style = { ...style, ...customColor };
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border || "border-transparent"} ${className}`}
    >
      {displayLabel}
    </span>
  );
}
