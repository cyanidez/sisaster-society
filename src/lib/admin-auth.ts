import crypto from "crypto";
import { cookies } from "next/headers";
import { createAdminSupabaseClient } from "./supabase/admin-client";
import { ADMIN_SESSION_COOKIE } from "./constants";

export { ADMIN_SESSION_COOKIE };
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export type { AdminPermission } from "./admin-permissions";
export { ALL_PERMISSIONS } from "./admin-permissions";
import type { AdminPermission } from "./admin-permissions";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  is_active: boolean;
  role: "admin" | "super_admin";
  permissions: AdminPermission[];
  last_login_at: string | null;
}

/** SHA-256 hash of a raw session token (stored in DB instead of raw value) */
export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/** Generate a cryptographically secure 32-byte random token */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Verify the admin session cookie against the DB.
 * Returns the admin user record on success, null otherwise.
 */
export async function verifyAdminSession(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);
  const supabase = createAdminSupabaseClient();

  const { data: session } = await supabase
    .from("admin_sessions")
    .select("expires_at, admin_users(*)")
    .eq("token_hash", tokenHash)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!session?.admin_users) return null;

  const admin = session.admin_users as unknown as AdminUser;
  if (!admin.is_active) return null;

  return admin;
}

/**
 * Create a new session for an admin, set HTTP-only cookie.
 */
export async function createAdminSession(
  adminId: string,
  meta: { ipAddress?: string; userAgent?: string } = {}
): Promise<void> {
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("admin_sessions").insert({
    admin_id: adminId,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
    ip_address: meta.ipAddress ?? null,
    user_agent: meta.userAgent ?? null,
  });

  if (error) throw new Error("Failed to create admin session");

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: expiresAt,
    path: "/admin",
  });
}

/**
 * Destroy the current admin session (DB row + cookie).
 */
export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (rawToken) {
    const tokenHash = hashToken(rawToken);
    const supabase = createAdminSupabaseClient();
    await supabase.from("admin_sessions").delete().eq("token_hash", tokenHash);
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
