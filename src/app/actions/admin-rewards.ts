"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { verifyAdminSession } from "@/lib/admin-auth";

export interface RewardFormState {
  error?: string;
  success?: boolean;
}

export async function createReward(
  _prev: RewardFormState | null,
  formData: FormData
): Promise<RewardFormState> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const type = (formData.get("type") as string)?.trim() || "merchandise";
  const icon = (formData.get("icon") as string)?.trim() || "🎁";
  const pointsRequired = parseInt(formData.get("points_required") as string, 10);
  const stock = formData.get("stock") ? parseInt(formData.get("stock") as string, 10) : null;
  const isActive = formData.get("is_active") !== "false";
  const isLimited = formData.get("is_limited") === "true";

  if (!title || isNaN(pointsRequired)) return { error: "กรุณากรอกชื่อและจำนวน Point ที่ต้องใช้" };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("rewards").insert({
    title, description, type, icon, points_required: pointsRequired,
    stock: isNaN(stock!) ? null : stock, is_active: isActive, is_limited: isLimited,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/rewards");
  return { success: true };
}

export async function updateReward(
  _prev: RewardFormState | null,
  formData: FormData
): Promise<RewardFormState> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const id = (formData.get("id") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const type = (formData.get("type") as string)?.trim() || "merchandise";
  const icon = (formData.get("icon") as string)?.trim() || "🎁";
  const pointsRequired = parseInt(formData.get("points_required") as string, 10);
  const stock = formData.get("stock") ? parseInt(formData.get("stock") as string, 10) : null;
  const isActive = formData.get("is_active") !== "false";
  const isLimited = formData.get("is_limited") === "true";

  if (!id || !title || isNaN(pointsRequired)) return { error: "ข้อมูลไม่ครบถ้วน" };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("rewards").update({
    title, description, type, icon, points_required: pointsRequired,
    stock: isNaN(stock!) ? null : stock, is_active: isActive, is_limited: isLimited,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/rewards");
  return { success: true };
}

export async function deleteReward(id: string): Promise<RewardFormState> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("rewards").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/rewards");
  return { success: true };
}

export async function toggleRewardActive(id: string, isActive: boolean): Promise<RewardFormState> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("rewards")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/rewards");
  return { success: true };
}

export async function updateRedemptionStatus(
  id: string,
  status: "approved" | "rejected" | "completed",
  adminNotes?: string
): Promise<RewardFormState> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const supabase = createAdminSupabaseClient();

  if (status === "rejected") {
    const { data: redemption } = await supabase
      .from("redemptions")
      .select("user_id, points_spent, status, rewards(title)")
      .eq("id", id)
      .single();

    if (!redemption) return { error: "ไม่พบคำขอ Redeem" };
    if (redemption.status === "rejected") return { error: "คำขอนี้ถูกปฏิเสธไปแล้ว" };

    const rewardTitle = Array.isArray(redemption.rewards)
      ? (redemption.rewards[0] as { title: string } | undefined)?.title
      : (redemption.rewards as { title: string } | null)?.title;

    const { data: member } = await supabase
      .from("members")
      .select("total_points")
      .eq("id", redemption.user_id)
      .single();

    if (member) {
      await supabase
        .from("members")
        .update({ total_points: (member.total_points ?? 0) + redemption.points_spent })
        .eq("id", redemption.user_id);

      await supabase.from("point_transactions").insert({
        user_id: redemption.user_id,
        points: redemption.points_spent,
        description: `Refund: ${rewardTitle ?? "ของรางวัล"}`,
        description_th: `คืน Point: ${rewardTitle ?? "ของรางวัล"}`,
      });
    }
  }

  const { error } = await supabase.from("redemptions")
    .update({ status, admin_notes: adminNotes ?? null, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/rewards");
  revalidatePath("/redeem");
  revalidatePath("/dashboard");
  return { success: true };
}
