import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star, Users, Clock, ChevronRight, Music, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { label: "สมาชิก", value: "8", icon: Users, color: "text-pink-500" },
  { label: "ซิงเกิล", value: "4+", icon: Music, color: "text-rose-500" },
  { label: "ปีที่ก่อตั้ง", value: "2022", icon: Clock, color: "text-purple-500" },
  { label: "แฟนคลับ", value: "10K+", icon: Heart, color: "text-red-500" },
];

const highlights = [
  {
    title: "Sisaster Team",
    desc: "ทีมแรกของ LBNK48 ประกอบด้วยสมาชิก 8 คนที่ผ่านการออดิชั่นรุ่นที่ 1",
    icon: "💝",
    href: "/members",
  },
  {
    title: "ประวัติและ Timeline",
    desc: "ติดตามเส้นทางของ LBNK48 ตั้งแต่วันก่อตั้งจนถึงปัจจุบัน",
    icon: "📖",
    href: "/history",
  },
  {
    title: "L-Point System",
    desc: "สะสม L-Point จากการโดเนท เล่นกิจกรรม และร่วม Event ต่างๆ",
    icon: "⭐",
    href: "/dashboard",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-600 via-rose-500 to-pink-700 text-white">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30 border-white/30 backdrop-blur-sm">
            <Sparkles size={12} className="mr-1" />
            Official Fan Site
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-4">
            LBNK
            <span className="text-yellow-300">48</span>
          </h1>

          <p className="text-xl sm:text-2xl font-semibold text-pink-100 mb-2">
            Sisaster Team
          </p>
          <p className="text-base text-pink-200 mb-10 max-w-md mx-auto leading-relaxed">
            ยินดีต้อนรับสู่ Sisaster Sites<br />
            ศูนย์รวมข้อมูลและประวัติของ LBNK48
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/members" className={cn(buttonVariants({ size: "lg" }), "bg-white text-pink-600 hover:bg-pink-50 font-bold shadow-lg")}>
              <Users size={16} className="mr-2" />
              ดูสมาชิก
            </Link>
            <Link href="/history" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "border-white/50 text-white hover:bg-white/10 backdrop-blur-sm")}>
              <Clock size={16} className="mr-2" />
              ประวัติ LBNK48
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative bg-black/20 backdrop-blur-sm border-t border-white/20">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="text-center">
                  <Icon size={18} className={`mx-auto mb-1 ${color}`} />
                  <div className="text-2xl font-black text-white">{value}</div>
                  <div className="text-xs text-pink-200">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900 mb-2">สำรวจ Sisaster Sites</h2>
          <p className="text-gray-500">ทุกอย่างที่คุณต้องรู้เกี่ยวกับ LBNK48</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {highlights.map(({ title, desc, icon, href }) => (
            <Link key={title} href={href}>
              <Card className="group h-full cursor-pointer border-2 border-transparent hover:border-pink-200 transition-all hover:shadow-lg hover:-translate-y-0.5">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{desc}</p>
                  <span className="inline-flex items-center text-sm text-pink-500 font-medium">
                    ดูเพิ่มเติม <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* L-Point CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 text-center">
          <Star size={40} className="mx-auto mb-4 text-yellow-300 fill-yellow-300" />
          <h2 className="text-3xl font-black mb-3">สะสม L-Point วันนี้!</h2>
          <p className="text-purple-200 mb-8 max-w-sm mx-auto">
            เก็บ L-Point จากการโดเนท เล่นกิจกรรม และร่วม Event ต่างๆ แล้วแลกของรางวัลพิเศษ
          </p>
          <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "bg-white text-purple-600 hover:bg-purple-50 font-bold")}>
            <Star size={16} className="mr-2" />
            สมัครสมาชิกฟรี
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-8 text-sm">
        <p className="font-bold text-white mb-1">LBNK48 Sisaster Sites</p>
        <p>© 2024 Sisaster Team Fan Site · ไม่ใช่เว็บไซต์ทางการ</p>
      </footer>
    </div>
  );
}
