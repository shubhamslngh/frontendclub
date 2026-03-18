import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MatchDetailsView from "@/components/ui/MatchDetailsView";

export default function PublicMatchDetailsPage({ params }) {
  return (
    <div className="space-y-6">
      <Link href="/club/matches" className="inline-flex items-center gap-2 text-sm font-medium text-orange-300 hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to matches
      </Link>
      <MatchDetailsView matchId={params.id} publicView />
    </div>
  );
}
