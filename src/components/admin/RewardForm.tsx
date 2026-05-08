"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createReward, updateReward } from "@/app/actions/admin-rewards";
import { ArrowLeft, Loader2, Gift } from "lucide-react";

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
}

const REWARD_TYPES = [
  { value: "ticket",      label: "🎫 บัตร / สิทธิ์",        desc: "จับมือ, ไฮทัช, แฟนมีต, 2shot" },
  { value: "merchandise", label: "📦 Merchandise",           desc: "ของบ้าน / ของ Official" },
  { value: "limited",     label: "⭐ Limited Reward",        desc: "ของ limited ใช้ L-Point เท่านั้น" },
  { value: "other",       label: "🎁 อื่นๆ",                desc: "" },
];

const inputCls = "w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500/30 transition";

export default function RewardForm({ reward }: { reward?: Reward }) {
  const router = useRouter();
  const action = reward ? updateReward : createReward;
  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success) router.push("/admin/rewards");
  }, [state, router]);

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <Link
        href="/admin/rewards"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-gray-300 transition-colors"
      >
        <ArrowLeft size={13} />
        กลับ Redeem Management
      </Link>

      <h1 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Gift size={18} className="text-pink-400" />
        {reward ? `แก้ไข: ${reward.title}` : "เพิ่ม Reward ใหม่"}
      </h1>

      <form action={formAction} className="space-y-5">
        {reward && <input type="hidden" name="id" value={reward.id} />}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">ไอคอน (emoji)</label>
            <input name="icon" defaultValue={reward?.icon ?? "🎁"} className={inputCls} placeholder="🎁" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">L-Point ที่ต้องใช้ <span className="text-red-400">*</span></label>
            <input name="points_required" type="number" min={1} required
              defaultValue={reward?.points_required ?? ""} className={inputCls} placeholder="500" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">ชื่อ Reward <span className="text-red-400">*</span></label>
          <input name="title" required defaultValue={reward?.title} className={inputCls} placeholder="เช่น บัตรจับมือรอบพิเศษ" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">รายละเอียด</label>
          <textarea name="description" rows={3} defaultValue={reward?.description ?? ""}
            className={`${inputCls} resize-none`} placeholder="อธิบายรายละเอียดของรางวัล..." />
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">ประเภท Reward</label>
          <div className="grid grid-cols-2 gap-2">
            {REWARD_TYPES.map((t) => (
              <label key={t.value} className="flex items-start gap-2.5 cursor-pointer rounded-lg border border-gray-700 p-3 hover:border-gray-600 has-[:checked]:border-pink-500 has-[:checked]:bg-pink-950/20 transition-colors">
                <input type="radio" name="type" value={t.value}
                  defaultChecked={(reward?.type ?? "merchandise") === t.value}
                  className="mt-0.5 accent-pink-500" />
                <div>
                  <p className="text-sm text-white">{t.label}</p>
                  {t.desc && <p className="text-xs text-gray-300 mt-0.5">{t.desc}</p>}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Stock + Limited */}
        <div className="rounded-xl border border-gray-700 p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">จำนวน / สิทธิ์</p>
          <div>
            <label className="block text-xs text-gray-300 mb-1.5">Stock (ว่างไว้ = ไม่จำกัด)</label>
            <input name="stock" type="number" min={0} defaultValue={reward?.stock ?? ""}
              className={inputCls} placeholder="เช่น 10 = มีสิทธิ์แค่ 10 คน" />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" name="is_limited" value="true"
              defaultChecked={reward?.is_limited ?? false} className="h-4 w-4 rounded accent-pink-500" />
            <div>
              <p className="text-sm text-white">Limited Reward</p>
              <p className="text-xs text-gray-300">แสดง badge LIMITED และแยกหมวดใน Leaderboard</p>
            </div>
          </label>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between rounded-xl border border-gray-700 px-4 py-3">
          <span className="text-sm text-gray-300">เปิดให้ Redeem</span>
          <select name="is_active" defaultValue={reward ? String(reward.is_active) : "true"}
            className="bg-transparent text-sm text-white focus:outline-none">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {state?.error && (
          <p className="rounded-lg border border-red-800 bg-red-950/50 px-3 py-2 text-xs text-red-400">
            {state.error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <Link href="/admin/rewards"
            className="flex-1 rounded-lg border border-gray-700 py-2.5 text-sm text-center text-gray-400 hover:bg-gray-800 transition-colors">
            ยกเลิก
          </Link>
          <button type="submit" disabled={pending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-pink-600 py-2.5 text-sm font-medium text-white hover:bg-pink-700 disabled:opacity-50 transition-colors">
            {pending && <Loader2 size={13} className="animate-spin" />}
            {reward ? "บันทึกการแก้ไข" : "สร้าง Reward"}
          </button>
        </div>
      </form>
    </div>
  );
}
