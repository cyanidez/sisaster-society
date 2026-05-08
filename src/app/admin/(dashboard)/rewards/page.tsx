import { notFound } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import RewardManagement from "@/components/admin/RewardManagement";

export const dynamic = "force-dynamic";

export default async function AdminRewardsPage() {
  const admin = await verifyAdminSession();
  if (!admin || (admin.role !== "super_admin" && !admin.permissions.includes("redeem_management"))) notFound();

  const supabase = createAdminSupabaseClient();
  const [{ data: rewards }, { data: redemptions }] = await Promise.all([
    supabase.from("rewards").select("*").order("created_at", { ascending: false }),
    supabase
      .from("redemptions")
      .select("*, members(username, display_name), rewards(title, icon)")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  return (
    <RewardManagement
      rewards={rewards ?? []}
      redemptions={redemptions ?? []}
    />
  );
}
