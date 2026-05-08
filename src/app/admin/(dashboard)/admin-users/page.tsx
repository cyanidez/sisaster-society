import { notFound } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import AdminUserManagement from "@/components/admin/AdminUserCRUD";

export const dynamic = "force-dynamic";

export default async function AdminUsersManagementPage() {
  const admin = await verifyAdminSession();
  if (!admin || admin.role !== "super_admin") notFound();

  const supabase = createAdminSupabaseClient();
  const { data: adminUsers } = await supabase
    .from("admin_users")
    .select("id, username, email, display_name, role, is_active, permissions, last_login_at, created_at")
    .order("created_at", { ascending: true });

  return (
    <AdminUserManagement
      adminUsers={adminUsers ?? []}
      currentId={admin.id}
    />
  );
}
