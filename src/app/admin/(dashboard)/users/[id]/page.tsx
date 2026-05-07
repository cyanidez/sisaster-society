import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import AddPointForm from "@/components/admin/AddPointForm";
import {
  ArrowLeft, Star, TrendingUp, TrendingDown,
  Clock, Heart, Gamepad2, Megaphone, Smartphone,
  ShoppingBag, Award,
} from "lucide-react";

export const dynamic = "force-dynamic";

const categoryIcons: Record<string, React.ElementType> = {
  donation: Heart,
  activity: Gamepad2,
  event: Megaphone,
  social: Smartphone,
  purchase: ShoppingBag,
  bonus: Star,
};

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getLevel(pts: number) {
  if (pts >= 10000) return { emoji: "👑", label: "Sisaster Legend", color: "text-red-400" };
  if (pts >= 5000)  return { emoji: "⭐", label: "Sisaster Sister", color: "text-yellow-400" };
  if (pts >= 2000)  return { emoji: "💜", label: "Sisaster Member", color: "text-purple-400" };
  if (pts >= 500)   return { emoji: "💗", label: "Sisaster Fan",    color: "text-pink-400" };
  return              { emoji: "🌱", label: "Oshi Beginner",         color: "text-gray-400" };
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminSupabaseClient();

  const [{ data: profile }, { data: transactions }, { data: categories }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("point_transactions")
        .select("*, point_categories(id, name, name_th, icon, color)")
        .eq("user_id", id)
        .order("created_at", { ascending: false }),
      supabase.from("point_categories").select("*").order("name"),
    ]);

  if (!profile) notFound();

  const txList = transactions ?? [];
  const level = getLevel(profile.total_points ?? 0);

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
        className="mb-5 inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        <ArrowLeft size={13} />
        กลับรายชื่อ Users
      </Link>

      {/* User header */}
      <div className="mb-6 flex flex-wrap items-start gap-4 rounded-xl border border-gray-800 bg-gray-900 p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-700 to-rose-800 text-xl font-black text-white">
          {(profile.display_name ?? profile.username).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-white">
            {profile.display_name ?? profile.username}
          </h1>
          <p className="text-sm text-gray-500">@{profile.username}</p>
          {profile.email && (
            <p className="text-xs text-gray-600 mt-0.5">{profile.email}</p>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <Star size={16} className="text-pink-400 fill-pink-400" />
            <span className="text-2xl font-black tabular-nums text-white">
              {(profile.total_points ?? 0).toLocaleString()}
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${level.color}`}>
            {level.emoji} {level.label}
          </p>
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
            <p className="text-xs text-gray-600">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Add point form */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <Award size={15} className="text-pink-400" />
              จัดการ L-Point
            </h2>
            <AddPointForm userId={id} categories={categories ?? []} />
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

            {txWithBalance.length === 0 ? (
              <div className="py-12 text-center text-gray-600">
                <Star size={32} className="mx-auto mb-3 opacity-20" />
                ยังไม่มีรายการ
              </div>
            ) : (
              <div className="divide-y divide-gray-800/60 max-h-[520px] overflow-y-auto">
                {txWithBalance.map((tx) => {
                  const cat = tx.point_categories as { name: string; name_th: string; icon: string | null } | null;
                  const Icon = categoryIcons[cat?.name ?? ""] ?? Star;
                  const isPositive = tx.points > 0;

                  return (
                    <div key={tx.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-800/30 transition-colors">
                      {/* Category icon */}
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        isPositive ? "bg-pink-950/60" : "bg-red-950/50"
                      }`}>
                        <Icon size={13} className={isPositive ? "text-pink-400" : "text-red-400"} />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {tx.description_th ?? tx.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {cat && (
                            <span className="text-xs text-gray-600">
                              {cat.icon} {cat.name_th}
                            </span>
                          )}
                          <span className="text-xs text-gray-600">
                            {formatDateTime(tx.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Points + running balance */}
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold tabular-nums ${
                          isPositive ? "text-green-400" : "text-red-400"
                        }`}>
                          {isPositive ? "+" : ""}{tx.points.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600 tabular-nums">
                          = {(tx as typeof tx & { balance: number }).balance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
