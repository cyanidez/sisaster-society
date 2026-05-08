"use client";

import { useState, useEffect } from "react";
import {
  Star, History, X, Loader2, Zap,
  Heart, Gamepad2, Megaphone, Smartphone, ShoppingBag,
} from "lucide-react";
import { getTransactionDetail } from "@/app/actions/admin-points";

const categoryIcons: Record<string, React.ElementType> = {
  donation: Heart,
  activity: Gamepad2,
  event: Megaphone,
  social: Smartphone,
  purchase: ShoppingBag,
  bonus: Star,
};

interface Category {
  name: string;
  name_th: string;
  icon: string | null;
}

interface Transaction {
  id: string;
  event_id: string | null;
  points: number;
  description: string | null;
  description_th: string | null;
  created_at: string;
  balance: number;
  point_categories: Category | null;
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type DetailResult = Awaited<ReturnType<typeof getTransactionDetail>>;

function TransactionDetailModal({
  txId,
  description,
  onClose,
}: {
  txId: string;
  description: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<DetailResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactionDetail(txId).then((res) => {
      setDetail(res);
      setLoading(false);
    });
  }, [txId]);

  const unit = detail?.event?.condition_unit ?? "";
  const totalAmount = detail?.logs?.reduce((s, l) => s + l.amount, 0) ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {detail?.event && (
              <span className="text-xl shrink-0">{detail.event.icon}</span>
            )}
            <div className="min-w-0">
              <h2 className="font-semibold text-white text-sm truncate">
                {detail?.event?.title ?? description}
              </h2>
              <p className="text-xs text-gray-300">รายละเอียด L-Point</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors shrink-0 ml-3"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {loading && (
            <div className="flex items-center justify-center py-10 text-gray-300">
              <Loader2 size={18} className="animate-spin mr-2" />
              <span className="text-sm">กำลังโหลด...</span>
            </div>
          )}

          {!loading && detail?.error && (
            <p className="text-sm text-red-400 text-center py-10">{detail.error}</p>
          )}

          {/* Regular event */}
          {!loading && !detail?.error && detail?.type === "regular" && detail.event && (
            <div className="space-y-3">
              <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 space-y-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider">กิจกรรม</p>
                <p className="text-sm text-white font-medium">
                  {detail.event.icon} {detail.event.title}
                </p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 flex items-center justify-between">
                <p className="text-xs text-gray-400">L-Point ที่ได้รับ</p>
                <div className="text-right">
                  <p className="text-lg font-black text-green-400">
                    +{detail.tx_points.toLocaleString()}
                  </p>
                  {detail.tx_base_points != null && detail.event.multiplier > 1 && (
                    <p className="text-xs text-amber-400 flex items-center gap-1 justify-end">
                      <Zap size={10} />
                      x{detail.event.multiplier} (ฐาน {detail.tx_base_points.toLocaleString()})
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Accumulation event */}
          {!loading && !detail?.error && detail?.type === "accumulation" && detail.event && (
            <div className="space-y-3">
              {/* Points summary */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">L-Point ที่ได้รับ</p>
                  <p className="text-lg font-black text-green-400 mt-0.5">
                    +{detail.tx_points.toLocaleString()}
                  </p>
                  {detail.tx_base_points != null && detail.event.multiplier > 1 && (
                    <p className="text-xs text-amber-400 flex items-center gap-1 mt-0.5">
                      <Zap size={10} />
                      x{detail.event.multiplier} (ฐาน {detail.tx_base_points.toLocaleString()})
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">จากยอดสะสม</p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {totalAmount.toLocaleString()} {unit}
                  </p>
                </div>
              </div>

              {/* Log entries */}
              {detail.logs && detail.logs.length > 0 ? (
                <div>
                  <p className="text-xs text-gray-400 mb-2">รายการที่นำมาคำนวณ</p>
                  <div className="space-y-1">
                    {detail.logs.map((log, i) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between rounded-lg px-3 py-2.5 bg-gray-800/40 hover:bg-gray-800/70 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs tabular-nums text-gray-400 w-4 text-right shrink-0">
                            {i + 1}
                          </span>
                          <p className="text-xs text-gray-300">
                            {formatDateTime(log.created_at)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-white tabular-nums">
                          +{log.amount.toLocaleString()} {unit}
                        </p>
                      </div>
                    ))}
                  </div>

                  {detail.logs.length > 1 && (
                    <div className="mt-2 border-t border-gray-800 pt-2 flex items-center justify-between text-xs px-3">
                      <span className="text-gray-400">รวมทั้งหมด</span>
                      <span className="font-semibold text-white">
                        {totalAmount.toLocaleString()} {unit}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <History size={28} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">ไม่พบข้อมูลรายการสะสม</p>
                </div>
              )}
            </div>
          )}

          {/* Manual (no event) */}
          {!loading && !detail?.error && detail?.type === "manual" && (
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 flex items-center justify-between">
              <p className="text-xs text-gray-400">จำนวน L-Point</p>
              <p className={`text-lg font-black tabular-nums ${detail.tx_points >= 0 ? "text-green-400" : "text-red-400"}`}>
                {detail.tx_points >= 0 ? "+" : ""}{detail.tx_points.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 5;

export default function TransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [openTx, setOpenTx] = useState<{ id: string; description: string } | null>(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(transactions.length / PAGE_SIZE);
  const paged = transactions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        <Star size={32} className="mx-auto mb-3 opacity-20" />
        ยังไม่มีรายการ
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-gray-800/60">
        {paged.map((tx) => {
          const cat = tx.point_categories;
          const Icon = categoryIcons[cat?.name ?? ""] ?? Star;
          const isPositive = tx.points > 0;

          return (
            <div
              key={tx.id}
              className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-800/30 transition-colors"
            >
              {/* Category icon */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  isPositive ? "bg-pink-950/60" : "bg-red-950/50"
                }`}
              >
                <Icon
                  size={13}
                  className={isPositive ? "text-pink-400" : "text-red-400"}
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {tx.description_th ?? tx.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {cat && (
                    <span className="text-xs text-gray-400">
                      {cat.icon} {cat.name_th}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {formatDateTime(tx.created_at)}
                  </span>
                </div>
              </div>

              {/* Points + balance + detail button */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <p
                  className={`text-sm font-bold tabular-nums ${
                    isPositive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {tx.points.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 tabular-nums">
                  = {tx.balance.toLocaleString()}
                </p>
                <button
                  onClick={() =>
                    setOpenTx({
                      id: tx.id,
                      description: tx.description_th ?? tx.description ?? "",
                    })
                  }
                  className="flex items-center gap-1 rounded-lg border border-gray-700 px-2 py-0.5 text-[10px] text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
                >
                  <History size={9} />
                  รายละเอียด
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination bar — always visible */}
      <div className="flex items-center justify-between border-t border-gray-800 px-5 py-3 gap-2">
        <p className="text-xs text-gray-400 shrink-0">
          {transactions.length <= PAGE_SIZE
            ? `${transactions.length} รายการ`
            : `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, transactions.length)} จาก ${transactions.length}`}
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-1 flex-wrap justify-end">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
              className="rounded-lg border border-gray-700 px-2.5 py-1 text-xs text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => {
              const isActive = i === page;
              const nearActive = Math.abs(i - page) <= 1;
              const isEdge = i === 0 || i === totalPages - 1;
              if (!nearActive && !isEdge) {
                if (i === 1 || i === totalPages - 2) {
                  return <span key={i} className="text-xs text-gray-400 px-0.5">…</span>;
                }
                return null;
              }
              return (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`min-w-[28px] rounded-lg border px-2 py-1 text-xs tabular-nums transition-colors ${
                    isActive
                      ? "border-pink-600 bg-pink-600/20 text-pink-400 font-semibold"
                      : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
              className="rounded-lg border border-gray-700 px-2.5 py-1 text-xs text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        )}
      </div>

      {openTx && (
        <TransactionDetailModal
          txId={openTx.id}
          description={openTx.description}
          onClose={() => setOpenTx(null)}
        />
      )}
    </>
  );
}
