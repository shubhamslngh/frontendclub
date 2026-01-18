"use client";

import React, { useEffect, useState, useMemo } from "react";
import { clubService } from "@/services/clubService";
import MatchModal from "@/components/ui/MatchModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  Edit,
  Swords,
  Circle,
  Sparkles,
  Shirt,
  AlertCircle,
} from "lucide-react";
import { format, isValid } from "date-fns";

// --- Configuration Constants ---
const BALL_TYPES = {
  whiteleather: {
    label: "White Leather",
    bg: "bg-slate-100",
    text: "text-slate-700",
    iconColor: "text-slate-500",
  },
  redleather: {
    label: "Red Leather",
    bg: "bg-red-50",
    text: "text-red-700",
    iconColor: "text-red-500",
  },
  pinkleather: {
    label: "Pink Leather",
    bg: "bg-rose-50",
    text: "text-rose-700",
    iconColor: "text-rose-500",
  },
  tennis: {
    label: "Tennis",
    bg: "bg-lime-50",
    text: "text-lime-700",
    iconColor: "text-lime-500",
  },
  other: {
    label: "Other",
    bg: "bg-amber-50",
    text: "text-amber-700",
    iconColor: "text-amber-500",
  },
};

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Data Loading ---
  const loadData = async () => {
    setLoading(true);
    try {
      const [matchRes, teamRes] = await Promise.all([
        clubService.getMatches(),
        clubService.getTeams(),
      ]);

      setMatches(matchRes.data || []);

      const teamMap = {};
      if (teamRes.data) {
        teamRes.data.forEach((t) => {
          teamMap[t.id] = t.name;
        });
      }
      setTeams(teamMap);
    } catch (error) {
      console.error("Failed to load match data", error);
      // Optional: Add toast notification here
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Derived State (Sorting & Filtering) ---
  const { upcomingMatches, pastMatches } = useMemo(() => {
    const now = Date.now();

    // Sort: Upcoming (Soonest -> Latest), Past (Latest -> Oldest)
    const upcoming = matches
      .filter((m) => new Date(m.date).getTime() > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const past = matches
      .filter((m) => new Date(m.date).getTime() <= now)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return { upcomingMatches: upcoming, pastMatches: past };
  }, [matches]);

  // --- Handlers ---
  const handleEdit = (match) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedMatch(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Match Schedule</h1>
          <p className="text-muted-foreground">
            Manage fixtures, results, and team assignments.
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Match
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingMatches.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastMatches.length})
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <MatchSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="upcoming">
                {upcomingMatches.length ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingMatches.map((m) => (
                      <MatchCard
                        key={m.id}
                        match={m}
                        teams={teams}
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState text="No upcoming matches scheduled." />
                )}
              </TabsContent>

              <TabsContent value="past">
                {pastMatches.length ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pastMatches.map((m) => (
                      <MatchCard
                        key={m.id}
                        match={m}
                        teams={teams}
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState text="No past matches found." />
                )}
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>

      {/* Modal */}
      <MatchModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        match={selectedMatch}
        onSuccess={loadData}
      />
    </div>
  );
}

// --- Sub-Components (Extracted for performance) ---

const MatchCard = ({ match, teams, onEdit }) => {
  const isInternal = !match.external_opponent;
  // Handle case where teams might not be loaded yet or ID is invalid
  const team1 = teams[match.team1] || (match.team1 ? "Unknown Team" : "TBD");
  const team2 = isInternal
    ? teams[match.team2] || (match.team2 ? "Unknown Team" : "TBD")
    : match.external_opponent;

  const matchDate = new Date(match.date);
  const isValidDate = isValid(matchDate);
  const status = match.result ? "completed" : "scheduled";

  // Ball Config Logic
  const ballConfig = BALL_TYPES[match.ball_type] || BALL_TYPES.other;

  return (
    <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-200">
      <CardContent className="p-5 space-y-4">
        {/* Date & Status Header */}
        <div className="flex justify-between items-start">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {isValidDate ? format(matchDate, "EEE, MMM d") : "Invalid Date"}
            {isValidDate && (
              <>
                <Clock className="h-4 w-4 ml-2" />
                {format(matchDate, "h:mm a")}
              </>
            )}
          </div>
          <Badge
            variant={status === "completed" ? "secondary" : "default"}
            className="capitalize"
          >
            {status}
          </Badge>
        </div>

        {/* Teams Display */}
        <div className="flex items-center justify-between text-center py-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold truncate" title={team1}>{team1}</h3>
          </div>

          <div className="flex flex-col items-center px-2 shrink-0">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <Swords className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-[10px] mt-1 text-muted-foreground font-medium">
              VS
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold truncate" title={team2}>{team2}</h3>
            {!isInternal && (
              <span className="text-[10px] text-amber-600 block">(Visitor)</span>
            )}
          </div>
        </div>

        {/* Footer Meta Data */}
        <div className="grid gap-3 border-t pt-3 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <MapPin className="h-3.5 w-3.5 text-red-500" />
              Grnd {match.ground}
            </span>

            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${ballConfig.bg} ${ballConfig.text}`}>
              <Circle className={`h-2.5 w-2.5 ${ballConfig.iconColor}`} />
              {ballConfig.label}
            </span>

            {match.reporting_time && (
              <span className="flex items-center gap-1 text-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                {match.reporting_time}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            {match.team_dress ? (
              <span className="flex items-center gap-1.5 text-xs truncate max-w-[120px]" title={match.team_dress}>
                <Shirt className="h-3.5 w-3.5 text-slate-500" />
                {match.team_dress}
              </span>
            ) : (
              <span />
            )}

            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2"
              onClick={() => onEdit(match)}
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg py-16 bg-muted/20 text-muted-foreground">
      <AlertCircle className="h-10 w-10 mb-3 opacity-20" />
      <p>{text}</p>
    </div>
  );
}

function MatchSkeleton() {
  return (
    <div className="border rounded-xl p-5 space-y-4">
      <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
      <div className="flex justify-between items-center px-4">
        <div className="h-6 bg-muted rounded w-16 animate-pulse" />
        <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
        <div className="h-6 bg-muted rounded w-16 animate-pulse" />
      </div>
      <div className="h-10 bg-muted rounded w-full animate-pulse mt-4" />
    </div>
  );
}