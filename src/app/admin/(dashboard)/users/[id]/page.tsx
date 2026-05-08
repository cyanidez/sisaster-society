import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import AddPointForm from "@/components/admin/AddPointForm";
import {
  ArrowLeft, Star, TrendingUp, TrendingDown,
  Clock, Award, Mail, Calendar,
} from "lucide-react";
import ToggleMemberButton from "@/components/admin/ToggleMemberButton";
import AccumulationSection from "@/components/admin/AccumulationSection";
import TransactionList from "@/components/admin/TransactionList";

export const dynamic = "force-dynamic";

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Rank { id: string; name: string; emoji: string; min_points: number; color: string }

function getLevel(pts: number, ranks: Rank[]) {
  let current: Rank | null = null;
  for (const r of ranks) {
    if (pts >= r.min_points) current = r;
    else break;
  }
  return current;
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminSupabaseClient();

  const [{ data: profile }, { data: transactions }, { data: categories }, { data: events }, { data: accumulations }, { data: ranksData }] =
    await Promise.all([
      supabase.from("members").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("point_transactions")
        .select("*, point_categories(id, name, name_th, icon, color)")
        .eq("user_id", id)
        .order("created_at", { ascending: false }),
      supabase.from("point_categories").select("*").order("name"),
      supabase
        .from("events")
        .select("id, title, icon, points, multiplier, condition_label, condition_value, condition_unit, is_accumulation")
        .eq("is_active", true)
        .order("title"),
      supabase
        .from("donation_accumulations")
        .select("event_id, accumulated_amount, milestones_earned")
        .eq("user_id", id),
      supabase.from("ranks").select("*").order("min_points", { ascending: true }),
    ]);

  if (!profile) notFound();

  const txList = transactions ?? [];
  const ranks: Rank[] = ranksData ?? [];
  const level = getLevel(profile.total_points ?? 0, ranks);

  // Compute running balance (newest first → calculate from oldest)
  const txWithBalance = (() => {
    const reversed = [...txList].reverse();
    let running = 0;
    const mapped = reversed.map((tx) => {
      running += tx.points;
      return { ...tx, balance: running };
    });
    return mapped.reverse();
  })();

  // Stats
  const totalAdded   = txList.filter((t) => t.points > 0).reduce((s, t) => s + t.points, 0);
  const totalDeducted = Math.abs(txList.filter((t) => t.points < 0).reduce((s, t) => s + t.points, 0));

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Back */}
      <Link
        href="/admin/users"
        className="mb-5 inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-gray-300 transition-colors"
      >
        <ArrowLeft size={13} />
        กลับรายชื่อ Users
      </Link>

      {/* User header */}
      <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-700 to-rose-800 text-xl font-black text-white">
            {(profile.display_name ?? profile.username).charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-white">
                {profile.display_name ?? profile.username}
              </h1>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                profile.is_active
                  ? "bg-green-950/50 text-green-400"
                  : "bg-red-950/50 text-red-400"
              }`}>
                {profile.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-gray-300">@{profile.username}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <Star size={16} className="text-pink-400 fill-pink-400" />
              <span className="text-2xl font-black tabular-nums text-white">
                {(profile.total_points ?? 0).toLocaleString()}
              </span>
            </div>
            {level && (
              <p className="text-xs mt-0.5 text-gray-300">
                {level.emoji} {level.name}
              </p>
            )}
          </div>
        </div>

        {/* Full Profile */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-gray-800 pt-4 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Mail size={13} className="text-gray-400 shrink-0" />
            {profile.email ?? "—"}
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar size={13} className="text-gray-400 shrink-0" />
            สมัครเมื่อ {formatDateTime(profile.created_at)}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 border-t border-gray-800 pt-4">
          <ToggleMemberButton userId={id} isActive={profile.is_active ?? true} />
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: "ธุรกรรมทั้งหมด", value: txList.length, icon: Clock, color: "text-gray-400" },
          { label: "Point ที่ได้รับ", value: `+${totalAdded.toLocaleString()}`, icon: TrendingUp, color: "text-green-400" },
          { label: "Point ที่ถูกหัก", value: `-${totalDeducted.toLocaleString()}`, icon: TrendingDown, color: "text-red-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-3">
            <Icon size={14} className={`${color} mb-1.5`} />
            <p className={`text-lg font-black tabular-nums ${color}`}>{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <AccumulationSection userId={id} events={events ?? []} accumulations={accumulations ?? []} />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Add point form */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <Award size={15} className="text-pink-400" />
              จัดการ L-Point
            </h2>
            <AddPointForm userId={id} categories={categories ?? []} events={events ?? []} accumulations={accumulations ?? []} />
          </div>
        </div>

        {/* Transaction history */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-800 px-5 py-3.5">
              <Clock size={14} className="text-pink-400" />
              <h2 className="text-sm font-semibold text-white">
                ประวัติ L-Point ({txList.length} รายการ)
              </h2>
            </div>
            <TransactionList
              transactions={txWithBalance.map((tx) => ({
                ...tx,
                point_categories: tx.point_categories as { name: string; name_th: string; icon: string | null } | null,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
