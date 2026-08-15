import React from "react";
import Button from "./Button";

type EmptyStateProps = {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export default function EmptyState({
  icon = "📭",
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div className="text-4xl p-3 bg-slate-50 rounded-2xl border border-slate-100">{icon}</div>
      <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <div className="mt-2">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
}
