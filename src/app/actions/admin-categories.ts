"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { verifyAdminSession } from "@/lib/admin-auth";

export interface CategoryFormState {
  error?: string;
  success?: boolean;
}

export async function createCategory(
  _prev: CategoryFormState | null,
  formData: FormData
): Promise<CategoryFormState> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  const nameTh = (formData.get("name_th") as string)?.trim();
  const icon = (formData.get("icon") as string)?.trim() || null;
  const color = (formData.get("color") as string)?.trim() || null;
  const isActive = formData.get("is_active") !== "false";

  if (!name || !nameTh) return { error: "กรุณากรอกชื่อ (EN) และชื่อ (TH)" };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("point_categories").insert({ name, name_th: nameTh, icon, color, is_active: isActive });

  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(
  _prev: CategoryFormState | null,
  formData: FormData
): Promise<CategoryFormState> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const id = (formData.get("id") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const nameTh = (formData.get("name_th") as string)?.trim();
  const icon = (formData.get("icon") as string)?.trim() || null;
  const color = (formData.get("color") as string)?.trim() || null;
  const isActive = formData.get("is_active") !== "false";

  if (!id || !name || !nameTh) return { error: "ข้อมูลไม่ครบถ้วน" };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("point_categories")
    .update({ name, name_th: nameTh, icon, color, is_active: isActive })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string): Promise<CategoryFormState> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("point_categories").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  return { success: true };
}
