export const PLAYER_ROLE_OPTIONS = [
  { value: "top_order_batter", label: "Top Order Batter" },
  { value: "middle_order_batter", label: "Middle Order Batter" },
  { value: "wicket_keeper_batter", label: "Wicket Keeper Batter" },
  { value: "wicket_keeper", label: "Wicket Keeper" },
  { value: "bowler", label: "Bowler" },
  { value: "all_rounder", label: "All Rounder" },
  { value: "lower_order_batter", label: "Lower Order Batter" },
  { value: "opening_batter", label: "Opening Batter" },
  { value: "none", label: "None" },
];

export function formatRoleLabel(role) {
  const match = PLAYER_ROLE_OPTIONS.find((option) => option.value === role);
  if (match) return match.label;

  return String(role || "Unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getMembershipStatusClasses(status) {
  switch (String(status || "").toLowerCase()) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "inactive":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "left":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "pending":
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

export function normalizeRoleGroup(role) {
  const value = String(role || "").toLowerCase();

  if (["opening_batter", "top_order_batter", "middle_order_batter", "lower_order_batter"].includes(value)) {
    return "batter";
  }

  if (["wicket_keeper", "wicket_keeper_batter"].includes(value)) {
    return "wicket_keeper";
  }

  if (value === "bowler") return "bowler";
  if (value === "all_rounder") return "all_rounder";
  return "other";
}
