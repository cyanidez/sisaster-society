"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { createAdminSession, destroyAdminSession } from "@/lib/admin-auth";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function adminSignIn(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  const supabase = createAdminSupabaseClient();

  const { data: admin, error: dbError } = await supabase
    .from("admin_users")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  console.error("[adminSignIn] username:", username, "found:", !!admin, "dbError:", dbError?.message ?? null);

  // Return generic error to avoid username enumeration
  if (!admin || !admin.is_active) {
    return { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
  }

  // Check account lockout
  if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
    const remainingMs = new Date(admin.locked_until).getTime() - Date.now();
    const remainingMin = Math.ceil(remainingMs / 60_000);
    return { error: `บัญชีถูกล็อกชั่วคราว กรุณารออีก ${remainingMin} นาที` };
  }

  // Constant-time password comparison via bcrypt
  const isValid = await bcrypt.compare(password, admin.password_hash);
  console.error("[adminSignIn] bcrypt isValid:", isValid, "hash prefix:", admin.password_hash?.slice(0, 7));

  if (!isValid) {
    const newAttempts = (admin.failed_login_attempts ?? 0) + 1;
    const updates: Record<string, unknown> = {
      failed_login_attempts: newAttempts,
      updated_at: new Date().toISOString(),
    };

    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      updates.locked_until = new Date(
        Date.now() + LOCKOUT_MINUTES * 60_000
      ).toISOString();
      updates.failed_login_attempts = 0;
    }

    await supabase.from("admin_users").update(updates).eq("id", admin.id);
    return { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
  }

  // Success — reset lockout counters
  const reqHeaders = await headers();
  await supabase
    .from("admin_users")
    .update({
      failed_login_attempts: 0,
      locked_until: null,
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", admin.id);

  await createAdminSession(admin.id, {
    ipAddress: reqHeaders.get("x-forwarded-for") ?? reqHeaders.get("x-real-ip") ?? undefined,
    userAgent: reqHeaders.get("user-agent") ?? undefined,
  });

  redirect("/admin/users");
}

export async function adminSignOut(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}
