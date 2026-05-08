"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

export interface RedeemResult {
  error?: string;
  success?: boolean;
}

export async function redeemReward(rewardId: string): Promise<RedeemResult> {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบก่อน" };

  const supabase = createAdminSupabaseClient();

  const [{ data: reward }, { data: member }] = await Promise.all([
    supabase.from("rewards").select("*").eq("id", rewardId).eq("is_active", true).single(),
    supabase.from("members").select("id, total_points, is_active").eq("id", user.id).single(),
  ]);

  if (!reward) return { error: "ไม่พบ Reward นี้" };
  if (!member || !member.is_active) return { error: "บัญชีของคุณถูกระงับ" };
  if ((member.total_points ?? 0) < reward.points_required) return { error: "L-Point ไม่เพียงพอ" };

  if (reward.is_limited && reward.stock !== null && reward.stock <= 0) {
    return { error: "ของรางวัลนี้หมดแล้ว" };
  }

  // Deduct points
  const { error: deductError } = await supabase
    .from("members")
    .update({ total_points: (member.total_points ?? 0) - reward.points_required })
    .eq("id", user.id);

  if (deductError) return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };

  // Create redemption record
  const { error: insertError } = await supabase.from("redemptions").insert({
    user_id: user.id,
    reward_id: rewardId,
    points_spent: reward.points_required,
    status: "pending",
  });

  if (insertError) {
    // Rollback point deduction
    await supabase
      .from("members")
      .update({ total_points: member.total_points })
      .eq("id", user.id);
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
  }

  // Record point transaction (deduction)
  await supabase.from("point_transactions").insert({
    user_id: user.id,
    points: -reward.points_required,
    description: `Redeem: ${reward.title}`,
    description_th: `แลกรางวัล: ${reward.title}`,
  });

  // Decrement stock if limited
  if (reward.is_limited && reward.stock !== null) {
    await supabase.from("rewards").update({ stock: reward.stock - 1 }).eq("id", rewardId);
  }

  revalidatePath("/redeem");
  revalidatePath("/dashboard");
  return { success: true };
}
