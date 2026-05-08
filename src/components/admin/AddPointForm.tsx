"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { recordEventParticipation, recordDonation } from "@/app/actions/admin-points";
import { Loader2, CheckCircle2, AlertCircle, Info, Zap, TrendingUp, Star } from "lucide-react";

interface Event {
  id: string;
  title: string;
  icon: string | null;
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

interface Props {
  userId: string;
  categories: { id: string; name: string; name_th: string; icon: string | null }[];
  events: Event[];
  accumulations: Accumulation[];
}

export default function AddPointForm({ userId, events, accumulations }: Props) {
  const [participationState, participationAction, participationPending] = useActionState(recordEventParticipation, null);
  const [donationState, donationAction, donationPending] = useActionState(recordDonation, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [donationAmount, setDonationAmount] = useState("");
  const [entryAmount, setEntryAmount] = useState("");

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;
  const isAccumulation = selectedEvent?.is_accumulation ?? false;
  const multiplier = selectedEvent?.multiplier ?? 1;
  const threshold = selectedEvent?.condition_value ?? 0;

  // Non-accumulation with key condition
  const hasCondition = !isAccumulation && threshold > 0;
  const entryVal = parseFloat(entryAmount) || 0;
  const conditionMet = !hasCondition || entryVal >= threshold;

  // Accumulation progress
  const currentAcc = accumulations.find((a) => a.event_id === selectedEventId);
  const currentAmount = currentAcc?.accumulated_amount ?? 0;
  const currentMilestones = currentAcc?.milestones_earned ?? 0;
  const newTotal = currentAmount + (parseFloat(donationAmount) || 0);
  const newMilestones = threshold > 0 ? Math.floor(newTotal / threshold) : 0;
  const pointsToEarn = Math.round((newMilestones - currentMilestones) * (selectedEvent?.points ?? 1) * multiplier);
  const nextMilestoneAt = threshold > 0 ? (currentMilestones + 1) * threshold : 0;
  const remaining = Math.max(0, nextMilestoneAt - currentAmount);
  const progressPct = threshold > 0 ? Math.min(100, ((currentAmount % threshold) / threshold) * 100) : 0;

  // Non-accumulation preview
  const previewPoints = selectedEvent && !isAccumulation && conditionMet
    ? Math.round(selectedEvent.points * multiplier)
    : null;

  const success = participationState?.success || donationState?.success;
  const error = participationState?.error || donationState?.error;
  const pending = participationPending || donationPending;
  const pointsEarned =
    (participationState as { pointsEarned?: number } | null)?.pointsEarned ??
    (donationState as { pointsEarned?: number } | null)?.pointsEarned;

  useEffect(() => {
    if (success) {
      formRef.current?.reset();
      setSelectedEventId("");
      setDonationAmount("");
      setEntryAmount("");
    }
  }, [success]);

  useEffect(() => {
    setDonationAmount("");
    setEntryAmount("");
  }, [selectedEventId]);

  return (
    <form ref={formRef} action={isAccumulation ? donationAction : participationAction} className="space-y-4">
      <input type="hidden" name="user_id" value={userId} />
      {selectedEventId && <input type="hidden" name="event_id" value={selectedEventId} />}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-800/60 bg-red-950/40 px-3.5 py-2.5">
          <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-800/60 bg-green-950/40 px-3.5 py-2.5">
          <CheckCircle2 size={14} className="text-green-400 shrink-0" />
          <p className="text-sm text-green-300">
            บันทึกสำเร็จ
            {pointsEarned != null && pointsEarned > 0 && ` · +${pointsEarned.toLocaleString()} L-Point`}
            {pointsEarned === 0 && " · ยังไม่ครบ threshold"}
          </p>
        </div>
      )}

      {/* Event selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          ทำ Event อะไรมา
        </label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500/40"
          required
        >
          <option value="">— เลือก Event —</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.icon} {ev.title}
              {ev.is_accumulation ? " · สะสม" : ev.multiplier > 1 ? ` · ⚡x${ev.multiplier}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Key Condition */}
      {selectedEvent && (selectedEvent.condition_label || selectedEvent.condition_value != null) && (
        <div className="flex items-start gap-2.5 rounded-lg border border-pink-800/40 bg-pink-950/20 px-3.5 py-2.5">
          <Info size={14} className="text-pink-400 shrink-0 mt-0.5" />
          <div className="text-xs text-pink-300">
            <p className="font-semibold text-pink-200 mb-0.5">Key Condition</p>
            <p>
              {selectedEvent.condition_label}
              {selectedEvent.condition_value != null && (
                <span className="font-bold text-white mx-1">
                  {selectedEvent.condition_value.toLocaleString()}
                  {selectedEvent.condition_unit ? ` ${selectedEvent.condition_unit}` : ""}
                </span>
              )}
              = {selectedEvent.points} L-Point
            </p>
          </div>
        </div>
      )}

      {/* ACCUMULATION MODE */}
      {isAccumulation && selectedEvent && (
        <>
          {threshold > 0 && (
            <div className="rounded-lg border border-blue-800/40 bg-blue-950/20 px-3.5 py-3 space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp size={13} className="text-blue-400 shrink-0" />
                <p className="text-xs font-semibold text-blue-300">ยอดสะสมปัจจุบัน</p>
              </div>
              <div className="flex items-end justify-between text-xs">
                <span className="text-white font-bold text-sm">
                  {currentAmount.toLocaleString()} {selectedEvent.condition_unit}
                </span>
                <span className="text-gray-300">เป้า {nextMilestoneAt.toLocaleString()} {selectedEvent.condition_unit}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-800">
                <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="text-xs text-gray-300">
                ขาดอีก <span className="text-white font-medium">{remaining.toLocaleString()} {selectedEvent.condition_unit}</span> จะได้ {selectedEvent.points} L-Point (ครั้งที่ {currentMilestones + 1})
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {selectedEvent.condition_label ?? "จำนวน"} ({selectedEvent.condition_unit ?? "บาท"})
            </label>
            <input
              name="donation_amount"
              type="number"
              min="0.01"
              step="any"
              required
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              placeholder={`เช่น ${selectedEvent.condition_value ?? 100}`}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40"
            />
          </div>

          {parseFloat(donationAmount) > 0 && threshold > 0 && (
            <div className="rounded-lg border border-blue-700/40 bg-blue-950/25 px-3.5 py-2.5 text-xs space-y-1">
              <p className="text-blue-300">
                สะสมใหม่: <span className="font-bold text-white">{newTotal.toLocaleString()} {selectedEvent.condition_unit}</span>
              </p>
              {pointsToEarn > 0 ? (
                <p className="text-green-300 font-semibold">
                  🎉 ครบ {newMilestones} ครั้ง → ได้รับ{" "}
                  <span className="text-white text-sm">{pointsToEarn.toLocaleString()} L-Point</span>
                  {multiplier > 1 && <span className="text-amber-400 ml-1">(⚡x{multiplier})</span>}
                </p>
              ) : (
                <p className="text-gray-300">
                  ยังไม่ครบ · ขาดอีก {Math.max(0, nextMilestoneAt - newTotal).toLocaleString()} {selectedEvent.condition_unit}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* NON-ACCUMULATION with key condition: amount input */}
      {!isAccumulation && selectedEvent && hasCondition && (
        <>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {selectedEvent.condition_label ?? "จำนวน"} ({selectedEvent.condition_unit ?? "บาท"})
            </label>
            <input
              name="entry_amount"
              type="number"
              min="0.01"
              step="any"
              required
              value={entryAmount}
              onChange={(e) => setEntryAmount(e.target.value)}
              placeholder={`ต้องอย่างน้อย ${threshold.toLocaleString()} ${selectedEvent.condition_unit ?? ""}`}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500/40"
            />
          </div>

          {entryVal > 0 && (
            <div className={`rounded-lg border px-3.5 py-2.5 text-xs ${
              conditionMet
                ? "border-green-800/40 bg-green-950/20"
                : "border-gray-700 bg-gray-800/40"
            }`}>
              {conditionMet ? (
                <p className="text-green-300 font-semibold">
                  ✓ ถึง Key Condition → ได้รับ{" "}
                  <span className="text-white text-sm">{previewPoints?.toLocaleString()} L-Point</span>
                  {multiplier > 1 && <span className="text-amber-400 ml-1">(⚡x{multiplier})</span>}
                </p>
              ) : (
                <p className="text-gray-300">
                  ยังไม่ถึง Key Condition · จะได้ 0 L-Point
                  <span className="text-gray-400 ml-1">
                    (ขาดอีก {(threshold - entryVal).toLocaleString()} {selectedEvent.condition_unit})
                  </span>
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* NON-ACCUMULATION without condition: preview points */}
      {!isAccumulation && selectedEvent && !hasCondition && (
        <div className="flex items-center gap-2.5 rounded-lg border border-gray-700 bg-gray-800/50 px-3.5 py-2.5">
          <Star size={14} className="text-pink-400 shrink-0 fill-pink-400" />
          <div className="text-xs text-gray-300 flex items-center gap-1.5 flex-wrap">
            <span>จะได้รับ</span>
            <span className="font-bold text-white text-sm">{previewPoints?.toLocaleString()} L-Point</span>
            {multiplier > 1 && (
              <span className="flex items-center gap-1 text-amber-400">
                <Zap size={11} /> Booster x{multiplier} แอคทีฟ
              </span>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={pending || !selectedEventId || (hasCondition && entryVal === 0)}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 py-2.5 text-sm font-semibold text-white transition hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending && <Loader2 size={14} className="animate-spin" />}
        {!selectedEventId
          ? "เลือก Event ก่อน"
          : isAccumulation
          ? pointsToEarn > 0
            ? `บันทึก · +${pointsToEarn.toLocaleString()} L-Point`
            : "บันทึกยอดสะสม"
          : hasCondition
          ? conditionMet
            ? `บันทึก · +${previewPoints?.toLocaleString()} L-Point`
            : "บันทึก · ไม่ได้ L-Point"
          : `บันทึก · +${previewPoints?.toLocaleString()} L-Point`}
      </button>
    </form>
  );
}
