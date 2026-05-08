"use client";

import { useActionState, useEffect, useState } from "react";
import { createMember, updateMember, deleteMember } from "@/app/actions/admin-members";
import { Plus, SquarePen, Trash2, X, Eye, EyeOff } from "lucide-react";

interface Member {
  id: string;
  username: string;
  display_name: string | null;
  email: string | null;
  is_active: boolean;
}

function MemberForm({
  member,
  onClose,
}: {
  member?: Member;
  onClose: () => void;
}) {
  const action = member ? updateMember : createMember;
  const [state, formAction, pending] = useActionState(action, null);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state, onClose]);

  return (
    <form action={formAction} className="space-y-4">
      {member && <input type="hidden" name="id" value={member.id} />}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Username <span className="text-red-400">*</span></label>
          <input
            name="username"
            defaultValue={member?.username}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
            placeholder="username"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">ชื่อที่แสดง</label>
          <input
            name="display_name"
            defaultValue={member?.display_name ?? ""}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
            placeholder="Display name"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Email <span className="text-red-400">*</span></label>
        <input
          name="email"
          type="email"
          defaultValue={member?.email ?? ""}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
          placeholder="email@example.com"
          required
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">
          รหัสผ่าน {member && <span className="text-gray-400">(ว่างไว้ = ไม่เปลี่ยน)</span>}
          {!member && <span className="text-red-400">*</span>}
        </label>
        <div className="relative">
          <input
            name="password"
            type={showPass ? "text" : "password"}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 pr-9 text-sm text-white focus:border-pink-500 focus:outline-none"
            placeholder={member ? "เว้นว่างถ้าไม่ต้องการเปลี่ยน" : "อย่างน้อย 6 ตัวอักษร"}
            required={!member}
            minLength={member ? undefined : 6}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-300"
          >
            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-950/50 border border-red-800 px-3 py-2 text-xs text-red-400">
          {state.error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-gray-700 py-2 text-sm text-gray-400 hover:bg-gray-800 transition-colors"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg bg-pink-600 py-2 text-sm font-medium text-white hover:bg-pink-700 disabled:opacity-50 transition-colors"
        >
          {pending ? "กำลังบันทึก..." : member ? "บันทึกการแก้ไข" : "สร้าง Member"}
        </button>
      </div>
    </form>
  );
}

export function CreateMemberButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 transition-colors"
      >
        <Plus size={15} />
        เพิ่ม Member
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
              <h2 className="font-semibold text-white">เพิ่ม Member ใหม่</h2>
              <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-gray-300">
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              <MemberForm onClose={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function EditMemberButton({ member }: { member: Member }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded p-1.5 text-sky-400 hover:bg-sky-950/50 hover:text-sky-300 transition-colors"
        title="แก้ไข"
      >
        <SquarePen size={14} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
              <h2 className="font-semibold text-white">แก้ไข: @{member.username}</h2>
              <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-gray-300">
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              <MemberForm member={member} onClose={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function DeleteMemberButton({ id, username }: { id: string; username: string }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await deleteMember(id);
  };

  if (confirm) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-red-400 mr-1">ลบ @{username}?</span>
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
          {loading ? "..." : "ยืนยัน"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="rounded p-1.5 text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors"
      title="ลบ"
    >
      <Trash2 size={14} />
    </button>
  );
}
