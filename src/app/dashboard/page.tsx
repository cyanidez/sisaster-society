import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { PointTransaction, PointCategory } from "@/lib/types";
import {
  Star, TrendingUp, Gift, Clock, Zap,
  Heart, ShoppingBag, Gamepad2, Megaphone, Smartphone
} from "lucide-react";

const categoryIcons: Record<string, React.ElementType> = {
  donation: Heart,
  activity: Gamepad2,
  event: Megaphone,
  social: Smartphone,
  purchase: ShoppingBag,
  bonus: Star,
};

const LEVEL_THRESHOLDS = [
  { name: "Oshi Beginner", min: 0,    max: 499,   color: "#94a3b8", emoji: "🌱" },
  { name: "Sisaster Fan", min: 500,   max: 1999,  color: "#ec4899", emoji: "💗" },
  { name: "Sisaster Member", min: 2000, max: 4999, color: "#8b5cf6", emoji: "💜" },
  { name: "Sisaster Sister", min: 5000, max: 9999, color: "#f59e0b", emoji: "⭐" },
  { name: "Sisaster Legend", min: 10000, max: Infinity, color: "#ef4444", emoji: "👑" },
];

function getLevel(points: number) {
  return LEVEL_THRESHOLDS.find((l) => points >= l.min && points <= l.max) ?? LEVEL_THRESHOLDS[0];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function groupByCategory(transactions: PointTransaction[]) {
  const map: Record<string, number> = {};
  for (const tx of transactions) {
    const cat = tx.point_categories?.name ?? "unknown";
    map[cat] = (map[cat] ?? 0) + tx.points;
  }
  return map;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: transactions }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("point_transactions")
      .select("*, point_categories(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const totalPoints: number = profile?.total_points ?? 0;
  const txList: PointTransaction[] = transactions ?? [];
  const level = getLevel(totalPoints);
  const nextLevel = LEVEL_THRESHOLDS.find((l) => l.min > totalPoints);
  const progressPct = nextLevel
    ? Math.min(100, ((totalPoints - level.min) / (nextLevel.min - level.min)) * 100)
    : 100;

  const byCategory = groupByCategory(txList);
  const thisMonthPoints = txList
    .filter((t) => new Date(t.created_at).getMonth() === new Date().getMonth())
    .reduce((s, t) => s + t.points, 0);

  const initials = (profile?.display_name ?? profile?.username ?? "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 text-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16 ring-4 ring-white/30 shadow-lg">
              <AvatarFallback className="bg-white/20 text-white text-2xl font-black backdrop-blur-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-purple-200 text-sm">ยินดีต้อนรับกลับมา</p>
              <h1 className="text-2xl font-black">{profile?.display_name ?? profile?.username}</h1>
              <span className="inline-flex items-center gap-1 text-sm text-purple-200">
                {level.emoji} {level.name}
              </span>
            </div>
          </div>

          {/* Total Points */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
            <div className="flex items-end gap-2 mb-3">
              <Star size={20} className="text-yellow-300 fill-yellow-300 mb-0.5" />
              <span className="text-5xl font-black tabular-nums">{totalPoints.toLocaleString()}</span>
              <span className="text-purple-200 mb-1">L-Point</span>
            </div>

            {nextLevel ? (
              <>
                <div className="flex justify-between text-xs text-purple-200 mb-1.5">
                  <span>{level.emoji} {level.name}</span>
                  <span>อีก {(nextLevel.min - totalPoints).toLocaleString()} point → {nextLevel.emoji} {nextLevel.name}</span>
                </div>
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-orange-400 transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-yellow-300 text-sm font-semibold">👑 คุณถึง Level สูงสุดแล้ว!</p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Point เดือนนี้", value: thisMonthPoints.toLocaleString(), icon: TrendingUp, color: "text-pink-500", bg: "bg-pink-50" },
            { label: "รายการทั้งหมด", value: txList.length.toString(), icon: Clock, color: "text-purple-500", bg: "bg-purple-50" },
            { label: "Level ปัจจุบัน", value: level.emoji + " " + level.name.split(" ")[1], icon: Zap, color: "text-orange-500", bg: "bg-orange-50" },
            { label: "Point รวม", value: totalPoints.toLocaleString(), icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${bg} mb-3`}>
                  <Icon size={16} className={color} />
                </div>
                <div className="text-xl font-black text-gray-900">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Point by Category */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Gift size={16} className="text-pink-500" />
                Point แต่ละหมวด
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.keys(byCategory).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">ยังไม่มี Point</p>
              ) : (
                Object.entries(byCategory).map(([cat, pts]) => {
                  const Icon = categoryIcons[cat] ?? Star;
                  const maxPts = Math.max(...Object.values(byCategory));
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center gap-1.5 text-gray-700">
                          <Icon size={13} className="text-pink-400" />
                          {cat}
                        </span>
                        <span className="font-bold text-gray-900">{pts.toLocaleString()}</span>
                      </div>
                      <Progress value={(pts / maxPts) * 100} className="h-1.5" />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock size={16} className="text-pink-500" />
                ประวัติ L-Point
              </CardTitle>
            </CardHeader>
            <CardContent>
              {txList.length === 0 ? (
                <div className="text-center py-12">
                  <Star size={40} className="mx-auto mb-3 text-gray-200 fill-gray-100" />
                  <p className="text-gray-400 text-sm">ยังไม่มีประวัติ Point</p>
                  <p className="text-gray-300 text-xs mt-1">เริ่มสะสม L-Point จากกิจกรรมต่างๆ</p>
                </div>
              ) : (
                <div className="space-y-0 divide-y divide-gray-50">
                  {txList.map((tx) => {
                    const cat = tx.point_categories;
                    const Icon = categoryIcons[cat?.name ?? ""] ?? Star;
                    return (
                      <div key={tx.id} className="flex items-center gap-3 py-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-50">
                          <Icon size={14} className="text-pink-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {tx.description_th ?? tx.description}
                          </p>
                          <p className="text-xs text-gray-400">{formatDate(tx.created_at)}</p>
                        </div>
                        <Badge
                          className={`shrink-0 font-bold tabular-nums ${
                            tx.points >= 0
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                          variant="outline"
                        >
                          {tx.points >= 0 ? "+" : ""}{tx.points.toLocaleString()}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Level Guide */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">ระดับ L-Point</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {LEVEL_THRESHOLDS.map((l) => {
                const isCurrentLevel = totalPoints >= l.min && totalPoints <= l.max;
                return (
                  <div
                    key={l.name}
                    className={`rounded-xl p-3 text-center border-2 transition-all ${
                      isCurrentLevel
                        ? "border-pink-400 bg-pink-50 shadow-md"
                        : totalPoints > l.max
                        ? "border-gray-100 bg-gray-50 opacity-50"
                        : "border-gray-100 bg-white"
                    }`}
                  >
                    <div className="text-2xl mb-1">{l.emoji}</div>
                    <div className="text-xs font-bold text-gray-900">{l.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {l.max === Infinity ? `${l.min.toLocaleString()}+` : `${l.min.toLocaleString()}–${l.max.toLocaleString()}`}
                    </div>
                    {isCurrentLevel && (
                      <Badge className="mt-1.5 text-xs bg-pink-500 text-white">ระดับปัจจุบัน</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
