"use client";

import { useActionState, useEffect, useRef } from "react";
import { addPointTransaction } from "@/app/actions/admin-points";
import { PlusCircle, MinusCircle, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface Category {
  id: string;
  name: string;
  name_th: string;
  icon: string | null;
}

interface Props {
  userId: string;
  categories: Category[];
}

export default function AddPointForm({ userId, categories }: Props) {
  const [state, action, pending] = useActionState(addPointTransaction, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Reset form on success
  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <input type="hidden" name="user_id" value={userId} />

      {/* Feedback */}
      {state?.error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-800/60 bg-red-950/40 px-3.5 py-2.5">
          <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{state.error}</p>
        </div>
      )}
      {state?.success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-800/60 bg-green-950/40 px-3.5 py-2.5">
          <CheckCircle2 size={14} className="text-green-400 shrink-0" />
          <p className="text-sm text-green-300">บันทึก Point สำเร็จ</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Amount */}
        <div className="col-span-2 sm:col-span-1 space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            จำนวน Point
          </label>
          <div className="relative">
            <input
              name="points"
              type="number"
              required
              placeholder="เช่น 100 หรือ -50"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500/40"
            />
          </div>
          <p className="text-xs text-gray-600">
            ตัวเลขบวก = เพิ่ม · ลบ = หัก
          </p>
        </div>

        {/* Category */}
        <div className="col-span-2 sm:col-span-1 space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            หมวดหมู่
          </label>
          <select
            name="category_id"
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500/40"
          >
            <option value="">— ไม่ระบุ —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name_th}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          คำอธิบาย (แสดงใน History)
        </label>
        <input
          name="description_th"
          type="text"
          required
          maxLength={200}
          placeholder="เช่น โดเนท Event วันเกิด Faii"
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500/40"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 py-2.5 text-sm font-semibold text-white transition hover:from-pink-500 hover:to-rose-500 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <PlusCircle size={14} />
          )}
          บันทึก Point
        </button>
      </div>

      <p className="text-xs text-gray-600">
        <MinusCircle size={11} className="inline mr-1" />
        ใส่เลขติดลบเพื่อหัก Point เช่น <code className="text-gray-500">-100</code>
      </p>
    </form>
  );
}
