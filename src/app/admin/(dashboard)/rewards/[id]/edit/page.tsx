import { notFound } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import RewardForm from "@/components/admin/RewardForm";

export const dynamic = "force-dynamic";

export default async function EditRewardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = await verifyAdminSession();
  if (!admin || (admin.role !== "super_admin" && !admin.permissions.includes("redeem_management"))) notFound();

  const supabase = createAdminSupabaseClient();
  const { data: reward } = await supabase.from("rewards").select("*").eq("id", id).maybeSingle();

  if (!reward) notFound();

  return <RewardForm reward={reward} />;
}
