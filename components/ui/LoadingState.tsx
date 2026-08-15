import React from "react";

type LoadingStateProps = {
  message?: string;
  className?: string;
};

export default function LoadingState({ message = "Loading...", className = "" }: LoadingStateProps) {
  return (
    <div className={`p-12 flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}
