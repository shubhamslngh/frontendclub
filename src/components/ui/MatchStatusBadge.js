"use client";

import { Badge } from "@/components/ui/badge";
import { getStatusMeta, normalizeMatchStatus } from "@/lib/matches";

export default function MatchStatusBadge({ match, status, className = "" }) {
  const normalizedStatus = status || normalizeMatchStatus(match);
  const meta = getStatusMeta(normalizedStatus);

  return (
    <Badge
      variant="outline"
      className={`${meta.className} ${className}`.trim()}
    >
      {meta.label}
    </Badge>
  );
}
