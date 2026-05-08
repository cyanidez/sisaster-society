"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteEvent, toggleEventActive } from "@/app/actions/admin-events";
import { Plus, SquarePen, Trash2, Star, Users } from "lucide-react";

interface Category {
  id: string;
  name: string;
  name_th: string;
  icon: string | null;
  is_active: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  points: number;
  icon: string;
  is_active: boolean;
  category_id: string | null;
  start_date: string | null;
  end_date: string | null;
  max_per_user: number | null;
  condition_label: string | null;
  condition_value: number | null;
  condition_unit: string | null;
  multiplier: number;
  is_accumulation: boolean;
  created_at: string;
}

function DeleteButton({ id }: { id: string }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await deleteEvent(id);
  };

  if (confirm) {
    return (
      <div className="flex gap-1">
        <button
          onClick={() => setConfirm(false)}
          className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-700"
        >
          ยกเลิก
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded bg-red-900/60 px-2 py-1 text-xs text-red-400 hover:bg-red-900 disabled:opacity-50"
        >
          {loading ? "..." : "ยืนยันลบ"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="rounded p-1.5 text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors"
    >
      <Trash2 size={14} />
    </button>
  );
}

function ToggleSwitch({ id, isActive }: { id: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={async () => { setLoading(true); await toggleEventActive(id, !isActive); setLoading(false); }}
      disabled={loading}
      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 focus:outline-none"
      style={{ backgroundColor: isActive ? "#16a34a" : "#dc2626" }}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${isActive ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export default function EventManagement({
  events,
  categories,
}: {
  events: Event[];
  categories: Category[];
}) {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Star size={20} className="text-pink-400" />
            Event Management
          </h1>
          <p className="text-sm text-gray-300 mt-0.5">วิธีที่แฟนคลับจะได้รับ L-Point</p>
        </div>
        <Link
          href="/admin/events/new"
          className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 transition-colors"
        >
          <Plus size={15} />
          เพิ่ม Event
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        {events.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Star size={40} className="mx-auto mb-3 opacity-20" />
            <p>ยังไม่มี Event</p>
            <p className="text-xs mt-1">กดปุ่ม "เพิ่ม Event" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-950/60">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-300">Event</th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-300">L-Point</th>
                <th className="hidden md:table-cell px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-300">หมวดหมู่</th>
                <th className="hidden lg:table-cell px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-300">ช่วงเวลา</th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-300">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {events.map((event) => (
                <tr key={event.id} className="group hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{event.icon}</span>
                      <div>
                        <p className="font-medium text-white">{event.title}</p>
                        {event.description && (
                          <p className="text-xs text-gray-300 line-clamp-1 max-w-xs">{event.description}</p>
                        )}
                        {event.condition_label && (
                          <p className="text-xs text-amber-400 mt-0.5">
                            🎯 {event.condition_label}
                            {event.condition_value != null ? ` ${event.condition_value}` : ""}
                            {event.condition_unit ? ` ${event.condition_unit}` : ""}
                            {event.is_accumulation && <span className="ml-1 text-blue-400">· สะสม</span>}
                          </p>
                        )}
                        {event.max_per_user && (
                          <p className="text-xs text-purple-400 mt-0.5">
                            <Users size={10} className="inline mr-0.5" />
                            จำกัด {event.max_per_user} ครั้ง/คน
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`font-bold tabular-nums ${event.points >= 0 ? "text-pink-400" : "text-red-400"}`}>
                      {event.points >= 0 ? "+" : ""}{event.points.toLocaleString()}
                    </span>
                    {event.multiplier > 1 && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-900/50 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                        ⚡x{event.multiplier}
                      </span>
                    )}
                  </td>
                  <td className="hidden md:table-cell px-5 py-3.5 text-xs">
                    {(() => {
                      const cat = categories.find(c => c.id === event.category_id);
                      if (!cat) return <span className="text-gray-300">—</span>;
                      return (
                        <span className={`flex items-center gap-1.5 ${cat.is_active ? "text-gray-400" : "text-gray-400"}`}>
                          {cat.icon} {cat.name_th}
                          {!cat.is_active && (
                            <span className="rounded-full bg-red-950/50 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
                              Inactive
                            </span>
                          )}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="hidden lg:table-cell px-5 py-3.5 text-center text-xs text-gray-300">
                    {event.start_date || event.end_date
                      ? `${event.start_date ?? "—"} → ${event.end_date ?? "—"}`
                      : <span className="text-gray-300">ไม่มีกำหนด</span>}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <ToggleSwitch id={event.id} isActive={event.is_active} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="rounded p-1.5 text-sky-400 hover:bg-sky-950/50 hover:text-sky-300 transition-colors"
                      >
                        <SquarePen size={14} />
                      </Link>
                      <DeleteButton id={event.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
