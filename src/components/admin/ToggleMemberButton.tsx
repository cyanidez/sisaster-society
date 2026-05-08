"use client";

import { useState } from "react";
import { toggleMemberActive } from "@/app/actions/admin-points";
import { UserCheck, UserX } from "lucide-react";

export default function ToggleMemberButton({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await toggleMemberActive(userId, !isActive);
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
        isActive
          ? "border border-red-800 bg-red-950/40 text-red-400 hover:bg-red-950/70"
          : "border border-green-800 bg-green-950/40 text-green-400 hover:bg-green-950/70"
      }`}
    >
      {isActive ? (
        <>
          <UserX size={15} />
          {loading ? "กำลังดำเนินการ..." : "Deactivate"}
        </>
      ) : (
        <>
          <UserCheck size={15} />
          {loading ? "กำลังดำเนินการ..." : "Activate"}
        </>
      )}
    </button>
  );
}
