"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { toggleMemberActive, } from "@/app/actions/admin-points";
import { bulkSetMemberStatus } from "@/app/actions/admin-members";
import { EditMemberButton, DeleteMemberButton } from "@/components/admin/MemberCRUD";
import { Star, ChevronRight, UserCheck, UserX, X } from "lucide-react";

interface UserRow {
  id: string;
  username: string;
  display_name: string | null;
  email: string | null;
  total_points: number;
  is_active: boolean;
  created_at: string;
  tx_count: number;
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

function ToggleSwitch({ id, isActive }: { id: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      onClick={async (e) => {
        e.stopPropagation();
        setLoading(true);
        await toggleMemberActive(id, !isActive);
        setLoading(false);
      }}
      disabled={loading}
      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 focus:outline-none"
      style={{ backgroundColor: isActive ? "#16a34a" : "#dc2626" }}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${isActive ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export default function MemberListTable({ users }: { users: UserRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const allIds = users.map((u) => u.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0 && !allSelected;

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(allIds));
  };

  const clearSelection = () => setSelected(new Set());

  const handleBulk = async (isActive: boolean) => {
    setBulkLoading(true);
    await bulkSetMemberStatus(Array.from(selected), isActive);
    setBulkLoading(false);
    setSelected(new Set());
  };

  return (
    <div className="relative">
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5">
          <span className="text-sm text-gray-300">
            เลือก <span className="font-semibold text-white">{selected.size}</span> คน
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => handleBulk(true)}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              <UserCheck size={13} />
              Set Active
            </button>
            <button
              onClick={() => handleBulk(false)}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 rounded-lg bg-red-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              <UserX size={13} />
              Set Inactive
            </button>
            <button
              onClick={clearSelection}
              className="rounded-lg border border-gray-600 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-700 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-950/60">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-800 accent-pink-500 cursor-pointer"
                />
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-300">User</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-300">L-Point</th>
              <th className="hidden sm:table-cell px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-300">Level</th>
              <th className="hidden sm:table-cell px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-300">Status</th>
              <th className="hidden md:table-cell px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-300">ธุรกรรม</th>
              <th className="hidden lg:table-cell px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-300">สมัครเมื่อ</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-14 text-center text-gray-400">
                  ไม่พบผู้ใช้งาน
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const level = getLevel(user.total_points);
                const initials = (user.display_name ?? user.username).charAt(0).toUpperCase();
                const isChecked = selected.has(user.id);

                return (
                  <tr
                    key={user.id}
                    className={`group transition-colors hover:bg-gray-800/40 ${isChecked ? "bg-pink-950/10" : ""}`}
                  >
                    <td className="w-10 px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOne(user.id)}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-800 accent-pink-500 cursor-pointer"
                      />
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-700 to-rose-800 text-xs font-bold text-white">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">{user.display_name ?? user.username}</p>
                          <p className="truncate text-xs text-gray-300">@{user.username}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 font-bold tabular-nums text-pink-400">
                        <Star size={11} className="fill-pink-400" />
                        {user.total_points.toLocaleString()}
                      </span>
                    </td>

                    <td className="hidden sm:table-cell px-5 py-3.5 text-center">
                      <span className="text-xs">{level.emoji} {level.label}</span>
                    </td>

                    <td className="hidden sm:table-cell px-5 py-3.5 text-center">
                      <ToggleSwitch id={user.id} isActive={user.is_active} />
                    </td>

                    <td className="hidden md:table-cell px-5 py-3.5 text-right tabular-nums text-gray-400">
                      {user.tx_count}
                    </td>

                    <td className="hidden lg:table-cell px-5 py-3.5 text-right text-gray-300">
                      {formatDate(user.created_at)}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-700 bg-gray-800 px-2.5 py-1 text-xs text-gray-300 transition hover:border-pink-600/60 hover:bg-pink-950/40 hover:text-pink-400"
                        >
                          จัดการ
                          <ChevronRight size={12} />
                        </Link>
                        <EditMemberButton member={user} />
                        <DeleteMemberButton id={user.id} username={user.username} />
                      </div>
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
