import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { Search, Star, ChevronRight, Users } from "lucide-react";

export const dynamic = "force-dynamic";

interface UserRow {
  id: string;
  username: string;
  display_name: string | null;
  email: string | null;
  total_points: number;
  created_at: string;
  tx_count: number;
  last_tx_at: string | null;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getLevel(pts: number) {
  if (pts >= 10000) return { emoji: "👑", label: "Legend" };
  if (pts >= 5000) return { emoji: "⭐", label: "Sister" };
  if (pts >= 2000) return { emoji: "💜", label: "Member" };
  if (pts >= 500) return { emoji: "💗", label: "Fan" };
  return { emoji: "🌱", label: "Beginner" };
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = createAdminSupabaseClient();

  // Fetch all profiles with transaction count and last transaction date
  let query = supabase
    .from("profiles")
    .select(`
      id, username, display_name, email, total_points, created_at,
      point_transactions(count)
    `)
    .order("total_points", { ascending: false });

  if (q) {
    query = query.or(
      `username.ilike.%${q}%,display_name.ilike.%${q}%,email.ilike.%${q}%`
    );
  }

  const { data: raw } = await query;

  // Build flat rows
  const users: UserRow[] = (raw ?? []).map((r) => ({
    id: r.id,
    username: r.username,
    display_name: r.display_name,
    email: r.email,
    total_points: r.total_points ?? 0,
    created_at: r.created_at,
    tx_count: Array.isArray(r.point_transactions)
      ? (r.point_transactions[0] as { count: number })?.count ?? 0
      : 0,
    last_tx_at: null,
  }));

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users size={20} className="text-pink-400" />
            จัดการ Users
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {users.length} บัญชีในระบบ
          </p>
        </div>

        {/* Search */}
        <form method="GET" className="relative w-full sm:w-64">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            name="q"
            defaultValue={q}
            placeholder="ค้นหา username / email..."
            className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2 pl-8 pr-3 text-sm text-white placeholder-gray-600 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/40"
          />
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-950/60">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                User
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                L-Point
              </th>
              <th className="hidden sm:table-cell px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                Level
              </th>
              <th className="hidden md:table-cell px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                ธุรกรรม
              </th>
              <th className="hidden lg:table-cell px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                สมัครเมื่อ
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-gray-600">
                  ไม่พบผู้ใช้งาน
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const level = getLevel(user.total_points);
                const initials = (user.display_name ?? user.username)
                  .charAt(0)
                  .toUpperCase();
                return (
                  <tr
                    key={user.id}
                    className="group transition-colors hover:bg-gray-800/40"
                  >
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-700 to-rose-800 text-xs font-bold text-white">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">
                            {user.display_name ?? user.username}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Points */}
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 font-bold tabular-nums text-pink-400">
                        <Star size={11} className="fill-pink-400" />
                        {user.total_points.toLocaleString()}
                      </span>
                    </td>

                    {/* Level */}
                    <td className="hidden sm:table-cell px-5 py-3.5 text-center">
                      <span className="text-xs">
                        {level.emoji} {level.label}
                      </span>
                    </td>

                    {/* Tx count */}
                    <td className="hidden md:table-cell px-5 py-3.5 text-right tabular-nums text-gray-400">
                      {user.tx_count}
                    </td>

                    {/* Joined */}
                    <td className="hidden lg:table-cell px-5 py-3.5 text-right text-gray-500">
                      {formatDate(user.created_at)}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-700 bg-gray-800 px-2.5 py-1 text-xs text-gray-300 transition hover:border-pink-600/60 hover:bg-pink-950/40 hover:text-pink-400"
                      >
                        จัดการ
                        <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
