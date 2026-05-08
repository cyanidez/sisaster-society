"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { verifyAdminSession } from "@/lib/admin-auth";

export interface EventFormState {
  error?: string;
  success?: boolean;
}

export async function createEvent(
  _prev: EventFormState | null,
  formData: FormData
): Promise<EventFormState> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const points = parseInt(formData.get("points") as string, 10);
  const icon = (formData.get("icon") as string)?.trim() || "⭐";
  const categoryId = (formData.get("category_id") as string)?.trim() || null;
  const startDate = (formData.get("start_date") as string) || null;
  const endDate = (formData.get("end_date") as string) || null;
  const maxPerUser = formData.get("max_per_user")
    ? parseInt(formData.get("max_per_user") as string, 10)
    : null;
  const isActive = formData.get("is_active") === "true";
  const conditionLabel = (formData.get("condition_label") as string)?.trim() || null;
  const conditionValue = formData.get("condition_value")
    ? parseFloat(formData.get("condition_value") as string)
    : null;
  const conditionUnit = (formData.get("condition_unit") as string)?.trim() || null;
  const multiplier = formData.get("multiplier")
    ? parseFloat(formData.get("multiplier") as string)
    : 1;
  const isAccumulation = formData.get("is_accumulation") === "true";

  if (!title || isNaN(points)) return { error: "กรุณากรอกชื่อและจำนวน Point" };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("events").insert({
    title,
    description,
    points,
    icon,
    category_id: categoryId,
    start_date: startDate,
    end_date: endDate,
    max_per_user: maxPerUser,
    is_active: isActive,
    condition_label: conditionLabel,
    condition_value: conditionValue,
    condition_unit: conditionUnit,
    multiplier: isNaN(multiplier) || multiplier < 1 ? 1 : multiplier,
    is_accumulation: isAccumulation,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/events");
  return { success: true };
}

export async function updateEvent(
  _prev: EventFormState | null,
  formData: FormData
): Promise<EventFormState> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const id = (formData.get("id") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const points = parseInt(formData.get("points") as string, 10);
  const icon = (formData.get("icon") as string)?.trim() || "⭐";
  const categoryId = (formData.get("category_id") as string)?.trim() || null;
  const startDate = (formData.get("start_date") as string) || null;
  const endDate = (formData.get("end_date") as string) || null;
  const maxPerUser = formData.get("max_per_user")
    ? parseInt(formData.get("max_per_user") as string, 10)
    : null;
  const isActive = formData.get("is_active") === "true";
  const conditionLabel = (formData.get("condition_label") as string)?.trim() || null;
  const conditionValue = formData.get("condition_value")
    ? parseFloat(formData.get("condition_value") as string)
    : null;
  const conditionUnit = (formData.get("condition_unit") as string)?.trim() || null;
  const multiplier = formData.get("multiplier")
    ? parseFloat(formData.get("multiplier") as string)
    : 1;
  const isAccumulation = formData.get("is_accumulation") === "true";

  if (!id || !title || isNaN(points)) return { error: "ข้อมูลไม่ครบถ้วน" };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("events")
    .update({
      title,
      description,
      points,
      icon,
      category_id: categoryId,
      start_date: startDate,
      end_date: endDate,
      max_per_user: maxPerUser,
      is_active: isActive,
      condition_label: conditionLabel,
      condition_value: conditionValue,
      condition_unit: conditionUnit,
      multiplier: isNaN(multiplier) || multiplier < 1 ? 1 : multiplier,
      is_accumulation: isAccumulation,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/events");
  return { success: true };
}

export async function deleteEvent(id: string): Promise<EventFormState> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/events");
  return { success: true };
}

export async function toggleEventActive(
  id: string,
  isActive: boolean
): Promise<EventFormState> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("events")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/events");
  return { success: true };
}
