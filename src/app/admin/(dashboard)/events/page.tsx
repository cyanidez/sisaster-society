import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { verifyAdminSession } from "@/lib/admin-auth";
import EventManagement from "@/components/admin/EventFormModal";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const admin = await verifyAdminSession();
  if (!admin || (admin.role !== "super_admin" && !admin.permissions.includes("event_management"))) notFound();

  const supabase = createAdminSupabaseClient();

  const [{ data: events }, { data: categories }] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("point_categories")
      .select("id, name, name_th, icon, is_active")
      .order("name"),
  ]);

  return (
    <EventManagement
      events={events ?? []}
      categories={categories ?? []}
    />
  );
}
