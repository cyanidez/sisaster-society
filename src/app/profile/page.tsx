import idol from "@/data/idol.json";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Droplets, Users } from "lucide-react";

function formatBirthday(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function calcAge(dateStr: string) {
  const birth = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function ProfilePage() {
  const age = calcAge(idol.birthday);
  const birthday = formatBirthday(idol.birthday);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 text-center">
          <Users size={36} className="mx-auto mb-4 text-rose-200" />
          <h1 className="text-4xl font-black mb-2">โปรไฟล์</h1>
          <p className="text-rose-200">{idol.team}</p>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <Card className="overflow-hidden shadow-lg">
          <div className="h-32 flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-500">
            <Avatar className="h-24 w-24 ring-4 ring-white shadow-md">
              <AvatarFallback className="text-3xl font-black text-white bg-gradient-to-br from-pink-500 to-rose-600">
                {idol.nickname.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black text-gray-900">{idol.nickname}</h2>
              <p className="text-gray-500 mt-1">
                {idol.firstName} {idol.lastName}
              </p>
              <div className="flex justify-center gap-2 mt-3">
                <Badge className="bg-pink-100 text-pink-700 border-pink-200">
                  {idol.team}
                </Badge>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  {idol.generation}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 text-sm border-t border-gray-100 pt-5">
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar size={15} className="text-pink-400 shrink-0" />
                <span>
                  {birthday} <span className="text-gray-400">({age} ปี)</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Droplets size={15} className="text-pink-400 shrink-0" />
                <span>กรุ๊บเลือด {idol.bloodType}</span>
              </div>
            </div>

            {idol.bio && (
              <div className="mt-5 border-t border-gray-100 pt-5">
                <p className="text-sm text-gray-600 leading-relaxed">{idol.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
