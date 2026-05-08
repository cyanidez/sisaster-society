"use client";

import { useState, useTransition } from "react";
import { redeemReward } from "@/app/actions/redeem";
import {
  Star, Gift, Package, Clock, CheckCircle2, XCircle,
  Loader2, AlertCircle, X, History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  type: string;
  icon: string;
  points_required: number;
  stock: number | null;
  is_limited: boolean;
}

interface Redemption {
  id: string;
  reward_id: string;
  points_spent: number;
  status: string;
  created_at: string;
  updated_at: string | null;
  rewards: { title: string; icon: string }[] | { title: string; icon: string } | null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("th-TH", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "รอดำเนินการ", color: "bg-amber-50 text-amber-700 border-amber-200",  bg: "bg-amber-50" },
  approved:  { label: "อนุมัติแล้ว",  color: "bg-blue-50 text-blue-700 border-blue-200",    bg: "bg-blue-50" },
  rejected:  { label: "ไม่อนุมัติ",   color: "bg-red-50 text-red-700 border-red-200",       bg: "bg-red-50" },
  completed: { label: "สำเร็จ",       color: "bg-green-50 text-green-700 border-green-200", bg: "bg-green-50" },
};

// ---- Modal: ประวัติการหัก Point ----
function PointLogModal({
  redemptions,
  onClose,
}: {
  redemptions: Redemption[];
  onClose: () => void;
}) {
  const rows = redemptions.flatMap((r) => {
    const rw = Array.isArray(r.rewards) ? r.rewards[0] : r.rewards;
    const title = rw?.title ?? "ของรางวัล";
    const icon = rw?.icon ?? "🎁";
    const entries = [];

    entries.push({ key: `${r.id}-req`, icon, label: `ส่งคำขอ · ${title}`, date: r.created_at, pts: -r.points_spent, ptColor: "text-red-500" });

    if (r.status === "rejected") {
      entries.push({ key: `${r.id}-ref`, icon, label: `คืน Point · ${title}`, date: r.updated_at ?? r.created_at, pts: r.points_spent, ptColor: "text-green-600" });
    } else if (r.status === "approved" || r.status === "completed") {
      entries.push({ key: `${r.id}-appr`, icon, label: `${statusConfig[r.status].label} · ${title}`, date: r.updated_at ?? r.created_at, pts: null, ptColor: "" });
    }

    return entries;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <History size={16} className="text-pink-500" />
            ประวัติการหัก Point
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-50">
          {rows.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">ยังไม่มีรายการ</p>
          ) : (
            rows.map((row) => (
              <div key={row.key} className="flex items-center gap-3 px-5 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-base">
                  {row.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{row.label}</p>
                  <p className="text-xs text-gray-400">{formatDate(row.date)}</p>
                </div>
                {row.pts !== null && (
                  <span className={`text-sm font-bold tabular-nums shrink-0 ${row.ptColor}`}>
                    {row.pts > 0 ? "+" : ""}{row.pts.toLocaleString()} pt
                  </span>
                )}
              </div>
            ))
          )}
        </div>
        <div className="px-5 py-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-gray-200 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Redeem button ----
function RedeemButton({ reward, canAfford }: { reward: Reward; canAfford: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleRedeem = () => {
    if (!confirmed) { setConfirmed(true); return; }
    startTransition(async () => {
      const res = await redeemReward(reward.id);
      setResult(res);
      setConfirmed(false);
    });
  };

  if (result?.success) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
        <CheckCircle2 size={15} />
        ส่งคำขอแล้ว
      </div>
    );
  }

  if (result?.error) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle size={13} />
          {result.error}
        </div>
        <button onClick={() => setResult(null)} className="text-xs text-gray-500 underline">
          ลองใหม่
        </button>
      </div>
    );
  }

  if (!canAfford) {
    return <span className="text-xs text-gray-400">L-Point ไม่เพียงพอ</span>;
  }

  return (
    <div className="flex items-center gap-2">
      {confirmed && (
        <button onClick={() => setConfirmed(false)} className="text-xs text-gray-500 hover:text-gray-700">
          ยกเลิก
        </button>
      )}
      <button
        onClick={handleRedeem}
        disabled={isPending}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
          confirmed
            ? "bg-pink-600 text-white hover:bg-pink-700"
            : "border border-pink-300 text-pink-600 hover:bg-pink-50"
        }`}
      >
        {isPending && <Loader2 size={13} className="animate-spin" />}
        {confirmed ? "ยืนยัน Redeem" : "Redeem"}
      </button>
    </div>
  );
}

// ---- Main ----
export default function RedeemClient({
  totalPoints,
  rewards,
  myRedemptions,
}: {
  totalPoints: number;
  rewards: Reward[];
  myRedemptions: Redemption[];
}) {
  const [tab, setTab] = useState<"rewards" | "history">("rewards");
  const [showPointLog, setShowPointLog] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 text-white">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <h1 className="text-2xl font-black mb-1 flex items-center gap-2">
            <Gift size={24} />
            Redeem ของรางวัล
          </h1>
          <p className="text-purple-200 text-sm">แลก L-Point เพื่อรับของรางวัลพิเศษ</p>

          <div className="mt-5 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/20">
            <Star size={16} className="text-yellow-300 fill-yellow-300" />
            <span className="text-xl font-black tabular-nums">{totalPoints.toLocaleString()}</span>
            <span className="text-purple-200 text-sm">L-Point</span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-gray-200 bg-white sticky top-16 z-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 flex gap-0">
          {[
            { key: "rewards", label: "ของรางวัล", icon: Gift },
            { key: "history", label: "ประวัติการ Redeem", icon: Clock },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as "rewards" | "history")}
              className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? "border-pink-500 text-pink-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={15} />
              {label}
              {key === "history" && myRedemptions.length > 0 && (
                <span className="ml-1 rounded-full bg-pink-100 px-1.5 py-0.5 text-[10px] font-bold text-pink-600">
                  {myRedemptions.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Rewards tab */}
        {tab === "rewards" ? (
          rewards.length === 0 ? (
            <div className="text-center py-20">
              <Package size={48} className="mx-auto mb-3 text-gray-200" />
              <p className="text-gray-400">ยังไม่มีของรางวัลในขณะนี้</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {rewards.map((reward) => {
                const canAfford = totalPoints >= reward.points_required;
                const outOfStock = reward.is_limited && reward.stock !== null && reward.stock <= 0;
                return (
                  <Card
                    key={reward.id}
                    className={`transition-all ${outOfStock ? "opacity-50" : canAfford ? "ring-1 ring-pink-200" : ""}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-2xl">
                          {reward.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{reward.title}</h3>
                          {reward.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{reward.description}</p>
                          )}
                          <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`inline-flex items-center gap-1 text-sm font-black ${canAfford ? "text-pink-600" : "text-gray-400"}`}>
                                <Star size={13} className={canAfford ? "fill-pink-500 text-pink-500" : "text-gray-300"} />
                                {reward.points_required.toLocaleString()}
                              </span>
                              {reward.is_limited && reward.stock !== null && (
                                <span className="text-[10px] text-gray-400">
                                  {outOfStock ? "หมดแล้ว" : `เหลือ ${reward.stock}`}
                                </span>
                              )}
                            </div>
                            {outOfStock ? (
                              <span className="text-xs text-gray-400">หมดแล้ว</span>
                            ) : (
                              <RedeemButton reward={reward} canAfford={canAfford} />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )
        ) : (
          /* History tab */
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock size={16} className="text-pink-500" />
                  ประวัติการ Redeem
                </CardTitle>
                {myRedemptions.length > 0 && (
                  <button
                    onClick={() => setShowPointLog(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                  >
                    <History size={13} />
                    ประวัติการหัก Point
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {myRedemptions.length === 0 ? (
                <div className="text-center py-12">
                  <Gift size={40} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-gray-400 text-sm">ยังไม่มีประวัติการ Redeem</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {myRedemptions.map((r) => {
                    const rw = Array.isArray(r.rewards) ? r.rewards[0] : r.rewards;
                    const sc = statusConfig[r.status] ?? { label: r.status, color: "bg-gray-50 text-gray-500 border-gray-200", bg: "bg-gray-50" };
                    const isRejected = r.status === "rejected";
                    return (
                      <div key={r.id} className="flex items-center gap-3 py-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-xl">
                          {rw?.icon ?? "🎁"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {rw?.title ?? "ของรางวัล"}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(r.created_at)}
                            {isRejected && r.updated_at && ` · คืน Point ${formatDate(r.updated_at)}`}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="text-sm font-bold tabular-nums text-gray-500">
                            -{r.points_spent.toLocaleString()} pt
                          </span>
                          <Badge variant="outline" className={`text-[10px] ${sc.color}`}>
                            {isRejected ? "ไม่อนุมัติ · คืนแล้ว" : sc.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {showPointLog && (
        <PointLogModal redemptions={myRedemptions} onClose={() => setShowPointLog(false)} />
      )}
    </div>
  );
}
