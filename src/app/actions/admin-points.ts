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
  const eventId = (formData.get("event_id") as string)?.trim() || null;
  const rawPoints = formData.get("points") as string;
  const descriptionTh = (formData.get("description_th") as string)?.trim();

  if (!userId || !rawPoints || !descriptionTh) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  const basePoints = parseInt(rawPoints, 10);
  if (isNaN(basePoints) || basePoints === 0) {
    return { error: "จำนวน Point ต้องเป็นตัวเลขที่ไม่ใช่ 0" };
  }

  const supabase = createAdminSupabaseClient();

  // Verify user exists
  const { data: profile } = await supabase
    .from("members")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return { error: "ไม่พบ User นี้ในระบบ" };

  // Fetch event multiplier if linked
  let multiplier = 1;
  if (eventId) {
    const { data: event } = await supabase
      .from("events")
      .select("multiplier")
      .eq("id", eventId)
      .maybeSingle();
    if (event?.multiplier && event.multiplier > 1) {
      multiplier = event.multiplier;
    }
  }

  const finalPoints = Math.round(basePoints * multiplier);

  const { error } = await supabase.from("point_transactions").insert({
    user_id: userId,
    category_id: categoryId,
    event_id: eventId,
    points: finalPoints,
    base_points: multiplier > 1 ? basePoints : null,
    description: descriptionTh,
    description_th: descriptionTh,
  });

  if (error) return { error: `บันทึกไม่สำเร็จ: ${error.message}` };

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  return { success: true };
}

export async function recordEventParticipation(
  _prev: { error?: string; success?: boolean; pointsEarned?: number } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean; pointsEarned?: number }> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const userId = (formData.get("user_id") as string)?.trim();
  const eventId = (formData.get("event_id") as string)?.trim();

  if (!userId || !eventId) return { error: "กรุณาเลือก Event" };

  const supabase = createAdminSupabaseClient();

  const { data: event } = await supabase
    .from("events")
    .select("points, multiplier, title, icon, condition_value, condition_unit, condition_label")
    .eq("id", eventId)
    .maybeSingle();

  if (!event) return { error: "ไม่พบ Event" };

  // Validate entry amount against key condition (non-accumulation)
  const entryAmountRaw = formData.get("entry_amount") as string;
  const entryAmount = entryAmountRaw ? parseFloat(entryAmountRaw) : null;

  if (event.condition_value && event.condition_value > 0) {
    if (entryAmount === null || isNaN(entryAmount)) {
      return { error: "กรุณากรอกยอด" };
    }
    // Below threshold → record nothing, return success with 0 points
    if (entryAmount < event.condition_value) {
      return { success: true, pointsEarned: 0 };
    }
  }

  const multiplier = event.multiplier ?? 1;
  const finalPoints = Math.round(event.points * multiplier);

  const amountPart =
    entryAmount != null && event.condition_unit
      ? ` · ${event.condition_label ? event.condition_label + " " : ""}${entryAmount.toLocaleString()} ${event.condition_unit}`
      : "";
  const desc = `${event.icon ?? ""} ${event.title}${amountPart}`.trim();

  const { error } = await supabase.from("point_transactions").insert({
    user_id: userId,
    event_id: eventId,
    points: finalPoints,
    base_points: multiplier > 1 ? event.points : null,
    description: desc,
    description_th: desc,
  });

  if (error) return { error: `บันทึกไม่สำเร็จ: ${error.message}` };

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  return { success: true, pointsEarned: finalPoints };
}

export async function recordDonation(
  _prev: { error?: string; success?: boolean; pointsEarned?: number } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean; pointsEarned?: number }> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const userId = (formData.get("user_id") as string)?.trim();
  const eventId = (formData.get("event_id") as string)?.trim();
  const donationAmount = parseFloat(formData.get("donation_amount") as string);

  if (!userId || !eventId) return { error: "ข้อมูลไม่ครบถ้วน" };
  if (isNaN(donationAmount) || donationAmount <= 0) return { error: "จำนวนเงินต้องมากกว่า 0" };

  const supabase = createAdminSupabaseClient();

  const { data: event } = await supabase
    .from("events")
    .select("condition_value, condition_label, condition_unit, points, multiplier, title, icon, is_accumulation")
    .eq("id", eventId)
    .maybeSingle();

  if (!event?.is_accumulation) return { error: "Event นี้ไม่ใช่ประเภทสะสม" };
  if (!event.condition_value || event.condition_value <= 0) return { error: "Event ยังไม่ได้กำหนด threshold" };

  const threshold = event.condition_value;
  const pointsPerMilestone = event.points ?? 1;
  const multiplier = event.multiplier ?? 1;

  const { data: acc } = await supabase
    .from("donation_accumulations")
    .select("accumulated_amount, milestones_earned")
    .eq("user_id", userId)
    .eq("event_id", eventId)
    .maybeSingle();

  const currentAmount = acc?.accumulated_amount ?? 0;
  const currentMilestones = acc?.milestones_earned ?? 0;
  const newAmount = currentAmount + donationAmount;
  const newMilestones = Math.floor(newAmount / threshold);
  const newMilestonesEarned = newMilestones - currentMilestones;
  const basePoints = newMilestonesEarned * pointsPerMilestone;
  const finalPoints = Math.round(basePoints * multiplier);

  const { error: accError } = await supabase.from("donation_accumulations").upsert(
    { user_id: userId, event_id: eventId, accumulated_amount: newAmount, milestones_earned: newMilestones, updated_at: new Date().toISOString() },
    { onConflict: "user_id,event_id" }
  );
  if (accError) return { error: `บันทึกการสะสมไม่สำเร็จ: ${accError.message}` };

  // Log each entry regardless of milestone
  const { error: logError } = await supabase.from("accumulation_logs").insert({
    user_id: userId,
    event_id: eventId,
    amount: donationAmount,
  });
  if (logError) return { error: `บันทึก Log ไม่สำเร็จ: ${logError.message}` };

  if (finalPoints > 0) {
    const action = event.condition_label ?? "สะสม";
    const unit = event.condition_unit ? ` ${event.condition_unit}` : "";
    const desc = `${event.icon ?? ""} ${event.title} · ${action} ${donationAmount}${unit} (รวม ${newAmount}${unit})`.trim();
    const { error: txError } = await supabase.from("point_transactions").insert({
      user_id: userId,
      event_id: eventId,
      points: finalPoints,
      base_points: basePoints !== finalPoints ? basePoints : null,
      description: desc,
      description_th: desc,
    });
    if (txError) return { error: `บันทึก Point ไม่สำเร็จ: ${txError.message}` };
  }

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  return { success: true, pointsEarned: finalPoints };
}

export async function getAccumulationLogs(
  userId: string,
  eventId: string
): Promise<{ data: { id: string; amount: number; created_at: string }[] | null; error?: string }> {
  const admin = await verifyAdminSession();
  if (!admin) return { data: null, error: "Unauthorized" };

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("accumulation_logs")
    .select("id, amount, created_at")
    .eq("user_id", userId)
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data };
}

interface TransactionDetailResult {
  type: "regular" | "accumulation" | "manual";
  event: {
    title: string;
    icon: string;
    condition_unit: string | null;
    points: number;
    multiplier: number;
  } | null;
  tx_points: number;
  tx_base_points: number | null;
  logs?: { id: string; amount: number; created_at: string }[];
  error?: string;
}

export async function getTransactionDetail(
  txId: string
): Promise<TransactionDetailResult> {
  const admin = await verifyAdminSession();
  if (!admin) return { type: "manual", event: null, tx_points: 0, tx_base_points: null, error: "Unauthorized" };

  const supabase = createAdminSupabaseClient();

  const { data: tx } = await supabase
    .from("point_transactions")
    .select("event_id, user_id, created_at, points, base_points")
    .eq("id", txId)
    .maybeSingle();

  if (!tx) return { type: "manual", event: null, tx_points: 0, tx_base_points: null, error: "ไม่พบรายการ" };

  if (!tx.event_id) {
    return { type: "manual", event: null, tx_points: tx.points, tx_base_points: tx.base_points };
  }

  const { data: event } = await supabase
    .from("events")
    .select("title, icon, is_accumulation, condition_unit, points, multiplier")
    .eq("id", tx.event_id)
    .maybeSingle();

  if (!event) {
    return { type: "manual", event: null, tx_points: tx.points, tx_base_points: tx.base_points };
  }

  const eventInfo = {
    title: event.title,
    icon: event.icon,
    condition_unit: event.condition_unit,
    points: event.points,
    multiplier: event.multiplier ?? 1,
  };

  if (!event.is_accumulation) {
    return { type: "regular", event: eventInfo, tx_points: tx.points, tx_base_points: tx.base_points };
  }

  // Find the previous point_transaction for this user+event to define the milestone window
  const { data: prevTx } = await supabase
    .from("point_transactions")
    .select("created_at")
    .eq("user_id", tx.user_id)
    .eq("event_id", tx.event_id)
    .lt("created_at", tx.created_at)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fetch accumulation_logs within this milestone window
  let logsQuery = supabase
    .from("accumulation_logs")
    .select("id, amount, created_at")
    .eq("user_id", tx.user_id)
    .eq("event_id", tx.event_id)
    .lte("created_at", tx.created_at)
    .order("created_at", { ascending: true });

  if (prevTx) {
    logsQuery = logsQuery.gt("created_at", prevTx.created_at);
  }

  const { data: logs, error: logsError } = await logsQuery;

  return {
    type: "accumulation",
    event: eventInfo,
    tx_points: tx.points,
    tx_base_points: tx.base_points,
    logs: logs ?? [],
    ...(logsError ? { error: logsError.message } : {}),
  };
}

export async function toggleMemberActive(
  userId: string,
  isActive: boolean
): Promise<{ error?: string; success?: boolean }> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("members")
    .update({ is_active: isActive })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  return { success: true };
}
