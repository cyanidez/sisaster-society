import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { TimelineEvent } from "@/lib/types";
import { Clock, Star, Music, Users, Calendar, Trophy } from "lucide-react";

const eventTypeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  milestone:  { icon: Star,     color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Milestone" },
  music:      { icon: Music,    color: "bg-pink-100 text-pink-700 border-pink-200",       label: "เพลง" },
  concert:    { icon: Trophy,   color: "bg-purple-100 text-purple-700 border-purple-200", label: "Concert" },
  event:      { icon: Calendar, color: "bg-blue-100 text-blue-700 border-blue-200",       label: "Event" },
  audition:   { icon: Users,    color: "bg-green-100 text-green-700 border-green-200",    label: "Audition" },
  team:       { icon: Users,    color: "bg-rose-100 text-rose-700 border-rose-200",       label: "Team" },
  anniversary:{ icon: Star,     color: "bg-orange-100 text-orange-700 border-orange-200", label: "Anniversary" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("timeline_events")
    .select("*")
    .order("event_date", { ascending: true });

  const timelineEvents: TimelineEvent[] = events ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-pink-600 to-rose-600 text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 text-center">
          <Clock size={36} className="mx-auto mb-4 text-pink-200" />
          <h1 className="text-4xl font-black mb-2">ประวัติ LBNK48</h1>
          <p className="text-pink-200">เส้นทางของ Sisaster Team ตั้งแต่วันแรกจนถึงวันนี้</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        {timelineEvents.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Clock size={48} className="mx-auto mb-4 opacity-30" />
            <p>ยังไม่มีข้อมูล Timeline</p>
            <p className="text-sm mt-1">กรุณา Import ข้อมูลใน Supabase ก่อน</p>
          </div>
        ) : (
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-300 via-rose-200 to-pink-100 hidden sm:block" />

            <div className="space-y-8">
              {timelineEvents.map((event, idx) => {
                const cfg = eventTypeConfig[event.event_type] ?? eventTypeConfig.milestone;
                const Icon = cfg.icon;

                return (
                  <div key={event.id} className="relative flex gap-6">
                    {/* dot */}
                    <div className={`hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 z-10 ${
                      event.is_major
                        ? "bg-gradient-to-br from-pink-500 to-rose-600 border-pink-400 text-white shadow-md shadow-pink-200"
                        : "bg-white border-gray-200 text-gray-400"
                    }`}>
                      <Icon size={18} />
                    </div>

                    {/* content */}
                    <Card className={`flex-1 ${event.is_major ? "border-pink-200 shadow-sm" : ""}`}>
                      <CardContent className="p-5">
                        <div className="flex flex-wrap items-start gap-2 mb-2">
                          <Badge variant="outline" className={`text-xs ${cfg.color}`}>
                            {cfg.label}
                          </Badge>
                          {event.is_major && (
                            <Badge className="text-xs bg-pink-500 text-white">
                              <Star size={10} className="mr-1 fill-white" />
                              สำคัญ
                            </Badge>
                          )}
                          <span className="ml-auto text-xs text-gray-400">
                            {formatDate(event.event_date)}
                          </span>
                        </div>
                        <h3 className={`font-bold mb-1 ${event.is_major ? "text-lg text-gray-900" : "text-gray-800"}`}>
                          {event.title_th}
                        </h3>
                        {event.description_th && (
                          <p className="text-sm text-gray-500 leading-relaxed">{event.description_th}</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
