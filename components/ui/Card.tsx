import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
};

export default function Card({
  children,
  className = "",
  padding = "md",
  ...props
}: CardProps) {
  const paddings = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all duration-200 ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}