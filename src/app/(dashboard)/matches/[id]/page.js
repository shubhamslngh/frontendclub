import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MatchDetailsView from "@/components/ui/MatchDetailsView";

export default function AdminMatchDetailsPage({ params }) {
  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-4">
      <Link href="/matches" className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to matches
      </Link>
      <MatchDetailsView matchId={params.id} />
    </div>
  );
}
