export type AdminPermission = "member_management" | "event_management" | "redeem_management";

export const ALL_PERMISSIONS: { key: AdminPermission; label: string; href: string }[] = [
  { key: "member_management", label: "Member Management", href: "/admin/users" },
  { key: "event_management", label: "Event Management + Categories", href: "/admin/events" },
  { key: "redeem_management", label: "Redeem Management", href: "/admin/rewards" },
];
