import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Full cryptographic session verification (middleware only checked cookie presence)
  const admin = await verifyAdminSession();
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900">
      <AdminSidebar admin={admin} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
