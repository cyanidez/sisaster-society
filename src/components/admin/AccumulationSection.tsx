"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Zap, History, X, Loader2 } from "lucide-react";
import { getAccumulationLogs } from "@/app/actions/admin-points";

interface Event {
  id: string;
  title: string;
  icon: string;
  points: number;
  multiplier: number;
  is_accumulation: boolean;
  condition_label: string | null;
  condition_value: number | null;
  condition_unit: string | null;
}

interface Accumulation {
  event_id: string;
  accumulated_amount: number;
  milestones_earned: number;
}

interface LogEntry {
  id: string;
  amount: number;
  created_at: string;
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryModal({
  event,
  userId,
  onClose,
}: {
  event: Event;
  userId: string;
  onClose: () => void;
}) {
  const [logs, setLogs] = useState<LogEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAccumulationLogs(userId, event.id).then((res) => {
      if (res.error) setError(res.error);
      else setLogs(res.data ?? []);
      setLoading(false);
    });
  }, [userId, event.id]);

  const unit = event.condition_unit ?? "";
  const threshold = event.condition_value ?? 0;
  const pointsPerMilestone = Math.round(event.points * event.multiplier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{event.icon}</span>
            <div>
              <h2 className="font-semibold text-white text-sm">{event.title}</h2>
              <p className="text-xs text-gray-300">
                {event.condition_label && `${event.condition_label} · `}
                ทุก {threshold.toLocaleString()} {unit} = {pointsPerMilestone.toLocaleString()} L-Point
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {loading && (
            <div className="flex items-center justify-center py-10 text-gray-300">
              <Loader2 size={18} className="animate-spin mr-2" />
              <span className="text-sm">กำลังโหลด...</span>
            </div>
          )}
          {error && (
            <p className="text-sm text-red-400 text-center py-10">{error}</p>
          )}
          {!loading && !error && logs?.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <History size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">ยังไม่มีประวัติ</p>
            </div>
          )}
          {!loading && !error && logs && logs.length > 0 && (
            <div className="space-y-1">
              {logs.map((log, i) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs tabular-nums text-gray-400 w-5 text-right shrink-0">
                      {logs.length - i}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">
                        +{log.amount.toLocaleString()} {unit}
                      </p>
                      <p className="text-xs text-gray-400">{formatDateTime(log.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Running total */}
              <div className="mt-3 border-t border-gray-800 pt-3 flex items-center justify-between text-xs text-gray-300 px-3">
                <span>รวมทั้งหมด</span>
                <span className="font-semibold text-white">
                  {logs.reduce((s, l) => s + l.amount, 0).toLocaleString()} {unit}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AccumulationRow({
  event,
  acc,
  userId,
}: {
  event: Event;
  acc: Accumulation | undefined;
  userId: string;
}) {
  const [showHistory, setShowHistory] = useState(false);

  const threshold = event.condition_value ?? 0;
  const unit = event.condition_unit ?? "";
  const totalAmount = acc?.accumulated_amount ?? 0;
  const milestones = acc?.milestones_earned ?? 0;
  const pointsPerMilestone = Math.round(event.points * event.multiplier);

  const cycleAmount = threshold > 0 ? totalAmount % threshold : 0;
  const remaining = threshold - cycleAmount;
  const progressPct = threshold > 0 ? (cycleAmount / threshold) * 100 : 0;
  const totalEarned = milestones * pointsPerMilestone;

  return (
    <>
      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl shrink-0">{event.icon}</span>
            <div className="min-w-0">
              <p className="font-medium text-white text-sm truncate">{event.title}</p>
              <p className="text-xs text-gray-300 mt-0.5">
                {event.condition_label && <span>{event.condition_label} </span>}
                <span className="font-semibold text-gray-300">
                  {threshold.toLocaleString()} {unit}
                </span>
                {" "}= {pointsPerMilestone.toLocaleString()} L-Point
                {event.multiplier > 1 && (
                  <span className="ml-1 text-amber-400 inline-flex items-center gap-0.5">
                    <Zap size={10} />x{event.multiplier}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {milestones > 0 && (
              <span className="rounded-full bg-pink-950/50 px-2 py-0.5 text-xs font-medium text-pink-400">
                ได้รับแล้ว +{totalEarned.toLocaleString()} L-Point
              </span>
            )}
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1 rounded-lg border border-gray-700 px-2.5 py-1 text-xs text-gray-400 hover:border-gray-600 hover:text-gray-200 transition-colors"
            >
              <History size={11} />
              ประวัติ
            </button>
          </div>
        </div>

        {/* Current cycle progress */}
        {threshold > 0 && (
          <>
            <div className="flex items-end justify-between text-xs">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">รอบนี้</span>
                <div className="font-semibold text-white mt-0.5">
                  {cycleAmount.toLocaleString()}
                  <span className="text-gray-300 font-normal"> / {threshold.toLocaleString()} {unit}</span>
                </div>
              </div>
              {milestones > 0 && (
                <span className="text-gray-400 text-[11px]">รอบที่ {milestones + 1}</span>
              )}
            </div>
            <div className="w-full h-2 rounded-full bg-gray-800">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-300">
              ขาดอีก{" "}
              <span className="text-white font-medium">
                {remaining.toLocaleString()} {unit}
              </span>{" "}
              จะได้ {pointsPerMilestone.toLocaleString()} L-Point อีกครั้ง
            </p>
          </>
        )}
      </div>

      {showHistory && (
        <HistoryModal
          event={event}
          userId={userId}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
}

function CompletedRow({
  event,
  acc,
  userId,
}: {
  event: Event;
  acc: Accumulation;
  userId: string;
}) {
  const [showHistory, setShowHistory] = useState(false);
  const unit = event.condition_unit ?? "";
  const pointsPerMilestone = Math.round(event.points * event.multiplier);
  const totalEarned = acc.milestones_earned * pointsPerMilestone;

  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-800/50 bg-gray-900/30 px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-lg shrink-0">{event.icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-300 truncate">{event.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              ครบ {acc.milestones_earned} รอบ · ได้รับ {totalEarned.toLocaleString()} L-Point
              · รวม {acc.accumulated_amount.toLocaleString()} {unit}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowHistory(true)}
          className="shrink-0 flex items-center gap-1 rounded-lg border border-gray-700 px-2.5 py-1 text-xs text-gray-400 hover:border-gray-600 hover:text-gray-200 transition-colors"
        >
          <History size={11} />
          ประวัติ
        </button>
      </div>
      {showHistory && (
        <HistoryModal event={event} userId={userId} onClose={() => setShowHistory(false)} />
      )}
    </>
  );
}

export default function AccumulationSection({
  userId,
  events,
  accumulations,
}: {
  userId: string;
  events: Event[];
  accumulations: Accumulation[];
}) {
  const accEvents = events.filter((e) => e.is_accumulation && !!e.condition_value);

  const pending = accEvents.filter((e) => {
    const acc = accumulations.find((a) => a.event_id === e.id);
    const current = acc?.accumulated_amount ?? 0;
    return current > 0 && current % e.condition_value! > 0;
  });

  const completed = accEvents.filter((e) => {
    const acc = accumulations.find((a) => a.event_id === e.id);
    const current = acc?.accumulated_amount ?? 0;
    return current > 0 && current % e.condition_value! === 0;
  });

  if (pending.length === 0 && completed.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <TrendingUp size={15} className="text-blue-400" />
        ยอดสะสม
      </h2>

      {pending.length > 0 && (
        <div className="space-y-3">
          {pending.map((event) => (
            <AccumulationRow
              key={event.id}
              event={event}
              acc={accumulations.find((a) => a.event_id === event.id)}
              userId={userId}
            />
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <>
          {pending.length > 0 && (
            <p className="mt-4 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              ครบรอบแล้ว
            </p>
          )}
          <div className="space-y-2">
            {completed.map((event) => (
              <CompletedRow
                key={event.id}
                event={event}
                acc={accumulations.find((a) => a.event_id === event.id)!}
                userId={userId}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
