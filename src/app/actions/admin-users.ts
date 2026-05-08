"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { verifyAdminSession } from "@/lib/admin-auth";

export interface AdminUserFormState {
  error?: string;
  success?: boolean;
}

async function requireSuperAdmin() {
  const admin = await verifyAdminSession();
  if (!admin || admin.role !== "super_admin") return null;
  return admin;
}

export async function createAdminUser(
  _prev: AdminUserFormState | null,
  formData: FormData
): Promise<AdminUserFormState> {
  if (!(await requireSuperAdmin())) return { error: "Unauthorized" };

  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const email = (formData.get("email") as string)?.trim();
  const displayName = (formData.get("display_name") as string)?.trim() || null;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) === "super_admin" ? "super_admin" : "admin";

  if (!username || !email || !password) return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  if (password.length < 8) return { error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };

  const passwordHash = await bcrypt.hash(password, 12);
  const supabase = createAdminSupabaseClient();

  const { error } = await supabase.from("admin_users").insert({
    username,
    email,
    display_name: displayName,
    password_hash: passwordHash,
    role,
    is_active: true,
    failed_login_attempts: 0,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/admin-users");
  return { success: true };
}

export async function updateAdminUser(
  _prev: AdminUserFormState | null,
  formData: FormData
): Promise<AdminUserFormState> {
  const current = await requireSuperAdmin();
  if (!current) return { error: "Unauthorized" };

  const id = (formData.get("id") as string)?.trim();
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const email = (formData.get("email") as string)?.trim();
  const displayName = (formData.get("display_name") as string)?.trim() || null;
  const role = (formData.get("role") as string) === "super_admin" ? "super_admin" : "admin";
  const newPassword = (formData.get("password") as string)?.trim() || null;

  if (!id || !username || !email) return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };

  const updates: Record<string, unknown> = {
    username, email, display_name: displayName, role,
    updated_at: new Date().toISOString(),
  };

  if (newPassword) {
    if (newPassword.length < 8) return { error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };
    updates.password_hash = await bcrypt.hash(newPassword, 12);
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("admin_users").update(updates).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/admin-users");
  return { success: true };
}

export async function toggleAdminUserActive(
  id: string,
  isActive: boolean
): Promise<AdminUserFormState> {
  const current = await requireSuperAdmin();
  if (!current) return { error: "Unauthorized" };
  if (current.id === id) return { error: "ไม่สามารถ deactivate ตัวเองได้" };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("admin_users")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/admin-users");
  return { success: true };
}

export async function updateAdminPermissions(
  id: string,
  permissions: string[]
): Promise<AdminUserFormState> {
  const current = await requireSuperAdmin();
  if (!current) return { error: "Unauthorized" };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("admin_users")
    .update({ permissions, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/admin-users");
  return { success: true };
}

export async function deleteAdminUser(id: string): Promise<AdminUserFormState> {
  const current = await requireSuperAdmin();
  if (!current) return { error: "Unauthorized" };
  if (current.id === id) return { error: "ไม่สามารถลบตัวเองได้" };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("admin_users").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/admin-users");
  return { success: true };
}
