"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteReward, toggleRewardActive, updateRedemptionStatus } from "@/app/actions/admin-rewards";
import { Gift, Plus, SquarePen, Trash2, Star, Clock, CheckCircle2, XCircle, PackageCheck } from "lucide-react";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  type: string;
  icon: string;
  points_required: number;
  stock: number | null;
  is_active: boolean;
  is_limited: boolean;
  created_at: string;
}

interface Redemption {
  id: string;
  status: string;
  points_spent: number;
  admin_notes: string | null;
  created_at: string;
  members: { username: string; display_name: string | null } | null;
  rewards: { title: string; icon: string } | null;
}

const TYPE_LABEL: Record<string, string> = {
  ticket: "🎫 บัตร/สิทธิ์",
  merchandise: "📦 Merch",
  limited: "⭐ Limited",
  other: "🎁 อื่นๆ",
};

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  pending:   { label: "รอดำเนินการ", cls: "bg-yellow-950/50 text-yellow-400",  icon: Clock },
  approved:  { label: "อนุมัติแล้ว",  cls: "bg-blue-950/50 text-blue-400",    icon: CheckCircle2 },
  completed: { label: "เสร็จสิ้น",    cls: "bg-green-950/50 text-green-400",  icon: PackageCheck },
  rejected:  { label: "ปฏิเสธ",       cls: "bg-red-950/50 text-red-400",      icon: XCircle },
};

function DeleteButton({ id }: { id: string }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  if (confirm) return (
    <div className="flex gap-1">
      <button onClick={() => setConfirm(false)} className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-700">ยกเลิก</button>
      <button onClick={async () => { setLoading(true); await deleteReward(id); }} disabled={loading}
        className="rounded bg-red-900/60 px-2 py-1 text-xs text-red-400 hover:bg-red-900 disabled:opacity-50">
        {loading ? "..." : "ยืนยันลบ"}
      </button>
    </div>
  );
  return (
    <button onClick={() => setConfirm(true)} className="rounded p-1.5 text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors">
      <Trash2 size={14} />
    </button>
  );
}

function ToggleSwitch({ id, isActive }: { id: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false);
  return (
    <button onClick={async () => { setLoading(true); await toggleRewardActive(id, !isActive); setLoading(false); }}
      disabled={loading}
      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 focus:outline-none"
      style={{ backgroundColor: isActive ? "#16a34a" : "#dc2626" }}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${isActive ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function RedemptionStatusSelect({ redemption }: { redemption: Redemption }) {
  const [loading, setLoading] = useState(false);
  const cfg = STATUS_CONFIG[redemption.status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  const handle = async (status: "approved" | "rejected" | "completed") => {
    setLoading(true);
    await updateRedemptionStatus(redemption.id, status);
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.cls}`}>
        <Icon size={10} /> {cfg.label}
      </span>
      {redemption.status === "pending" && (
        <div className="flex gap-1">
          <button onClick={() => handle("approved")} disabled={loading}
            className="rounded bg-blue-900/50 px-2 py-0.5 text-xs text-blue-400 hover:bg-blue-900 disabled:opacity-50 transition-colors">
            อนุมัติ
          </button>
          <button onClick={() => handle("rejected")} disabled={loading}
            className="rounded bg-red-900/50 px-2 py-0.5 text-xs text-red-400 hover:bg-red-900 disabled:opacity-50 transition-colors">
            ปฏิเสธ
          </button>
        </div>
      )}
      {redemption.status === "approved" && (
        <button onClick={() => handle("completed")} disabled={loading}
          className="rounded bg-green-900/50 px-2 py-0.5 text-xs text-green-400 hover:bg-green-900 disabled:opacity-50 transition-colors">
          มอบแล้ว ✓
        </button>
      )}
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}

export default function RewardManagement({
  rewards,
  redemptions,
}: {
  rewards: Reward[];
  redemptions: Redemption[];
}) {
  const [tab, setTab] = useState<"rewards" | "redemptions">("rewards");
  const pending = redemptions.filter((r) => r.status === "pending").length;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Gift size={20} className="text-pink-400" />
            Redeem Management
          </h1>
          <p className="text-sm text-gray-300 mt-0.5">ของรางวัลที่แฟนคลับสามารถแลก L-Point</p>
        </div>
        {tab === "rewards" && (
          <Link href="/admin/rewards/new"
            className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 transition-colors">
            <Plus size={15} /> เพิ่ม Reward
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-gray-800 bg-gray-900 p-1 w-fit">
        <button onClick={() => setTab("rewards")}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${tab === "rewards" ? "bg-pink-600 text-white" : "text-gray-400 hover:text-gray-200"}`}>
          Rewards ({rewards.length})
        </button>
        <button onClick={() => setTab("redemptions")}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5 ${tab === "redemptions" ? "bg-pink-600 text-white" : "text-gray-400 hover:text-gray-200"}`}>
          คำขอ Redeem ({redemptions.length})
          {pending > 0 && (
            <span className="rounded-full bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 leading-none">
              {pending}
            </span>
          )}
        </button>
      </div>

      {/* Rewards tab */}
      {tab === "rewards" && (
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
          {rewards.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Gift size={40} className="mx-auto mb-3 opacity-20" />
              <p>ยังไม่มี Reward</p>
              <p className="text-xs mt-1">กดปุ่ม "เพิ่ม Reward" เพื่อเริ่มต้น</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/60">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-300">Reward</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-300">L-Point</th>
                  <th className="hidden md:table-cell px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-300">ประเภท</th>
                  <th className="hidden lg:table-cell px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-300">Stock</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-300">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {rewards.map((r) => (
                  <tr key={r.id} className="group hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{r.icon}</span>
                        <div>
                          <p className="font-medium text-white flex items-center gap-1.5">
                            {r.title}
                            {r.is_limited && (
                              <span className="rounded-full bg-yellow-900/50 px-1.5 py-0.5 text-[10px] font-bold text-yellow-400">LIMITED</span>
                            )}
                          </p>
                          {r.description && (
                            <p className="text-xs text-gray-300 line-clamp-1 max-w-xs">{r.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-pink-400">
                        <Star size={11} className="fill-pink-400" />
                        {r.points_required.toLocaleString()}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-5 py-3.5 text-center text-xs text-gray-400">
                      {TYPE_LABEL[r.type] ?? r.type}
                    </td>
                    <td className="hidden lg:table-cell px-5 py-3.5 text-center text-xs text-gray-400">
                      {r.stock != null ? r.stock.toLocaleString() : <span className="text-gray-300">ไม่จำกัด</span>}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <ToggleSwitch id={r.id} isActive={r.is_active} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/rewards/${r.id}/edit`}
                          className="rounded p-1.5 text-sky-400 hover:bg-sky-950/50 hover:text-sky-300 transition-colors">
                          <SquarePen size={14} />
                        </Link>
                        <DeleteButton id={r.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Redemptions tab */}
      {tab === "redemptions" && (
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
          {redemptions.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <PackageCheck size={40} className="mx-auto mb-3 opacity-20" />
              <p>ยังไม่มีคำขอ Redeem</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/60">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-300">Member</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-300">Reward</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-300">Point ที่ใช้</th>
                  <th className="hidden lg:table-cell px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-300">วันที่</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-300">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {redemptions.map((rd) => (
                  <tr key={rd.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-white">{rd.members?.display_name ?? rd.members?.username ?? "—"}</p>
                      <p className="text-xs text-gray-300">@{rd.members?.username}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-white">{rd.rewards?.icon} {rd.rewards?.title}</p>
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold tabular-nums text-pink-400">
                      -{rd.points_spent.toLocaleString()}
                    </td>
                    <td className="hidden lg:table-cell px-5 py-3.5 text-center text-xs text-gray-300">
                      {formatDate(rd.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <RedemptionStatusSelect redemption={rd} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
