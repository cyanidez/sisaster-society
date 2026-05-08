"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { LogIn, Eye, EyeOff, Star } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error("เข้าสู่ระบบไม่สำเร็จ", { description: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
      setLoading(false);
      return;
    }

    toast.success("เข้าสู่ระบบสำเร็จ!");
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white text-2xl font-black shadow-lg mb-4">
            L
          </div>
          <h1 className="text-2xl font-black text-gray-900">LBNK48 Sisaster</h1>
          <p className="text-sm text-gray-500 mt-1">เข้าสู่ระบบเพื่อเช็ค L-Point ของคุณ</p>
        </div>

        <Card className="border-pink-100 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <LogIn size={18} className="text-pink-500" />
              เข้าสู่ระบบ
            </CardTitle>
            <CardDescription>กรอกอีเมลและรหัสผ่านของคุณ</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold"
              >
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-sm text-gray-500">
                ยังไม่มีบัญชี?{" "}
                <Link href="/register" className="text-pink-600 font-semibold hover:underline">
                  สมัครสมาชิกฟรี
                </Link>
              </p>
            </div>

            <div className="mt-4 rounded-xl bg-pink-50 border border-pink-100 p-3 flex items-start gap-2">
              <Star size={14} className="text-pink-500 fill-pink-400 mt-0.5 shrink-0" />
              <p className="text-xs text-pink-700 leading-relaxed">
                สมาชิกจะได้รับ L-Point จากการโดเนท เล่นกิจกรรม และร่วม Event ต่างๆ
              </p>
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
