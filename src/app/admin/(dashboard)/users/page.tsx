import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { verifyAdminSession } from "@/lib/admin-auth";
import { Search, Users } from "lucide-react";
import { CreateMemberButton } from "@/components/admin/MemberCRUD";
import MemberListTable from "@/components/admin/MemberListTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const admin = await verifyAdminSession();
  if (!admin || (admin.role !== "super_admin" && !admin.permissions.includes("member_management"))) notFound();

  const { q } = await searchParams;
  const supabase = createAdminSupabaseClient();

  let query = supabase
    .from("members")
    .select(`
      id, username, display_name, email, total_points, is_active, created_at,
      point_transactions(count)
    `)
    .order("total_points", { ascending: false });

  if (q) {
    query = query.or(
      `username.ilike.%${q}%,display_name.ilike.%${q}%,email.ilike.%${q}%`
    );
  }

  const { data: raw } = await query;

  const users = (raw ?? []).map((r) => ({
    id: r.id,
    username: r.username,
    display_name: r.display_name,
    email: r.email,
    total_points: r.total_points ?? 0,
    is_active: r.is_active ?? true,
    created_at: r.created_at,
    tx_count: Array.isArray(r.point_transactions)
      ? (r.point_transactions[0] as { count: number })?.count ?? 0
      : 0,
  }));

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users size={20} className="text-pink-400" />
            Member Management
          </h1>
          <p className="text-sm text-gray-300 mt-0.5">{users.length} บัญชีในระบบ</p>
        </div>
        <div className="flex items-center gap-3">
          <form method="GET" className="relative w-full sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              name="q"
              defaultValue={q}
              placeholder="ค้นหา username / email..."
              className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2 pl-8 pr-3 text-sm text-white placeholder-gray-600 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/40"
            />
          </form>
          <CreateMemberButton />
        </div>
      </div>

      <MemberListTable users={users} />
    </div>
  );
}
