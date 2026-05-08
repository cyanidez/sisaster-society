"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { verifyAdminSession } from "@/lib/admin-auth";

type ActionResult = { error?: string; success?: boolean };

async function getRankLockStatus(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  rankId: string
): Promise<boolean> {
  const { data: rank } = await supabase
    .from("ranks")
    .select("min_points")
    .eq("id", rankId)
    .maybeSingle();
  if (!rank) return false;

  const { data: nextRank } = await supabase
    .from("ranks")
    .select("min_points")
    .gt("min_points", rank.min_points)
    .order("min_points", { ascending: true })
    .limit(1)
    .maybeSingle();

  let query = supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .gte("total_points", rank.min_points);

  if (nextRank) {
    query = query.lt("total_points", nextRank.min_points);
  }

  const { count } = await query;
  return (count ?? 0) > 0;
}

export async function createRank(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  const emoji = (formData.get("emoji") as string)?.trim() || "⭐";
  const min_points = parseInt(formData.get("min_points") as string, 10);
  const color = (formData.get("color") as string)?.trim() || "#94a3b8";

  if (!name || isNaN(min_points) || min_points < 0) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  const supabase = createAdminSupabaseClient();

  const { data: conflict } = await supabase
    .from("ranks")
    .select("name")
    .eq("min_points", min_points)
    .maybeSingle();

  if (conflict) {
    return { error: `${min_points.toLocaleString()} L-Point ซ้ำกับ Rank "${conflict.name}"` };
  }

  const { error } = await supabase.from("ranks").insert({ name, emoji, min_points, color });
  if (error) return { error: error.message };

  revalidatePath("/admin/ranks");
  return { success: true };
}

export async function updateRank(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const id = (formData.get("id") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const emoji = (formData.get("emoji") as string)?.trim() || "⭐";
  const min_points = parseInt(formData.get("min_points") as string, 10);
  const color = (formData.get("color") as string)?.trim() || "#94a3b8";

  if (!id || !name || isNaN(min_points) || min_points < 0) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  const supabase = createAdminSupabaseClient();

  const locked = await getRankLockStatus(supabase, id);
  if (locked) return { error: "ไม่สามารถแก้ไขได้ มีสมาชิกที่อยู่ใน Rank นี้อยู่แล้ว" };

  const { data: conflict } = await supabase
    .from("ranks")
    .select("name")
    .eq("min_points", min_points)
    .neq("id", id)
    .maybeSingle();

  if (conflict) {
    return { error: `${min_points.toLocaleString()} L-Point ซ้ำกับ Rank "${conflict.name}"` };
  }

  const { error } = await supabase
    .from("ranks")
    .update({ name, emoji, min_points, color })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/ranks");
  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteRank(id: string): Promise<ActionResult> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const supabase = createAdminSupabaseClient();

  const locked = await getRankLockStatus(supabase, id);
  if (locked) return { error: "ไม่สามารถลบได้ มีสมาชิกที่อยู่ใน Rank นี้อยู่แล้ว" };

  const { error } = await supabase.from("ranks").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/ranks");
  return { success: true };
}
