import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import RedeemClient from "./RedeemClient";

export const dynamic = "force-dynamic";

export default async function RedeemPage() {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) redirect("/login");

  const supabase = createAdminSupabaseClient();

  const [{ data: member }, { data: rewards }, { data: myRedemptions }] = await Promise.all([
    supabase.from("members").select("total_points, is_active").eq("id", user.id).single(),
    supabase
      .from("rewards")
      .select("id, title, description, type, icon, points_required, stock, is_limited")
      .eq("is_active", true)
      .order("points_required", { ascending: true }),
    supabase
      .from("redemptions")
      .select("id, reward_id, points_spent, status, created_at, updated_at, rewards(title, icon)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <RedeemClient
      totalPoints={member?.total_points ?? 0}
      rewards={rewards ?? []}
      myRedemptions={myRedemptions ?? []}
    />
  );
}
