"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EVENT_UNITS } from "@/lib/event-units";
import { createEvent, updateEvent } from "@/app/actions/admin-events";
import { ArrowLeft, Calendar, Users, Loader2 } from "lucide-react";

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
}

interface Props {
  event?: Event;
  categories: Category[];
}

export default function EventForm({ event, categories }: Props) {
  const router = useRouter();
  const action = event ? updateEvent : createEvent;
  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success) router.push("/admin/events");
  }, [state, router]);

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      {/* Back */}
      <Link
        href="/admin/events"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-gray-300 transition-colors"
      >
        <ArrowLeft size={13} />
        กลับ Event Management
      </Link>

      <h1 className="text-lg font-bold text-white mb-6">
        {event ? `แก้ไข: ${event.title}` : "เพิ่ม Event ใหม่"}
      </h1>

      <form action={formAction} className="space-y-5">
        {event && <input type="hidden" name="id" value={event.id} />}

        {/* Category */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">หมวดหมู่</label>
          <select
            name="category_id"
            defaultValue={event?.category_id ?? ""}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white focus:border-pink-500 focus:outline-none"
          >
            <option value="">— ไม่ระบุหมวดหมู่ —</option>
            {categories.filter((c) => c.is_active).map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name_th}
              </option>
            ))}
            {/* Keep current inactive category selectable when editing */}
            {event?.category_id && (() => {
              const current = categories.find((c) => c.id === event.category_id);
              if (current && !current.is_active) {
                return (
                  <option key={current.id} value={current.id}>
                    {current.icon} {current.name_th} (Inactive)
                  </option>
                );
              }
            })()}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Icon */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">ไอคอน (emoji)</label>
            <input
              name="icon"
              defaultValue={event?.icon ?? "⭐"}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white focus:border-pink-500 focus:outline-none"
              placeholder="⭐"
            />
          </div>
          {/* Points */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">L-Point (Base)</label>
            <input
              name="points"
              type="number"
              defaultValue={event?.points ?? 0}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white focus:border-pink-500 focus:outline-none"
              placeholder="100"
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">
            ชื่อ Event <span className="text-red-400">*</span>
          </label>
          <input
            name="title"
            defaultValue={event?.title}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white focus:border-pink-500 focus:outline-none"
            placeholder="เช่น โดเนทในไลฟ์"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">รายละเอียด</label>
          <textarea
            name="description"
            defaultValue={event?.description ?? ""}
            rows={3}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white focus:border-pink-500 focus:outline-none resize-none"
            placeholder="อธิบายวิธีที่จะได้รับ L-Point..."
          />
        </div>

        {/* Condition */}
        <div className="rounded-xl border border-gray-700 p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            เงื่อนไขการได้รับ L-Point
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-3">
              <label className="block text-xs text-gray-300 mb-1">กิจกรรม / สิ่งที่ต้องทำ</label>
              <input
                name="condition_label"
                defaultValue={event?.condition_label ?? ""}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white focus:border-pink-500 focus:outline-none"
                placeholder="เช่น โดเนทขั้นต่ำ, ดูไลฟ์ครบ, แชร์โพสต์"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-300 mb-1">จำนวน (ว่างไว้ = ไม่ระบุ)</label>
              <input
                name="condition_value"
                type="number"
                min={0}
                step="any"
                defaultValue={event?.condition_value ?? ""}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white focus:border-pink-500 focus:outline-none"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1">หน่วย</label>
              <select
                name="condition_unit"
                defaultValue={event?.condition_unit ?? ""}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white focus:border-pink-500 focus:outline-none"
              >
                <option value="">— เลือกหน่วย —</option>
                {EVENT_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label} · {u.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            ตัวอย่าง: โดเนทขั้นต่ำ · 100 · บาท → "โดเนทขั้นต่ำ 100 บาท"
          </p>
          <label className="flex items-start gap-2.5 cursor-pointer rounded-lg border border-gray-700 bg-gray-900/60 px-3 py-2.5 hover:border-gray-600 transition-colors">
            <input
              type="checkbox"
              name="is_accumulation"
              value="true"
              defaultChecked={event?.is_accumulation ?? false}
              className="mt-0.5 h-4 w-4 rounded accent-pink-500"
            />
            <div>
              <p className="text-sm text-white">โหมดสะสมยอด</p>
              <p className="text-xs text-gray-300 mt-0.5">
                admin บันทึกยอดเงินแต่ละครั้ง ระบบสะสมจนถึง threshold แล้วออก L-Point อัตโนมัติ
              </p>
            </div>
          </label>
        </div>

        {/* Booster multiplier */}
        <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-4 space-y-2">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            ⚡ Booster Multiplier
          </p>
          <div>
            <label className="block text-xs text-gray-300 mb-1.5">
              ตัวคูณ (1 = ปกติ · 1.5 = x1.5 · 2 = x2)
            </label>
            <input
              name="multiplier"
              type="number"
              step="0.1"
              min="1"
              defaultValue={event?.multiplier ?? 1}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
              placeholder="1"
            />
          </div>
          <p className="text-xs text-gray-400">
            ถ้าตั้งเป็น 2 และ admin เพิ่ม 100 base pt → สมาชิกได้รับ 200 pt
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              <Calendar size={10} className="inline mr-1" />วันเริ่ม
            </label>
            <input
              name="start_date"
              type="date"
              defaultValue={event?.start_date ?? ""}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white focus:border-pink-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              <Calendar size={10} className="inline mr-1" />วันสิ้นสุด
            </label>
            <input
              name="end_date"
              type="date"
              defaultValue={event?.end_date ?? ""}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">
            <Users size={10} className="inline mr-1" />จำกัดสิทธิ์ต่อ User (ว่างไว้ = ไม่จำกัด)
          </label>
          <input
            name="max_per_user"
            type="number"
            min={1}
            defaultValue={event?.max_per_user ?? ""}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white focus:border-pink-500 focus:outline-none"
            placeholder="เช่น 1 = รับได้ครั้งเดียว"
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-700 px-4 py-3">
          <span className="text-sm text-gray-300">เปิดใช้งาน</span>
          <select
            name="is_active"
            defaultValue={event ? String(event.is_active) : "true"}
            className="bg-transparent text-sm text-white focus:outline-none"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {state?.error && (
          <p className="rounded-lg border border-red-800 bg-red-950/50 px-3 py-2 text-xs text-red-400">
            {state.error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <Link
            href="/admin/events"
            className="flex-1 rounded-lg border border-gray-700 py-2.5 text-sm text-center text-gray-400 hover:bg-gray-800 transition-colors"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-pink-600 py-2.5 text-sm font-medium text-white hover:bg-pink-700 disabled:opacity-50 transition-colors"
          >
            {pending && <Loader2 size={13} className="animate-spin" />}
            {event ? "บันทึกการแก้ไข" : "สร้าง Event"}
          </button>
        </div>
      </form>
    </div>
  );
}
