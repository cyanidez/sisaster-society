"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminSignOut } from "@/app/actions/admin-auth";
import type { AdminUser } from "@/lib/admin-auth";
import { Users, LayoutDashboard, LogOut, Shield, ChevronRight } from "lucide-react";

const navItems = [
  { href: "/admin/users", label: "จัดการ Users", icon: Users },
];

export default function AdminSidebar({ admin }: { admin: AdminUser }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-gray-800 bg-gray-950">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-gray-800 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600">
          <Shield size={15} className="text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-white leading-none">Admin Panel</p>
          <p className="text-[10px] text-gray-500 leading-none mt-0.5">LBNK48 Sisaster</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-pink-950/60 text-pink-400"
                  : "text-gray-400 hover:bg-gray-900 hover:text-gray-200"
              }`}
            >
              <Icon size={15} />
              {label}
              {active && <ChevronRight size={13} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Admin info + sign out */}
      <div className="border-t border-gray-800 p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 mb-1">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pink-900/50 text-xs font-bold text-pink-400">
            {(admin.display_name ?? admin.username).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">
              {admin.display_name ?? admin.username}
            </p>
            <p className="truncate text-[10px] text-gray-500">{admin.email}</p>
          </div>
        </div>
        <form action={adminSignOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-500 hover:bg-red-950/40 hover:text-red-400 transition-colors"
          >
            <LogOut size={13} />
            ออกจากระบบ
          </button>
        </form>
      </div>
    </aside>
  );
}
