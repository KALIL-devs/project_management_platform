"use client";

import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority?: string;
  updatedAt?: string;
  createdAt?: string;
  client?: { name: string } | null;
};

type RoadmapTask = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDay?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AttendanceSession = {
  id: string;
  date: string;
  punchIn: string;
  punchOut?: string | null;
  totalMinutes?: number | null;
  status: "PUNCHED_IN" | "PUNCHED_OUT" | "ABSENT";
  notes?: string | null;
  user?: { name: string; email: string };
};

type SessionDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  session: AttendanceSession | null;
  relatedTasks?: Task[];
  relatedRoadmapTasks?: RoadmapTask[];
};

export default function SessionDetailModal({
  isOpen,
  onClose,
  session,
  relatedTasks = [],
  relatedRoadmapTasks = [],
}: SessionDetailModalProps) {
  if (!session) return null;

  const pInDate = new Date(session.punchIn);
  const pOutDate = session.punchOut ? new Date(session.punchOut) : null;
  const mins = session.totalMinutes || 0;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  const durationStr = session.punchOut
    ? `${hrs > 0 ? `${hrs}h ` : ""}${remMins}m`
    : "In Progress (Active Session)";

  // Strict Shift Boundaries (Exact session window between punchIn and punchOut)
  const shiftStartMs = pInDate.getTime();
  const shiftEndMs = pOutDate ? pOutDate.getTime() : Date.now();

  // Filter tasks created or updated strictly WITHIN this exact shift session range
  const displayDirectTasks = relatedTasks.filter((t) => {
    const updatedMs = t.updatedAt ? new Date(t.updatedAt).getTime() : 0;
    const createdMs = t.createdAt ? new Date(t.createdAt).getTime() : 0;

    const isUpdatedInShift = updatedMs >= shiftStartMs && updatedMs <= shiftEndMs;
    const isCreatedInShift = createdMs >= shiftStartMs && createdMs <= shiftEndMs;

    return isUpdatedInShift || isCreatedInShift;
  });

  const displayRoadmapTasks = relatedRoadmapTasks.filter((t) => {
    const updatedMs = t.updatedAt ? new Date(t.updatedAt).getTime() : 0;
    const createdMs = t.createdAt ? new Date(t.createdAt).getTime() : 0;

    const isUpdatedInShift = updatedMs >= shiftStartMs && updatedMs <= shiftEndMs;
    const isCreatedInShift = createdMs >= shiftStartMs && createdMs <= shiftEndMs;

    return isUpdatedInShift || isCreatedInShift;
  });

  const totalSessionTasks = displayDirectTasks.length + displayRoadmapTasks.length;

  return (
    <Modal isOpen={isOpen} onClose={() => onClose()} title="Work Shift Session Details" maxWidth="lg">
      <div className="space-y-6">
        {/* Session Header Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-extrabold text-slate-900">
                {new Date(session.date || session.punchIn).toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  session.status === "PUNCHED_IN"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {session.status === "PUNCHED_IN" ? "🟢 Active Session" : "🏁 Completed Shift"}
              </span>
            </div>
            {session.user && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Employee: <span className="text-slate-800 font-semibold">{session.user.name}</span> ({session.user.email})
              </p>
            )}
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Duration</span>
            <span className="text-lg font-black text-slate-900">{durationStr}</span>
          </div>
        </div>

        {/* Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/70 rounded-xl">
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Punch In Time</div>
            <div className="text-base font-extrabold text-emerald-900 mt-1">
              {pInDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div className="text-[11px] text-emerald-600 mt-0.5">
              {pInDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Punch Out Time</div>
            <div className="text-base font-extrabold text-slate-900 mt-1">
              {pOutDate
                ? pOutDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                : "Still Active"}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {pOutDate
                ? pOutDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                : "Session in progress"}
            </div>
          </div>
        </div>

        {/* Shift Notes */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Session Activity Notes
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-medium">
            {session.notes ? session.notes : "No custom notes recorded for this shift session."}
          </p>
        </div>

        {/* Tasks Worked On ONLY During THIS Session Window */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>📋</span> Tasks Completed / Worked On Between Punch In & Out
            </h4>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              {totalSessionTasks} task{totalSessionTasks !== 1 ? "s" : ""}
            </span>
          </div>

          {totalSessionTasks === 0 ? (
            <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center bg-slate-50/40">
              <p className="text-sm font-semibold text-slate-700">No tasks modified during this shift session</p>
              <p className="text-xs text-slate-400 mt-1">
                Only tasks created or updated between {pInDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} and {pOutDate ? pOutDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "now"} will be listed here.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {displayDirectTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900">{t.title}</span>
                      <Badge type="status" value={t.status} />
                      {t.priority && <Badge type="priority" value={t.priority} />}
                    </div>
                    {t.client && (
                      <p className="text-[11px] text-slate-400 mt-0.5">🤝 Client: {t.client.name}</p>
                    )}
                  </div>
                </div>
              ))}

              {displayRoadmapTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-indigo-50/40 border border-indigo-200/60 rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900">{t.title}</span>
                      <Badge type="status" value={t.status} />
                      <Badge type="priority" value={t.priority} />
                    </div>
                    <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">🗺️ Roadmap Milestone</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Close */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="secondary" onClick={() => onClose()}>
            Close Details
          </Button>
        </div>
      </div>
    </Modal>
  );
}
