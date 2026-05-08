import { notFound } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import CategoryCRUD from "@/components/admin/CategoryCRUD";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const admin = await verifyAdminSession();
  if (!admin || (admin.role !== "super_admin" && !admin.permissions.includes("event_management"))) notFound();

  const supabase = createAdminSupabaseClient();
  const { data: categories } = await supabase
    .from("point_categories")
    .select("*")
    .order("name");

  return <CategoryCRUD categories={categories ?? []} />;
}
