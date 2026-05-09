import { notFound } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import RankManagement, { type RankRow } from "@/components/admin/RankManagement";

export const dynamic = "force-dynamic";

export default async function RanksPage() {
  const admin = await verifyAdminSession();
  if (!admin || (admin.role !== "super_admin" && !admin.permissions.includes("rank_management"))) notFound();

  const supabase = createAdminSupabaseClient();

  const [{ data: ranks }, { data: members }] = await Promise.all([
    supabase.from("ranks").select("*").order("min_points", { ascending: true }),
    supabase.from("members").select("total_points"),
  ]);

  const rankList = ranks ?? [];
  const memberPoints = (members ?? []).map((m) => m.total_points ?? 0);

  const ranksWithCounts: RankRow[] = rankList.map((rank, i) => {
    const nextRank = rankList[i + 1];
    const memberCount = memberPoints.filter((pts) =>
      nextRank ? pts >= rank.min_points && pts < nextRank.min_points : pts >= rank.min_points
    ).length;
    return { ...rank, memberCount, isLocked: memberCount > 0 };
  });

  return <RankManagement ranks={ranksWithCounts} />;
}
