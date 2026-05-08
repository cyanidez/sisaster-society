"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { createRank, updateRank, deleteRank } from "@/app/actions/admin-ranks";
import {
  Trophy, Plus, X, Lock, SquarePen, Trash2,
  Loader2, AlertCircle, CheckCircle2, Users,
} from "lucide-react";

export interface RankRow {
  id: string;
  name: string;
  emoji: string;
  min_points: number;
  color: string;
  memberCount: number;
  isLocked: boolean;
}

function RankForm({
  rank,
  allRanks,
  onClose,
}: {
  rank?: RankRow;
  allRanks: RankRow[];
  onClose: () => void;
}) {
  const action = rank ? updateRank : createRank;
  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success) onClose();
  }, [state, onClose]);

  const others = allRanks.filter((r) => r.id !== rank?.id).map((r) => r.min_points);
  const sortedOthers = [...others].sort((a, b) => a - b);

  return (
    <form action={formAction} className="space-y-4">
      {rank && <input type="hidden" name="id" value={rank.id} />}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">ชื่อ Rank <span className="text-red-400">*</span></label>
          <input
            name="name"
            defaultValue={rank?.name}
            required
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
            placeholder="เช่น Bronze"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Emoji</label>
          <input
            name="emoji"
            defaultValue={rank?.emoji ?? "⭐"}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
            placeholder="🥉"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Min L-Point <span className="text-red-400">*</span></label>
          <input
            name="min_points"
            type="number"
            min="0"
            defaultValue={rank?.min_points ?? 0}
            required
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
            placeholder="0"
          />
          {sortedOthers.length > 0 && (
            <p className="text-[10px] text-gray-400 mt-1">
              Ranks อื่น: {sortedOthers.map((p) => p.toLocaleString()).join(", ")}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">สี</label>
          <div className="flex gap-2 items-center">
            <input
              name="color"
              type="color"
              defaultValue={rank?.color ?? "#94a3b8"}
              className="h-9 w-12 rounded-lg border border-gray-700 bg-gray-800 cursor-pointer p-1"
            />
            <span className="text-xs text-gray-400">เลือกสี Rank</span>
          </div>
        </div>
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-800/60 bg-red-950/40 px-3 py-2">
          <AlertCircle size={13} className="text-red-400 shrink-0" />
          <p className="text-xs text-red-300">{state.error}</p>
        </div>
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
          className="flex-1 rounded-lg bg-pink-600 py-2 text-sm font-medium text-white hover:bg-pink-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
        >
          {pending && <Loader2 size={13} className="animate-spin" />}
          {rank ? "บันทึก" : "สร้าง Rank"}
        </button>
      </div>
    </form>
  );
}

function DeleteButton({ rank }: { rank: RankRow }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteRank(rank.id);
    if (res.error) {
      setError(res.error);
      setLoading(false);
      setConfirm(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-red-400">
        <AlertCircle size={11} />
        {error}
        <button onClick={() => setError(null)} className="underline">ปิด</button>
      </div>
    );
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-1">
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
      title="ลบ"
    >
      <Trash2 size={14} />
    </button>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
          <h2 className="font-semibold text-white text-sm">{title}</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function RankManagement({ ranks }: { ranks: RankRow[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingRank, setEditingRank] = useState<RankRow | null>(null);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy size={20} className="text-amber-400" />
            Rank System
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">จัดการระดับสมาชิกและ L-Point ที่ต้องใช้</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 transition-colors"
        >
          <Plus size={15} />
          เพิ่ม Rank
        </button>
      </div>

      {/* Rank table */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        {ranks.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Trophy size={40} className="mx-auto mb-3 opacity-20" />
            <p>ยังไม่มี Rank</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-950/60">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Rank</th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">Min L-Point</th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">สมาชิก</th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">สถานะ</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {ranks.map((rank) => (
                <tr key={rank.id} className="group hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{rank.emoji}</span>
                      <div>
                        <p className="font-semibold text-white">{rank.name}</p>
                        <div className="w-16 h-1.5 rounded-full mt-1" style={{ backgroundColor: rank.color }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="font-bold tabular-nums text-white">
                      {rank.min_points.toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-xs ml-1">pt</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-300">
                      <Users size={12} className="text-gray-400" />
                      {rank.memberCount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {rank.isLocked ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/50 px-2 py-0.5 text-xs font-medium text-amber-400">
                        <Lock size={10} />
                        ล็อค
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-950/50 px-2 py-0.5 text-xs font-medium text-green-400">
                        <CheckCircle2 size={10} />
                        แก้ไขได้
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingRank(rank)}
                        disabled={rank.isLocked}
                        className="rounded p-1.5 text-sky-400 hover:bg-sky-950/50 hover:text-sky-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={rank.isLocked ? "ล็อค — มีสมาชิกใน Rank นี้" : "แก้ไข"}
                      >
                        <SquarePen size={14} />
                      </button>
                      {rank.isLocked ? (
                        <span className="p-1.5 text-gray-700" title="ล็อค">
                          <Trash2 size={14} />
                        </span>
                      ) : (
                        <DeleteButton rank={rank} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Hint */}
      <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
        <Lock size={11} />
        Rank ที่มีสมาชิกอยู่จะถูกล็อค ไม่สามารถแก้ไขหรือลบได้
      </p>

      {/* Create modal */}
      {showCreate && (
        <Modal title="เพิ่ม Rank ใหม่" onClose={() => setShowCreate(false)}>
          <RankForm allRanks={ranks} onClose={() => setShowCreate(false)} />
        </Modal>
      )}

      {/* Edit modal */}
      {editingRank && (
        <Modal title={`แก้ไข: ${editingRank.emoji} ${editingRank.name}`} onClose={() => setEditingRank(null)}>
          <RankForm rank={editingRank} allRanks={ranks} onClose={() => setEditingRank(null)} />
        </Modal>
      )}
    </div>
  );
}
