import { notFound } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import RewardForm from "@/components/admin/RewardForm";

export const dynamic = "force-dynamic";

export default async function NewRewardPage() {
  const admin = await verifyAdminSession();
  if (!admin || (admin.role !== "super_admin" && !admin.permissions.includes("redeem_management"))) notFound();

  return <RewardForm />;
}
