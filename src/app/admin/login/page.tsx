"use client";

import { useActionState } from "react";
import { adminSignIn } from "@/app/actions/admin-auth";
import { Shield, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(adminSignIn, null);
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-900/40 mb-4">
            <Shield size={26} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <p className="text-sm text-gray-300 mt-1">LBNK48 Sisaster Sites</p>
        </div>

        <form action={action} className="space-y-4">
          {/* Error */}
          {state?.error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-800/60 bg-red-950/50 px-4 py-3">
              <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{state.error}</p>
            </div>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
              Username
            </label>
            <input
              name="username"
              type="text"
              autoComplete="username"
              required
              placeholder="admin"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="••••••••••"
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3.5 py-2.5 pr-10 text-sm text-white placeholder-gray-600 outline-none transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-300 transition-colors"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-pink-900/30 transition hover:from-pink-500 hover:to-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                กำลังตรวจสอบ...
              </>
            ) : (
              "เข้าสู่ระบบ Admin"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-300">
          ระบบนี้สำหรับผู้ดูแลระบบเท่านั้น
        </p>
      </div>
    </div>
  );
}
