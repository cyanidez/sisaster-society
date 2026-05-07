import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Member } from "@/lib/types";
import { Users, Star, Calendar, MapPin, Ruler } from "lucide-react";

function formatBirthday(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("th-TH", { day: "numeric", month: "long" });
}

function calcAge(dateStr: string | null) {
  if (!dateStr) return null;
  const birth = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default async function MembersPage() {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("members")
    .select("*")
    .order("generation", { ascending: true })
    .order("name", { ascending: true });

  const allMembers: Member[] = members ?? [];
  const active = allMembers.filter((m) => m.is_active);
  const graduated = allMembers.filter((m) => !m.is_active);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 text-center">
          <Users size={36} className="mx-auto mb-4 text-rose-200" />
          <h1 className="text-4xl font-black mb-2">สมาชิก LBNK48</h1>
          <p className="text-rose-200">Sisaster Team · รุ่นที่ 1</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Active Members */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-black text-gray-900">สมาชิกปัจจุบัน</h2>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              {active.length} คน
            </Badge>
          </div>

          {active.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users size={48} className="mx-auto mb-4 opacity-30" />
              <p>ยังไม่มีข้อมูลสมาชิก</p>
              <p className="text-sm mt-1">กรุณา Import ข้อมูลใน Supabase ก่อน</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {active.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </div>

        {/* Graduated Members */}
        {graduated.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-black text-gray-900">สมาชิกที่จบไปแล้ว</h2>
              <Badge variant="outline" className="text-gray-500">
                {graduated.length} คน
              </Badge>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {graduated.map((member) => (
                <MemberCard key={member.id} member={member} graduated />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MemberCard({ member, graduated = false }: { member: Member; graduated?: boolean }) {
  const initials = member.nickname.charAt(0).toUpperCase();
  const age = calcAge(member.birthday);
  const birthday = formatBirthday(member.birthday);

  return (
    <Card className={`group overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg ${
      graduated ? "opacity-70 grayscale hover:grayscale-0 hover:opacity-100" : ""
    }`}>
      {/* Color header */}
      <div
        className="h-24 flex items-center justify-center relative"
        style={{ background: `linear-gradient(135deg, ${member.color ?? "#ec4899"}, ${member.color ?? "#f43f5e"}99)` }}
      >
        <Avatar className="h-20 w-20 ring-4 ring-white shadow-md">
          <AvatarFallback
            className="text-2xl font-black text-white"
            style={{ background: `linear-gradient(135deg, ${member.color ?? "#ec4899"}, #be185d)` }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        {graduated && (
          <Badge className="absolute top-2 right-2 bg-gray-700 text-white text-xs">
            Graduated
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="text-center mb-3">
          <h3 className="font-black text-lg text-gray-900">{member.nickname_th ?? member.nickname}</h3>
          <p className="text-xs text-gray-500">{member.name}</p>
        </div>

        <div className="space-y-1.5 text-xs text-gray-600">
          {birthday && (
            <div className="flex items-center gap-1.5">
              <Calendar size={11} className="text-pink-400 shrink-0" />
              <span>{birthday}{age ? ` (${age} ปี)` : ""}</span>
            </div>
          )}
          {member.birthplace && (
            <div className="flex items-center gap-1.5">
              <MapPin size={11} className="text-pink-400 shrink-0" />
              <span>{member.birthplace}</span>
            </div>
          )}
          {member.height_cm && (
            <div className="flex items-center gap-1.5">
              <Ruler size={11} className="text-pink-400 shrink-0" />
              <span>{member.height_cm} cm</span>
            </div>
          )}
        </div>

        {member.bio_th && (
          <p className="mt-3 text-xs text-gray-500 leading-relaxed line-clamp-3 border-t border-gray-100 pt-3">
            {member.bio_th}
          </p>
        )}

        <div className="mt-3 flex items-center justify-center gap-1">
          <Badge
            variant="outline"
            className="text-xs border-pink-200 text-pink-600"
            style={{ borderColor: `${member.color ?? "#ec4899"}66`, color: member.color ?? "#ec4899" }}
          >
            <Star size={9} className="mr-1" />
            Gen {member.generation}
          </Badge>
          {member.team && (
            <Badge variant="outline" className="text-xs">
              {member.team}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
