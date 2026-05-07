"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function addPointTransaction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const userId = (formData.get("user_id") as string)?.trim();
  const categoryId = (formData.get("category_id") as string)?.trim() || null;
  const rawPoints = formData.get("points") as string;
  const descriptionTh = (formData.get("description_th") as string)?.trim();

  if (!userId || !rawPoints || !descriptionTh) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  const points = parseInt(rawPoints, 10);
  if (isNaN(points) || points === 0) {
    return { error: "จำนวน Point ต้องเป็นตัวเลขที่ไม่ใช่ 0" };
  }

  const supabase = createAdminSupabaseClient();

  // Verify user exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return { error: "ไม่พบ User นี้ในระบบ" };

  const { error } = await supabase.from("point_transactions").insert({
    user_id: userId,
    category_id: categoryId,
    points,
    description: descriptionTh,
    description_th: descriptionTh,
  });

  if (error) return { error: `บันทึกไม่สำเร็จ: ${error.message}` };

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  return { success: true };
}
