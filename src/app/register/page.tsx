"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
// Button used as plain button (no asChild needed)
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { UserPlus, Eye, EyeOff, Star, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm_password: "",
    username: "",
    display_name: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirm_password) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (form.password.length < 6) {
      toast.error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          username: form.username,
          display_name: form.display_name || form.username,
        },
      },
    });

    if (error) {
      toast.error("สมัครสมาชิกไม่สำเร็จ", { description: error.message });
      setLoading(false);
      return;
    }

    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 px-4">
        <Card className="w-full max-w-md text-center border-pink-100 shadow-xl">
          <CardContent className="pt-10 pb-8 px-8">
            <CheckCircle size={56} className="mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">สมัครสมาชิกสำเร็จ!</h2>
            <p className="text-gray-500 mb-6">
              กรุณาตรวจสอบอีเมลของคุณ <span className="font-semibold text-gray-700">{form.email}</span>{" "}
              เพื่อยืนยันบัญชี
            </p>
            <button
              onClick={() => router.push("/login")}
              className="w-full rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-2 px-4 hover:from-pink-600 hover:to-rose-600 transition-all"
            >
              ไปหน้าเข้าสู่ระบบ
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white text-2xl font-black shadow-lg mb-4">
            L
          </div>
          <h1 className="text-2xl font-black text-gray-900">สมัครสมาชิก</h1>
          <p className="text-sm text-gray-500 mt-1">เพื่อเริ่มสะสม L-Point กับ LBNK48</p>
        </div>

        <Card className="border-pink-100 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus size={18} className="text-pink-500" />
              สร้างบัญชีใหม่
            </CardTitle>
            <CardDescription>กรอกข้อมูลเพื่อสร้างบัญชีของคุณ</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="sisaster_fan"
                    value={form.username}
                    onChange={set("username")}
                    required
                    className="border-pink-100 focus-visible:ring-pink-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="display_name">ชื่อที่แสดง</Label>
                  <Input
                    id="display_name"
                    placeholder="ชื่อเล่น"
                    value={form.display_name}
                    onChange={set("display_name")}
                    className="border-pink-100 focus-visible:ring-pink-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={set("email")}
                  required
                  className="border-pink-100 focus-visible:ring-pink-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    value={form.password}
                    onChange={set("password")}
                    required
                    className="border-pink-100 focus-visible:ring-pink-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm_password">ยืนยันรหัสผ่าน</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="••••••••"
                  value={form.confirm_password}
                  onChange={set("confirm_password")}
                  required
                  className="border-pink-100 focus-visible:ring-pink-400"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold"
              >
                {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-sm text-gray-500">
                มีบัญชีอยู่แล้ว?{" "}
                <Link href="/login" className="text-pink-600 font-semibold hover:underline">
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>

            <div className="mt-4 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 p-3">
              <p className="text-xs text-pink-700 font-semibold mb-1.5 flex items-center gap-1">
                <Star size={12} className="fill-pink-500 text-pink-500" />
                สิทธิพิเศษสำหรับสมาชิก
              </p>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• สะสม L-Point จากกิจกรรมต่างๆ</li>
                <li>• ดูประวัติ Point ย้อนหลัง</li>
                <li>• รับ Bonus Point จาก Event พิเศษ</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-gray-600">← กลับหน้าแรก</Link>
        </p>
      </div>
    </div>
  );
}
