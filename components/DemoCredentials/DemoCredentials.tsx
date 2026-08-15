"use client";

import React, { useState } from "react";

type DemoCredentialsProps = {
  onSelectAccount?: (email: string, pass: string) => void;
};

export default function DemoCredentials({ onSelectAccount }: DemoCredentialsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const accounts = [
    { role: "ADMIN", name: "Admin User", email: "admin@portal.com", pass: "admin123", icon: "👑" },
    { role: "EMPLOYEE", name: "Employee User", email: "emp@portal.com", pass: "emp123", icon: "👨‍💼" },
    { role: "CLIENT", name: "Client User", email: "client@portal.com", pass: "client123", icon: "🤝" },
  ];

  return (
    <div className="w-full bg-slate-100/80 border border-slate-200 rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔑</span>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Demo Accounts</h3>
            <p className="text-xs text-slate-500">Click any account below to quick-fill credentials</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isOpen ? "Hide" : "Show"}
        </button>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-slate-200/80">
          {accounts.map((acc) => (
            <button
              key={acc.role}
              type="button"
              onClick={() => onSelectAccount?.(acc.email, acc.pass)}
              className="p-2.5 bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {acc.icon} {acc.role}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Fill ↵</span>
              </div>
              <p className="text-xs text-slate-600 font-medium truncate">{acc.email}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Pass: {acc.pass}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
