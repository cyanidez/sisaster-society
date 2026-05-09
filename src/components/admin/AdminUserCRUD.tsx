"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createAdminUser, updateAdminUser,
  toggleAdminUserActive, deleteAdminUser, updateAdminPermissions,
} from "@/app/actions/admin-users";
import { ALL_PERMISSIONS } from "@/lib/admin-permissions";
import { Plus, SquarePen, Trash2, X, Eye, EyeOff, Shield, Crown, KeyRound } from "lucide-react";

interface AdminUserRow {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  role: string;
  is_active: boolean;
  permissions: string[];
  last_login_at: string | null;
  created_at: string;
}

function AdminUserForm({ user, currentId, onClose }: {
  user?: AdminUserRow;
  currentId: string;
  onClose: () => void;
}) {
  const action = user ? updateAdminUser : createAdminUser;
  const [state, formAction, pending] = useActionState(action, null);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state, onClose]);

  const isSelf = user?.id === currentId;

  return (
    <form action={formAction} className="space-y-4">
      {user && <input type="hidden" name="id" value={user.id} />}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Username <span className="text-red-400">*</span></label>
          <input
            name="username"
            defaultValue={user?.username}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
            placeholder="username"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">ชื่อที่แสดง</label>
          <input
            name="display_name"
            defaultValue={user?.display_name ?? ""}
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
          defaultValue={user?.email}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
          placeholder="admin@example.com"
          required
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">
          รหัสผ่าน {user && <span className="text-gray-400">(ว่างไว้ = ไม่เปลี่ยน)</span>}
          {!user && <span className="text-red-400">*</span>}
        </label>
        <div className="relative">
          <input
            name="password"
            type={showPass ? "text" : "password"}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 pr-9 text-sm text-white focus:border-pink-500 focus:outline-none"
            placeholder={user ? "เว้นว่างถ้าไม่ต้องการเปลี่ยน" : "อย่างน้อย 8 ตัวอักษร"}
            required={!user}
            minLength={user ? undefined : 8}
          />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-300">
            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Role</label>
        <select
          name="role"
          defaultValue={user?.role ?? "admin"}
          disabled={isSelf}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none disabled:opacity-50"
        >
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        {isSelf && <p className="text-xs text-gray-400 mt-1">ไม่สามารถเปลี่ยน role ของตัวเองได้</p>}
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-950/50 border border-red-800 px-3 py-2 text-xs text-red-400">
          {state.error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose}
          className="flex-1 rounded-lg border border-gray-700 py-2 text-sm text-gray-400 hover:bg-gray-800 transition-colors">
          ยกเลิก
        </button>
        <button type="submit" disabled={pending}
          className="flex-1 rounded-lg bg-pink-600 py-2 text-sm font-medium text-white hover:bg-pink-700 disabled:opacity-50 transition-colors">
          {pending ? "กำลังบันทึก..." : user ? "บันทึก" : "สร้าง Admin"}
        </button>
      </div>
    </form>
  );
}

function ToggleSwitch({ id, isActive, currentId }: { id: string; isActive: boolean; currentId: string }) {
  const [loading, setLoading] = useState(false);
  const isSelf = id === currentId;

  return (
    <button
      onClick={async () => { setLoading(true); await toggleAdminUserActive(id, !isActive); setLoading(false); }}
      disabled={loading || isSelf}
      title={isSelf ? "ไม่สามารถ deactivate ตัวเองได้" : undefined}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 focus:outline-none ${isSelf ? "cursor-default" : "cursor-pointer"}`}
      style={{ backgroundColor: isActive ? "#16a34a" : "#dc2626" }}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${isActive ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function DeleteButton({ id, username, currentId }: { id: string; username: string; currentId: string }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const isSelf = id === currentId;

  if (isSelf) return <span className="w-7" />;

  if (confirm) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={() => setConfirm(false)}
          className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-700">ยกเลิก</button>
        <button onClick={async () => { setLoading(true); await deleteAdminUser(id); }}
          disabled={loading}
          className="rounded bg-red-900/60 px-2 py-1 text-xs text-red-400 hover:bg-red-900 disabled:opacity-50">
          {loading ? "..." : "ยืนยัน"}
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirm(true)}
      className="rounded p-1.5 text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors"
      title={`ลบ @${username}`}>
      <Trash2 size={14} />
    </button>
  );
}

function ACLPanel({ user, onClose }: { user: AdminUserRow; onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>(user.permissions ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (key: string) =>
    setSelected((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  const handleSave = async () => {
    setLoading(true);
    const result = await updateAdminPermissions(user.id, selected);
    setLoading(false);
    if (result.error) setError(result.error);
    else onClose();
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-300">
        Super Admin มีสิทธิ์ทุกหน้าอยู่แล้ว · ตั้งค่านี้มีผลเฉพาะ Admin role
      </p>
      <div className="space-y-2">
        {ALL_PERMISSIONS.map(({ key, label, description }) => (
          <label key={key} className="flex items-center justify-between rounded-lg border border-gray-700 px-4 py-3 cursor-pointer hover:bg-gray-800 transition-colors">
            <div>
              <p className="text-sm font-medium text-white">{label}</p>
              <p className="text-xs text-gray-400">{description}</p>
            </div>
            <input
              type="checkbox"
              checked={selected.includes(key)}
              onChange={() => toggle(key)}
              className="h-4 w-4 rounded accent-pink-500"
            />
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button onClick={onClose} className="flex-1 rounded-lg border border-gray-700 py-2 text-sm text-gray-400 hover:bg-gray-800 transition-colors">
          ยกเลิก
        </button>
        <button onClick={handleSave} disabled={loading} className="flex-1 rounded-lg bg-pink-600 py-2 text-sm font-medium text-white hover:bg-pink-700 disabled:opacity-50 transition-colors">
          {loading ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>
    </div>
  );
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminUserManagement({
  adminUsers,
  currentId,
}: {
  adminUsers: AdminUserRow[];
  currentId: string;
}) {
  const [modal, setModal] = useState<"create" | AdminUserRow | null>(null);
  const [aclTarget, setAclTarget] = useState<AdminUserRow | null>(null);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield size={20} className="text-pink-400" />
            Admin User Management
          </h1>
          <p className="text-sm text-gray-300 mt-0.5">{adminUsers.length} admin ในระบบ · เฉพาะ Super Admin</p>
        </div>
        <button onClick={() => setModal("create")}
          className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 transition-colors">
          <Plus size={15} /> เพิ่ม Admin
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-950/60">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-300">Admin</th>
              <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-300">Role</th>
              <th className="hidden md:table-cell px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-300">Status</th>
              <th className="hidden lg:table-cell px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-300">Login ล่าสุด</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {adminUsers.map((u) => (
              <tr key={u.id} className="group hover:bg-gray-800/30 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-700 to-rose-800 text-xs font-bold text-white">
                      {(u.display_name ?? u.username).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white flex items-center gap-1.5">
                        {u.display_name ?? u.username}
                        {u.id === currentId && <span className="text-xs text-pink-400">(คุณ)</span>}
                      </p>
                      <p className="text-xs text-gray-300">@{u.username} · {u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-center">
                  {u.role === "super_admin"
                    ? <span className="inline-flex items-center gap-1 rounded-full bg-yellow-950/50 px-2 py-0.5 text-xs font-medium text-yellow-400"><Crown size={10} /> Super Admin</span>
                    : <span className="inline-flex items-center gap-1 rounded-full bg-blue-950/50 px-2 py-0.5 text-xs font-medium text-blue-400"><Shield size={10} /> Admin</span>}
                </td>
                <td className="hidden md:table-cell px-5 py-3.5 text-center">
                  <ToggleSwitch id={u.id} isActive={u.is_active} currentId={currentId} />
                </td>
                <td className="hidden lg:table-cell px-5 py-3.5 text-right text-xs text-gray-300">
                  {formatDate(u.last_login_at)}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    {u.role !== "super_admin" && (
                      <button onClick={() => setAclTarget(u)}
                        className="rounded p-1.5 text-violet-400 hover:bg-violet-950/50 hover:text-violet-300 transition-colors"
                        title="จัดการสิทธิ์">
                        <KeyRound size={14} />
                      </button>
                    )}
                    <button onClick={() => setModal(u)}
                      className="rounded p-1.5 text-sky-400 hover:bg-sky-950/50 hover:text-sky-300 transition-colors">
                      <SquarePen size={14} />
                    </button>
                    <DeleteButton id={u.id} username={u.username} currentId={currentId} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {aclTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <KeyRound size={16} className="text-blue-400" />
                สิทธิ์การเข้าถึง · @{aclTarget.username}
              </h2>
              <button onClick={() => setAclTarget(null)} className="text-gray-300 hover:text-gray-300"><X size={18} /></button>
            </div>
            <div className="p-5">
              <ACLPanel user={aclTarget} onClose={() => setAclTarget(null)} />
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
              <h2 className="font-semibold text-white">
                {modal === "create" ? "เพิ่ม Admin ใหม่" : `แก้ไข: @${(modal as AdminUserRow).username}`}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-300 hover:text-gray-300"><X size={18} /></button>
            </div>
            <div className="p-5">
              <AdminUserForm
                user={modal === "create" ? undefined : (modal as AdminUserRow)}
                currentId={currentId}
                onClose={() => setModal(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
