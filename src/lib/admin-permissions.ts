export type AdminPermission =
  | "member_management"
  | "event_management"
  | "category_management"
  | "rank_management"
  | "redeem_management";

export const ALL_PERMISSIONS: { key: AdminPermission; label: string; description: string }[] = [
  { key: "member_management", label: "Member Management",  description: "/admin/users" },
  { key: "event_management",  label: "Event Management",   description: "/admin/events" },
  { key: "category_management", label: "Categories",       description: "/admin/categories" },
  { key: "rank_management",   label: "Rank System",        description: "/admin/ranks" },
  { key: "redeem_management", label: "Redeem",             description: "/admin/rewards" },
];
