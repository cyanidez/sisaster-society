"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/lib/types";
import { Home, Users, Star, Menu, X, LogOut, User, Briefcase, ChevronDown, Gift } from "lucide-react";
import { SUPPORTED_YEARS } from "@/data/works";

const navLinks = [
  { href: "/", label: "หน้าแรก", icon: Home },
  { href: "/profile", label: "โปรไฟล์", icon: Users },
  { href: "/redeem", label: "Redeem", icon: Gift },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [worksOpen, setWorksOpen] = useState(false);
  const isWorksActive = pathname.startsWith("/works");

  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("members")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      } else {
        setProfile(null);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setProfile(null);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-pink-200/50 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white font-bold text-sm shadow-md">
              L
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-bold leading-none text-gray-900">LBNK48</span>
              <span className="text-xs text-pink-500 leading-none">Sisaster Sites</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === href
                    ? "bg-pink-50 text-pink-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}

            {/* งาน dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setWorksOpen(true)}
              onMouseLeave={() => setWorksOpen(false)}
            >
              <button
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isWorksActive
                    ? "bg-pink-50 text-pink-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Briefcase size={15} />
                งาน
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${worksOpen ? "rotate-180" : ""}`}
                />
              </button>

              {worksOpen && (
                <div className="absolute left-0 top-full pt-1 z-50">
                  <div className="rounded-xl border border-gray-100 bg-white shadow-lg py-1 min-w-[120px]">
                    {SUPPORTED_YEARS.map((year) => (
                      <Link
                        key={year}
                        href={`/works/${year}`}
                        onClick={() => setWorksOpen(false)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-pink-50 hover:text-pink-600 ${
                          pathname === `/works/${year}` ? "text-pink-600 font-semibold" : "text-gray-700"
                        }`}
                      >
                        {year}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Auth */}
          <div className="flex items-center gap-3">
            {profile ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard">
                  <Badge className="hidden sm:flex items-center gap-1 bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 cursor-pointer">
                    <Star size={11} className="fill-pink-500 text-pink-500" />
                    {profile.total_points.toLocaleString()} L-Point
                  </Badge>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-pink-200 ring-offset-1">
                      <AvatarImage src={profile.avatar_url ?? ""} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white text-xs">
                        {(profile.display_name ?? profile.username).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{profile.display_name ?? profile.username}</p>
                      <p className="text-xs text-pink-500">{profile.total_points.toLocaleString()} L-Point</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href="/dashboard" className="flex items-center w-full cursor-pointer">
                        <User size={14} className="mr-2" /> แดชบอร์ด
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/redeem" className="flex items-center w-full cursor-pointer">
                        <Gift size={14} className="mr-2" /> Redeem
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                      <LogOut size={14} className="mr-2" /> ออกจากระบบ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                  เข้าสู่ระบบ
                </Link>
                <Link href="/register" className={cn(buttonVariants({ size: "sm" }), "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white")}>
                  สมัครสมาชิก
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-pink-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                pathname === href ? "bg-pink-50 text-pink-600" : "text-gray-700"
              }`}
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
          {/* งาน sub-links */}
          <div className="px-3 pt-1 pb-0.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              <Briefcase size={12} /> งาน
            </p>
            <div className="pl-3 space-y-0.5">
              {SUPPORTED_YEARS.map((year) => (
                <Link
                  key={year}
                  href={`/works/${year}`}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-md px-2 py-1.5 text-sm ${
                    pathname === `/works/${year}` ? "bg-pink-50 text-pink-600 font-semibold" : "text-gray-600"
                  }`}
                >
                  {year}
                </Link>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100">
            {profile ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700">
                  <Star size={16} className="text-pink-500" />
                  {profile.total_points.toLocaleString()} L-Point
                </Link>
                <Link href="/redeem" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700">
                  <Gift size={16} className="text-pink-500" />
                  Redeem ของรางวัล
                </Link>
                <button onClick={handleSignOut} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-600">
                  <LogOut size={16} /> ออกจากระบบ
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block rounded-lg border border-gray-200 px-3 py-2 text-center text-sm text-gray-700">
                  เข้าสู่ระบบ
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="block rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-3 py-2 text-center text-sm text-white">
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
