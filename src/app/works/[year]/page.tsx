import { notFound } from "next/navigation";
import Link from "next/link";
import { getWorksByYear, SUPPORTED_YEARS } from "@/data/works";
import { Briefcase, Calendar, ChevronRight, Clock } from "lucide-react";

const MONTH_EN: Record<string, string> = {
  มกราคม: "JAN", กุมภาพันธ์: "FEB", มีนาคม: "MAR", เมษายน: "APR",
  พฤษภาคม: "MAY", มิถุนายน: "JUN", กรกฎาคม: "JUL", สิงหาคม: "AUG",
  กันยายน: "SEP", ตุลาคม: "OCT", พฤศจิกายน: "NOV", ธันวาคม: "DEC",
};

const MONTH_COLORS: Record<number, string> = {
  1:  "from-rose-500 to-pink-600",
  2:  "from-pink-500 to-fuchsia-600",
  3:  "from-violet-500 to-purple-600",
  4:  "from-blue-500 to-cyan-600",
  5:  "from-emerald-500 to-green-600",
  6:  "from-yellow-500 to-amber-600",
  7:  "from-orange-500 to-red-600",
  8:  "from-rose-600 to-pink-700",
  9:  "from-purple-500 to-violet-600",
  10: "from-amber-500 to-orange-600",
  11: "from-teal-500 to-cyan-600",
  12: "from-indigo-500 to-blue-600",
};

export function generateStaticParams() {
  return SUPPORTED_YEARS.map((year) => ({ year: String(year) }));
}

export default async function WorksByYearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);

  if (!SUPPORTED_YEARS.includes(year as (typeof SUPPORTED_YEARS)[number])) {
    notFound();
  }

  const data = getWorksByYear(year);

  const totalEvents = data?.months.reduce((s, m) => s + m.events.length, 0) ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-pink-600 via-rose-500 to-pink-700 text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <div className="flex items-center gap-2 text-pink-200 text-sm mb-4">
            <Briefcase size={14} />
            <span>งานของ LBNK48</span>
          </div>
          <h1 className="text-4xl font-black mb-2">งานปี {year}</h1>
          {data && (
            <p className="text-pink-200">
              {data.months.length} เดือน · {totalEvents} งาน
            </p>
          )}

          {/* Year switcher */}
          <div className="mt-6 flex gap-2 flex-wrap">
            {SUPPORTED_YEARS.map((y) => (
              <Link
                key={y}
                href={`/works/${y}`}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                  y === year
                    ? "bg-white text-pink-600 shadow-md"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                {y}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {!data ? (
          /* No data yet */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <Clock size={36} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              ยังไม่มีข้อมูลปี {year}
            </h2>
            <p className="text-gray-400 text-sm max-w-xs">
              ข้อมูลงานของปีนี้จะถูกเพิ่มเมื่อมีข้อมูลพร้อม
            </p>
            <Link
              href="/works/2024"
              className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold text-white hover:bg-pink-600 transition-colors"
            >
              ดูงานปี 2024
              <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {data.months.map((month) => {
              const gradient = MONTH_COLORS[month.monthIndex] ?? "from-pink-500 to-rose-600";
              const abbr = MONTH_EN[month.month] ?? "";

              return (
                <section key={month.month} id={`month-${month.monthIndex}`}>
                  {/* Month header */}
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-md`}
                    >
                      <span className="text-[10px] font-bold leading-none opacity-80">{abbr}</span>
                      <span className="text-xs font-black leading-tight">{year}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-gray-900">
                        {month.month}
                      </h2>
                      <p className="text-xs text-gray-400">
                        {month.events.length} งาน
                      </p>
                    </div>
                  </div>

                  {/* Events */}
                  <div className="ml-0 sm:ml-[72px] space-y-2">
                    {month.events.map((ev, idx) => (
                      <div
                        key={idx}
                        className="group flex gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm transition-all hover:border-pink-200 hover:shadow-md"
                      >
                        {/* Day badge */}
                        <div className="flex shrink-0 flex-col items-center">
                          <Calendar size={12} className="text-pink-400 mb-0.5" />
                          <span className="text-xs font-bold text-pink-500 tabular-nums whitespace-nowrap">
                            {ev.day}
                          </span>
                        </div>

                        {/* Divider */}
                        <div className="w-px bg-gray-100 shrink-0" />

                        {/* Event name */}
                        <p className="text-sm text-gray-800 leading-relaxed group-hover:text-gray-900">
                          {ev.event}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Month quick-jump (only when there's data) */}
      {data && (
        <div className="sticky bottom-4 flex justify-center pointer-events-none">
          <div className="pointer-events-auto flex gap-1 flex-wrap justify-center max-w-lg rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm px-3 py-2 shadow-lg">
            {data.months.map((m) => (
              <a
                key={m.monthIndex}
                href={`#month-${m.monthIndex}`}
                className="rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-pink-50 hover:text-pink-600 transition-colors"
              >
                {m.month.slice(0, 3)}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
