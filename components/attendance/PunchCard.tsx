"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type ActivePunch = {
  id: string;
  punchIn: string;
  notes?: string | null;
} | null;

type PunchCardProps = {
  activePunch: ActivePunch;
  onPunchSuccess?: () => void;
};

export default function PunchCard({ activePunch, onPunchSuccess }: PunchCardProps) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const isPunchedIn = !!activePunch;

  async function handlePunchAction(action: "PUNCH_IN" | "PUNCH_OUT") {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Punch action failed");

      setMessage({
        text: action === "PUNCH_IN" ? "✅ Successfully Punched In!" : "✅ Successfully Punched Out!",
        type: "success",
      });
      setNotes("");
      onPunchSuccess?.();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to record punch", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${
                isPunchedIn
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isPunchedIn ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              ></span>
              {isPunchedIn ? "Online Session Active" : "Offline"}
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isPunchedIn && activePunch
              ? `Active punch-in logged at ${new Date(activePunch.punchIn).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "Track your working hours for today"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isPunchedIn
              ? "Click Punch Out when taking a break or wrapping up your shift."
              : "Click Punch In below to log your daily attendance and start tracking session time."}
          </p>
        </div>

        <div className="w-full md:w-auto flex gap-3">
          {!isPunchedIn ? (
            <Button
              variant="primary"
              size="lg"
              isLoading={loading}
              onClick={() => handlePunchAction("PUNCH_IN")}
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
            >
              <span>🟢</span> Punch In
            </Button>
          ) : (
            <Button
              variant="danger"
              size="lg"
              isLoading={loading}
              onClick={() => handlePunchAction("PUNCH_OUT")}
              className="w-full md:w-auto"
            >
              <span>🔴</span> Punch Out
            </Button>
          )}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Session Notes / Shift Activity (Optional)
        </label>
        <input
          type="text"
          placeholder="e.g. Working on client SEO campaign & task deliverables..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
        />
      </div>

      {message && (
        <div
          className={`mt-3 p-3 rounded-xl text-xs font-semibold ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {message.text}
        </div>
      )}
    </Card>
  );
}
