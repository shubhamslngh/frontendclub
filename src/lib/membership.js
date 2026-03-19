export const MEMBERSHIP_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "left", label: "Left" },
];

export const LEAVE_REQUEST_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export function formatMembershipStatus(status) {
  const match = MEMBERSHIP_STATUS_OPTIONS.find((option) => option.value === status);
  if (match) return match.label;

  return String(status || "Unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function validateLeavePeriod(values) {
  const errors = {};
  const startDate = values.start_date || "";
  const endDate = values.end_date || "";

  if (!startDate) errors.start_date = "Start date is required.";
  if (!endDate) errors.end_date = "End date is required.";

  if (startDate && endDate && endDate < startDate) {
    errors.end_date = "End date must be on or after start date.";
  }

  return errors;
}

export function formatLeaveRange(leave, formatDate) {
  if (!leave) return "-";
  const start = formatDate ? formatDate(leave.start_date) : leave.start_date;
  const end = formatDate ? formatDate(leave.end_date) : leave.end_date;
  return `${start} to ${end}`;
}

export function formatLeaveRequestStatus(status) {
  const match = LEAVE_REQUEST_STATUS_OPTIONS.find((option) => option.value === status);
  if (match) return match.label;

  return String(status || "Unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getLeaveRequestStatusClasses(status) {
  switch (String(status || "").toLowerCase()) {
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "rejected":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "pending":
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}
