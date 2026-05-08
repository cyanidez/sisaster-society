"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { verifyAdminSession } from "@/lib/admin-auth";

export interface MemberFormState {
  error?: string;
  success?: boolean;
}

export async function createMember(
  _prev: MemberFormState | null,
  formData: FormData
): Promise<MemberFormState> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string);
  const username = (formData.get("username") as string)?.trim();
  const displayName = (formData.get("display_name") as string)?.trim() || null;

  if (!email || !password || !username) return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  if (password.length < 6) return { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" };

  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, display_name: displayName },
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: "สร้าง user ไม่สำเร็จ" };

  // Insert into members directly (don't rely on trigger)
  const { error: dbError } = await supabase.from("members").upsert({
    id: data.user.id,
    email,
    username,
    display_name: displayName,
    total_points: 0,
    is_active: true,
  });

  if (dbError) {
    // Rollback: delete the auth user if members insert fails
    await supabase.auth.admin.deleteUser(data.user.id);
    return { error: dbError.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateMember(
  _prev: MemberFormState | null,
  formData: FormData
): Promise<MemberFormState> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const id = (formData.get("id") as string)?.trim();
  const username = (formData.get("username") as string)?.trim();
  const displayName = (formData.get("display_name") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim();
  const newPassword = (formData.get("password") as string)?.trim() || null;

  if (!id || !username || !email) return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };

  const supabase = createAdminSupabaseClient();

  const authUpdate: { email?: string; password?: string } = { email };
  if (newPassword) {
    if (newPassword.length < 6) return { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" };
    authUpdate.password = newPassword;
  }

  const [{ error: authError }, { error: dbError }] = await Promise.all([
    supabase.auth.admin.updateUserById(id, authUpdate),
    supabase.from("members").update({
      username,
      display_name: displayName,
      email,
      updated_at: new Date().toISOString(),
    }).eq("id", id),
  ]);

  if (authError) return { error: authError.message };
  if (dbError) return { error: dbError.message };

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
  return { success: true };
}

export async function deleteMember(id: string): Promise<MemberFormState> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.auth.admin.deleteUser(id);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}

export async function bulkSetMemberStatus(
  ids: string[],
  isActive: boolean
): Promise<MemberFormState> {
  const admin = await verifyAdminSession();
  if (!admin) return { error: "Unauthorized" };
  if (!ids.length) return { error: "ไม่มี Member ที่เลือก" };

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("members")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .in("id", ids);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}
