"use client";

import { useActionState, useEffect, useState } from "react";
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/admin-categories";
import { Tag, Plus, SquarePen, Trash2, Check, X, Loader2, AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  name_th: string;
  icon: string | null;
  color: string | null;
  is_active: boolean;
}

const inputCls =
  "w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500/30 transition";

function AddForm() {
  const [state, action, pending] = useActionState(createCategory, null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-dashed border-gray-700 px-4 py-2.5 text-sm text-gray-300 hover:border-pink-600/60 hover:text-pink-400 transition-colors w-full justify-center"
      >
        <Plus size={14} />
        เพิ่ม Category ใหม่
      </button>
    );
  }

  return (
    <form action={action} className="rounded-xl border border-pink-800/40 bg-pink-950/10 p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
          <Plus size={12} /> เพิ่ม Category ใหม่
        </p>
        <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-300">
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-300 mb-1">ไอคอน (emoji)</label>
          <input name="icon" placeholder="💰" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-gray-300 mb-1">สี</label>
          <input name="color" placeholder="pink" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-gray-300 mb-1">ชื่อ EN <span className="text-red-400">*</span></label>
          <input name="name" required placeholder="donation" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-gray-300 mb-1">ชื่อ TH <span className="text-red-400">*</span></label>
          <input name="name_th" required placeholder="โดเนท" className={inputCls} />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-gray-700 px-3 py-2.5">
        <span className="text-sm text-gray-300">เปิดใช้งาน</span>
        <select name="is_active" defaultValue="true" className="bg-transparent text-sm text-white focus:outline-none">
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {state?.error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={12} /> {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)}
          className="flex-1 rounded-lg border border-gray-700 py-2 text-sm text-gray-400 hover:bg-gray-800 transition-colors">
          ยกเลิก
        </button>
        <button type="submit" disabled={pending}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-pink-600 py-2 text-sm font-medium text-white hover:bg-pink-700 disabled:opacity-50 transition-colors">
          {pending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          เพิ่ม
        </button>
      </div>
    </form>
  );
}

function CategoryCard({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(updateCategory, null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (state?.success) setEditing(false);
  }, [state]);

  const handleDelete = async () => {
    setDeleting(true);
    await deleteCategory(category.id);
  };

  if (editing) {
    return (
      <form action={action} className="rounded-xl border border-gray-700 bg-gray-800/60 p-4 space-y-3">
        <input type="hidden" name="id" value={category.id} />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-300 mb-1">ไอคอน</label>
            <input name="icon" defaultValue={category.icon ?? ""} placeholder="💰" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">สี</label>
            <input name="color" defaultValue={category.color ?? ""} placeholder="pink" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">ชื่อ EN <span className="text-red-400">*</span></label>
            <input name="name" defaultValue={category.name} required className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">ชื่อ TH <span className="text-red-400">*</span></label>
            <input name="name_th" defaultValue={category.name_th} required className={inputCls} />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-gray-700 px-3 py-2.5">
          <span className="text-sm text-gray-300">เปิดใช้งาน</span>
          <select name="is_active" defaultValue={String(category.is_active)} className="bg-transparent text-sm text-white focus:outline-none">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        {state?.error && (
          <p className="flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle size={12} /> {state.error}
          </p>
        )}
        <div className="flex gap-2">
          <button type="button" onClick={() => setEditing(false)}
            className="flex-1 rounded-lg border border-gray-700 py-2 text-sm text-gray-400 hover:bg-gray-800 transition-colors">
            ยกเลิก
          </button>
          <button type="submit" disabled={pending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-700 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 transition-colors">
            {pending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            บันทึก
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 hover:border-gray-700 transition-colors">
      <span className="text-2xl w-8 text-center shrink-0">{category.icon ?? "—"}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-white">{category.name_th}</p>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
            category.is_active ? "bg-green-950/50 text-green-400" : "bg-red-950/50 text-red-400"
          }`}>
            {category.is_active ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="text-xs text-gray-300 font-mono">{category.name}{category.color ? ` · ${category.color}` : ""}</p>
      </div>
      {confirmDelete ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={handleDelete} disabled={deleting}
            className="rounded-lg bg-red-900/60 px-3 py-1.5 text-xs text-red-400 hover:bg-red-900 disabled:opacity-50 transition-colors">
            {deleting ? "..." : "ยืนยันลบ"}
          </button>
          <button onClick={() => setConfirmDelete(false)}
            className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-800 transition-colors">
            ยกเลิก
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)}
            className="rounded p-1.5 text-sky-400 hover:bg-sky-950/50 hover:text-sky-300 transition-colors">
            <SquarePen size={14} />
          </button>
          <button onClick={() => setConfirmDelete(true)}
            className="rounded p-1.5 text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function CategoryCRUD({ categories }: { categories: Category[] }) {
  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Tag size={20} className="text-pink-400" />
          หมวดหมู่ L-Point
        </h1>
        <p className="text-sm text-gray-300 mt-0.5">ใช้แบ่งประเภทของ Point Transaction</p>
      </div>

      <div className="space-y-2 mb-4">
        {categories.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900 py-12 text-center text-gray-400">
            <Tag size={32} className="mx-auto mb-3 opacity-20" />
            <p>ยังไม่มีหมวดหมู่</p>
          </div>
        ) : (
          categories.map((cat) => <CategoryCard key={cat.id} category={cat} />)
        )}
      </div>

      <AddForm />
    </div>
  );
}
