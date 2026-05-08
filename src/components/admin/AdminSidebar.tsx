"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminSignOut } from "@/app/actions/admin-auth";
import type { AdminUser } from "@/lib/admin-auth";
import type { AdminPermission } from "@/lib/admin-permissions";
import { Users, LogOut, Shield, ChevronRight, Star, Crown, Tag, Gift, Trophy } from "lucide-react";

const navItems: { href: string; label: string; icon: React.ElementType; permission?: AdminPermission; superAdminOnly?: boolean }[] = [
  { href: "/admin/users",       label: "Member Management", icon: Users,   permission: "member_management" },
  { href: "/admin/events",      label: "Event Management",  icon: Star,    permission: "event_management" },
  { href: "/admin/categories",  label: "Categories",        icon: Tag,     permission: "event_management" },
  { href: "/admin/ranks",       label: "Rank System",       icon: Trophy,  permission: "member_management" },
  { href: "/admin/rewards",     label: "Redeem",            icon: Gift,    permission: "redeem_management" },
  { href: "/admin/admin-users", label: "Admin Users",       icon: Crown,   superAdminOnly: true },
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
          <p className="text-[10px] text-gray-300 leading-none mt-0.5">LBNK48 Sisaster</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.filter(item => {
          if (item.superAdminOnly) return admin.role === "super_admin";
          if (item.permission) return admin.role === "super_admin" || admin.permissions.includes(item.permission);
          return true;
        }).map(({ href, label, icon: Icon }) => {
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
            <p className="truncate text-[10px] text-gray-300">{admin.email}</p>
          </div>
        </div>
        <form action={adminSignOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-300 hover:bg-red-950/40 hover:text-red-400 transition-colors"
          >
            <LogOut size={13} />
            ออกจากระบบ
          </button>
        </form>
      </div>
    </aside>
  );
}
