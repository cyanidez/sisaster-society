import { notFound } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import EventForm from "@/components/admin/EventForm";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const admin = await verifyAdminSession();
  if (!admin || (admin.role !== "super_admin" && !admin.permissions.includes("event_management"))) notFound();

  const supabase = createAdminSupabaseClient();
  const { data: categories } = await supabase.from("point_categories").select("id, name, name_th, icon, is_active").order("name");

  return <EventForm categories={categories ?? []} />;
}
