"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MatchResultSummary from "@/components/ui/MatchResultSummary";
import MatchScoreEditor from "@/components/ui/MatchScoreEditor";
import ResultPreview from "@/components/ui/ResultPreview";
import { clubService } from "@/services/clubService";
import {
  MATCH_STATUS_OPTIONS,
  buildScoreString,
  getBallTypeMeta,
  getMatchSurfaceMeta,
  getPredictedResult,
  normalizeMatchStatus,
  parseScoreString,
  validateStructuredScore,
} from "@/lib/matches";

const MATCH_FORMAT_OPTIONS = [
  { value: "t10", label: "T10" },
  { value: "t20", label: "T20" },
  { value: "odi", label: "ODI" },
  { value: "test", label: "Test" },
  { value: "other", label: "Other" },
];

const MATCH_TYPE_OPTIONS = [
  { value: "friendly", label: "Friendly" },
  { value: "tournament", label: "Tournament" },
];

const BALL_TYPE_OPTIONS = ["whiteleather", "redleather", "pinkleather", "tennis", "other"].map((value) => ({
  value,
  ...getBallTypeMeta(value),
}));

const createEmptyScore = () => ({ runs: "", wickets: "", overs: "" });

const createEmptyForm = () => ({
  team1: "",
  team2: "",
  external_opponent: "",
  ground: "",
  fixture_date: "",
  start_time: "",
  tournament_id: "",
  match_type: "friendly",
  match_format: "",
  overs_per_side: "",
  team_dress: "",
  toss_winner: "",
  toss_decision: "",
  notes: "",
  status: "scheduled",
  ball_type: "whiteleather",
  team1Score: createEmptyScore(),
  team2Score: createEmptyScore(),
});

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (!data) return "Failed to save match";
  if (typeof data === "string") return data;

  const messages = Object.entries(data).flatMap(([field, value]) => {
    const parts = Array.isArray(value) ? value : [value];
    return parts.map((part) => `${field}: ${part}`);
  });

  return messages[0] || "Failed to save match";
};

const parseDateParts = (value, fallbackTime = "") => {
  if (!value) return { fixture_date: "", start_time: fallbackTime };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { fixture_date: "", start_time: fallbackTime };

  return {
    fixture_date: date.toISOString().slice(0, 10),
    start_time: date.toISOString().slice(11, 16) || fallbackTime,
  };
};

const combineDateAndTime = (fixtureDate, startTime) => {
  if (!fixtureDate) return null;
  const time = startTime || "00:00";
  return new Date(`${fixtureDate}T${time}:00`).toISOString();
};

const getDefaultReportingTime = (startTime) => {
  if (!startTime) return null;

  const [hours, minutes] = String(startTime).split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  const totalMinutes = (hours * 60) + minutes - 30;
  const normalizedMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const reportingHours = String(Math.floor(normalizedMinutes / 60)).padStart(2, "0");
  const reportingMinutes = String(normalizedMinutes % 60).padStart(2, "0");

  return `${reportingHours}:${reportingMinutes}:00`;
};

const maybeAssign = (target, key, value) => {
  if (value === "" || value === null || value === undefined) return;
  target[key] = value;
};

const getFormStatusValue = (match) => {
  const rawStatus = String(match?.status || "").trim().toLowerCase();
  if (["scheduled", "in_progress", "completed", "cancelled"].includes(rawStatus)) {
    return rawStatus;
  }

  const normalizedStatus = normalizeMatchStatus(match);
  if (normalizedStatus === "live") return "in_progress";
  if (normalizedStatus === "completed") return "completed";
  if (normalizedStatus === "cancelled") return "cancelled";

  return "scheduled";
};

const FALLBACK_MEDIA_BASE = "http://127.0.0.1:8000";

const normalizeUrl = (file) => {
  if (!file) return "";
  if (file.startsWith("http://") || file.startsWith("https://")) return file;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || FALLBACK_MEDIA_BASE;
  const trimmedBase = base.replace(/\/+$/, "");
  const trimmedPath = file.replace(/^\/+/, "");
  return `${trimmedBase}/${trimmedPath}`;
};

export default function MatchModal({ open, onOpenChange, match, onSuccess, teamMap = {} }) {
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [grounds, setGrounds] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [matchMode, setMatchMode] = useState("internal");
  const [form, setForm] = useState(createEmptyForm());

  useEffect(() => {
    if (!open) return;

    Promise.all([
      clubService.getTeams(),
      clubService.getGrounds(),
      clubService.getTournaments().catch(() => ({ data: [] })),
    ]).then(([teamsRes, groundsRes, tournamentsRes]) => {
      setTeams(Array.isArray(teamsRes.data) ? teamsRes.data : []);
      setGrounds(Array.isArray(groundsRes.data) ? groundsRes.data : []);
      setTournaments(Array.isArray(tournamentsRes.data) ? tournamentsRes.data : []);
    });
  }, [open]);

  useEffect(() => {
    if (!match) {
      setForm(createEmptyForm());
      setMatchMode("internal");
      return;
    }

    const dateParts = parseDateParts(match.date, match.reporting_time || "");
    const team1Parsed = parseScoreString(match.team1_score) || {
      runs: match.team1_runs,
      wickets: match.team1_wickets,
      overs: match.team1_overs,
    } || createEmptyScore();
    const team2Parsed = parseScoreString(match.team2_score) || {
      runs: match.team2_runs,
      wickets: match.team2_wickets,
      overs: match.team2_overs,
    } || createEmptyScore();

    setMatchMode(match.external_opponent ? "external" : "internal");
    setForm({
      team1: match.team1?.toString() || "",
      team2: match.team2?.toString() || "",
      external_opponent: match.external_opponent || "",
      ground: match.ground?.toString() || "",
      fixture_date: dateParts.fixture_date,
      start_time: dateParts.start_time || match.reporting_time || "",
      tournament_id:
        match.tournament?.id?.toString() ||
        match.tournament_id?.toString() ||
        (typeof match.tournament === "number" ? String(match.tournament) : ""),
      match_type: match.match_type || "friendly",
      match_format: match.match_format || "",
      overs_per_side:
        match.overs_per_side !== null && match.overs_per_side !== undefined
          ? String(match.overs_per_side)
          : match.overs_limit
            ? String(match.overs_limit)
            : "",
      team_dress: match.team_dress || "",
      toss_winner: match.toss_winner?.toString() || "",
      toss_decision: match.toss_decision || "",
      notes: match.notes || "",
      status: getFormStatusValue(match),
      ball_type: match.ball_type || "whiteleather",
      team1Score: {
        runs: team1Parsed.runs !== undefined && team1Parsed.runs !== null ? String(team1Parsed.runs) : "",
        wickets: team1Parsed.wickets !== undefined && team1Parsed.wickets !== null ? String(team1Parsed.wickets) : "",
        overs: team1Parsed.overs || "",
      },
      team2Score: {
        runs: team2Parsed.runs !== undefined && team2Parsed.runs !== null ? String(team2Parsed.runs) : "",
        wickets: team2Parsed.wickets !== undefined && team2Parsed.wickets !== null ? String(team2Parsed.wickets) : "",
        overs: team2Parsed.overs || "",
      },
    });
  }, [match, open]);

  const team1Label = useMemo(
    () => teamMap[form.team1] || teams.find((team) => team.id.toString() === form.team1)?.name || "Team 1",
    [form.team1, teamMap, teams]
  );
  const team2Label = useMemo(() => {
    if (matchMode === "external") return form.external_opponent || "Opponent";
    return teamMap[form.team2] || teams.find((team) => team.id.toString() === form.team2)?.name || "Team 2";
  }, [form.external_opponent, form.team2, matchMode, teamMap, teams]);

  const predictedResult = useMemo(() => {
    return getPredictedResult(
      team1Label,
      team2Label,
      buildScoreString(form.team1Score),
      buildScoreString(form.team2Score),
      form.status
    );
  }, [form.status, form.team1Score, form.team2Score, team1Label, team2Label]);

  useEffect(() => {
    if (form.match_format !== "other" && form.overs_per_side !== "") {
      setForm((current) => ({ ...current, overs_per_side: "" }));
    }
  }, [form.match_format, form.overs_per_side]);

  useEffect(() => {
    if (form.match_type !== "tournament" && form.tournament_id !== "") {
      setForm((current) => ({ ...current, tournament_id: "" }));
    }
  }, [form.match_type, form.tournament_id]);

  const validateFixture = () => {
    if (!form.team1) return "Team 1 is required";
    if (matchMode === "internal" && !form.team2) return "Team 2 is required";
    if (matchMode === "external" && !form.external_opponent.trim()) return "Opponent is required";
    if (matchMode === "internal" && form.team1 === form.team2) return "Teams cannot be the same";
    if (!form.ground) return "Venue is required";
    if (!form.fixture_date) return "Date is required";
    if (!form.match_type) return "Match category is required";
    if (form.match_type === "tournament" && !form.tournament_id) return "Tournament is required";
    if (!form.match_format.trim()) return "Match type is required";
    return null;
  };

  const validateScoreEntry = () => {
    if (form.status === "cancelled") {
      return null;
    }

    if (form.status === "scheduled") return null;

    const team1Error = validateStructuredScore({
      ...form.team1Score,
      oversLimit: form.overs_per_side,
      allowEmpty: form.status === "in_progress",
    });
    if (team1Error) return `Team 1: ${team1Error}`;

    const team2Error = validateStructuredScore({
      ...form.team2Score,
      oversLimit: form.overs_per_side,
      allowEmpty: form.status === "in_progress",
    });
    if (team2Error) return `Team 2: ${team2Error}`;

    if (form.status === "completed") {
      const team1Score = buildScoreString(form.team1Score);
      const team2Score = buildScoreString(form.team2Score);
      if (!team1Score || !team2Score) {
        return "Completed matches require both final scores";
      }
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const fixtureError = validateFixture();
      if (fixtureError) {
        toast.error(fixtureError);
        return;
      }

      const scoreError = validateScoreEntry();
      if (scoreError) {
        toast.error(scoreError);
        return;
      }

      const payload = {
        team1: Number(form.team1),
        team2: matchMode === "internal" ? Number(form.team2) : null,
        external_opponent: matchMode === "external" ? form.external_opponent.trim() : null,
        ground: Number(form.ground),
        date: combineDateAndTime(form.fixture_date, form.start_time),
        match_type: form.match_type,
        tournament: form.match_type === "tournament" && form.tournament_id ? Number(form.tournament_id) : null,
        match_format: form.match_format.trim(),
        overs_per_side: form.overs_per_side ? Number(form.overs_per_side) : null,
        team_dress: form.team_dress.trim(),
        ball_type: form.ball_type,
        team1_runs: form.team1Score.runs === "" ? null : Number(form.team1Score.runs),
        team1_wickets: form.team1Score.wickets === "" ? null : Number(form.team1Score.wickets),
        team1_overs: form.team1Score.overs.trim() || null,
        team2_runs: form.team2Score.runs === "" ? null : Number(form.team2Score.runs),
        team2_wickets: form.team2Score.wickets === "" ? null : Number(form.team2Score.wickets),
        team2_overs: form.team2Score.overs.trim() || null,
      };

      maybeAssign(payload, "status", form.status !== "scheduled" || match?.status ? form.status : "");
      maybeAssign(payload, "reporting_time", getDefaultReportingTime(form.start_time));
      maybeAssign(payload, "toss_winner", form.toss_winner ? Number(form.toss_winner) : null);
      maybeAssign(payload, "toss_decision", form.toss_decision);
      maybeAssign(payload, "notes", form.notes.trim());

      if (match?.id) {
        await clubService.updateMatch(match.id, payload);
        toast.success(form.status === "completed" ? "Match closed" : "Match updated");
      } else {
        await clubService.createMatch(payload);
        toast.success("Fixture created");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(match?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-[calc(100vw-1rem)] overflow-x-hidden overflow-y-auto border-0 bg-[#fcfcfd] p-0 sm:max-w-[980px]">
        <DialogHeader>
          <DialogTitle className="px-6 pt-6">
            {isEditing ? "Manage Match" : "Create Fixture"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 overflow-x-hidden px-4 pb-6 sm:px-6">
          {isEditing ? (
            <Tabs defaultValue={form.status === "completed" ? "score" : "fixture"} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fixture">Fixture Details</TabsTrigger>
                <TabsTrigger value="score">Update Score</TabsTrigger>
              </TabsList>

              <TabsContent value="fixture" className="space-y-5 pt-4">
                <FixtureFields
                  form={form}
                  setForm={setForm}
                  matchMode={matchMode}
                  setMatchMode={setMatchMode}
                  teams={teams}
                  grounds={grounds}
                  tournaments={tournaments}
                />
              </TabsContent>

              <TabsContent value="score" className="space-y-5 pt-4">
                <ScoreFields
                  form={form}
                  setForm={setForm}
                  teams={teams}
                  team1Label={team1Label}
                  team2Label={team2Label}
                  predictedResult={predictedResult}
                  existingMatch={match}
                  teamMap={teamMap}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <FixtureFields
              form={form}
              setForm={setForm}
              matchMode={matchMode}
              setMatchMode={setMatchMode}
              teams={teams}
              grounds={grounds}
              tournaments={tournaments}
            />
          )}

          <DialogFooter>
            <Button disabled={loading} className="w-full">
              {loading
                ? "Saving..."
                : isEditing
                  ? form.status === "completed"
                    ? "Close Match"
                    : "Update Match"
                  : "Create Fixture"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FixtureFields({ form, setForm, matchMode, setMatchMode, teams, grounds, tournaments }) {
  const selectedBallType = getBallTypeMeta(form.ball_type);
  const surfaceMeta = getMatchSurfaceMeta(form);
  const team1 = teams.find((team) => team.id.toString() === form.team1) || null;
  const team2 = matchMode === "internal"
    ? teams.find((team) => team.id.toString() === form.team2) || null
    : null;

  return (
    <div className="space-y-6">
      <div className={`overflow-hidden rounded-3xl border ${surfaceMeta.cardShell}`}>
        <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_120px]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Fixture Setup</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">Create a clean fixture first, then close the match with scores later.</p>
            <p className="mt-2 text-sm text-slate-600">
              Match result and winner are always calculated automatically from the entered scores.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <Image
              src={selectedBallType.image}
              alt={selectedBallType.label}
              width={120}
              height={120}
              className="h-[96px] w-[96px] rounded-full object-cover shadow-[0_16px_40px_rgba(15,23,42,0.16)] md:h-[120px] md:w-[120px]"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border bg-white">
        <div className="border-b px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Fixture Preview</p>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] sm:items-center">
          <PreviewTeam
            name={team1?.name || "Team 1"}
            logo={team1?.logo}
            align="left"
          />
          <div className="flex items-center justify-center">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full border text-lg font-bold ${surfaceMeta.badge}`}>
              VS
            </div>
          </div>
          <PreviewTeam
            name={matchMode === "external" ? (form.external_opponent || "Opponent") : (team2?.name || "Team 2")}
            logo={team2?.logo || null}
            align="right"
            external={matchMode === "external"}
          />
        </div>
      </div>

      <div className="rounded-2xl border bg-white/70 p-4">
        <p className="text-sm font-semibold text-slate-900">Match Mode</p>
        <p className="mt-1 text-xs text-slate-500">
          Create the fixture first. Scores, winner, and result are handled separately after play starts.
        </p>
        <RadioGroup
          value={matchMode}
          onValueChange={setMatchMode}
          className="mt-4 grid gap-3 sm:grid-cols-2"
        >
          <Label className="flex items-center gap-3 rounded-2xl border px-4 py-3">
            <RadioGroupItem value="internal" />
            <span className="flex flex-col">
              <span className="font-medium text-slate-900">Internal</span>
              <span className="text-xs text-slate-500">Both teams are from your club</span>
            </span>
          </Label>
          <Label className="flex items-center gap-3 rounded-2xl border px-4 py-3">
            <RadioGroupItem value="external" />
            <span className="flex flex-col">
              <span className="font-medium text-slate-900">External</span>
              <span className="text-xs text-slate-500">One club team vs outside opponent</span>
            </span>
          </Label>
        </RadioGroup>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="min-w-0 space-y-4 rounded-2xl border bg-white/80 p-4">
          <p className="text-sm font-semibold text-slate-900">Fixture Identity</p>
          <div className="grid gap-4 md:grid-cols-2">
            <LabeledField label="Match Category">
              <Select
                value={form.match_type}
                onValueChange={(value) => setForm({ ...form, match_type: value })}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {MATCH_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </LabeledField>

            {form.match_type === "tournament" ? (
              <LabeledField label="Tournament">
                <Select
                  value={form.tournament_id}
                  onValueChange={(value) => setForm({ ...form, tournament_id: value })}
                >
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select tournament" /></SelectTrigger>
                  <SelectContent>
                    {tournaments.map((tournament) => (
                      <SelectItem key={tournament.id} value={tournament.id.toString()}>
                        {tournament.name || tournament.title || `Tournament #${tournament.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </LabeledField>
            ) : (
              <div className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
                Friendly matches do not need a tournament selection.
              </div>
            )}
          </div>

          <div className="grid gap-4 grid-cols-2">
            <LabeledField label="Team 1">
              <Select
                value={form.team1}
                onValueChange={(value) => setForm({ ...form, team1: value })}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Select team" /></SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </LabeledField>

            <LabeledField label={matchMode === "internal" ? "Team 2" : "Opponent"}>
              {matchMode === "internal" ? (
                <Select
                  value={form.team2}
                  onValueChange={(value) => setForm({ ...form, team2: value })}
                >
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select team" /></SelectTrigger>
                  <SelectContent>
                    {teams
                      .filter((team) => team.id.toString() !== form.team1)
                      .map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>{team.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={form.external_opponent}
                  onChange={(event) => setForm({ ...form, external_opponent: event.target.value })}
                  placeholder="Enter opponent"
                />
              )}
            </LabeledField>
          </div>
        </div>

        <div className="min-w-0 space-y-4 rounded-2xl border bg-white/80 p-4">
          <p className="text-sm font-semibold text-slate-900">Match Setup</p>
          <div className="grid gap-4 grid-cols-2 ">
            <LabeledField label="Match Type">
              <Select
                value={form.match_format}
                onValueChange={(value) => setForm({ ...form, match_format: value })}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Select format" /></SelectTrigger>
                <SelectContent>
                  {MATCH_FORMAT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </LabeledField>

            <LabeledField label="Venue / Ground">
              <Select
                value={form.ground}
                onValueChange={(value) => setForm({ ...form, ground: value })}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Select ground" /></SelectTrigger>
                <SelectContent>
                  {grounds.map((ground) => (
                    <SelectItem key={ground.id} value={ground.id.toString()}>{ground.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </LabeledField>
            <LabeledField label="Date">
              <Input
                type="date"
                value={form.fixture_date}
                onChange={(event) => setForm({ ...form, fixture_date: event.target.value })}
                required
              />
            </LabeledField>
          </div>

          <div className="grid gap-4">
            <LabeledField label="Match Start Time">
              <Input
                type="time"
                value={form.start_time}
                onChange={(event) => setForm({ ...form, start_time: event.target.value })}
                required
              />
            </LabeledField>
            <LabeledField label="Ball Type">
              <Select
                value={form.ball_type}
                onValueChange={(value) => setForm({ ...form, ball_type: value })}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Select ball type" /></SelectTrigger>
                <SelectContent>
                  {BALL_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </LabeledField>
           
          </div>

          {form.match_format === "other" ? (
            <LabeledField label="Overs Limit">
              <Input
                type="number"
                min="1"
                step="1"
                value={form.overs_per_side}
                onChange={(event) => setForm({ ...form, overs_per_side: event.target.value })}
                placeholder="Enter custom overs"
              />
            </LabeledField>
          ) : (
            <div className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
              Overs are fixed by the selected format.
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="min-w-0 space-y-4 rounded-2xl border bg-white/80 p-4">
          <p className="text-sm font-semibold text-slate-900">Toss And Kit</p>
          <div className="grid gap-4 md:grid-cols-2">
            <LabeledField label="Team Dress">
              <Input
                value={form.team_dress}
                onChange={(event) => setForm({ ...form, team_dress: event.target.value })}
                placeholder="Optional"
              />
            </LabeledField>
            <LabeledField label="Toss Winner">
              <Select
                value={form.toss_winner}
                onValueChange={(value) => setForm({ ...form, toss_winner: value })}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </LabeledField>
          </div>

          <LabeledField label="Toss Decision">
            <Select
              value={form.toss_decision}
              onValueChange={(value) => setForm({ ...form, toss_decision: value })}
            >
              <SelectTrigger className="w-full"><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bat">Bat</SelectItem>
                <SelectItem value="bowl">Bowl</SelectItem>
              </SelectContent>
            </Select>
          </LabeledField>
        </div>

        <div className="min-w-0 space-y-4 rounded-2xl border bg-white/80 p-4">
          <p className="text-sm font-semibold text-slate-900">Notes</p>
          <textarea
            className="min-h-[156px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            placeholder="Add fixture notes, arrival instructions, or special conditions"
          />
        </div>
      </div>
    </div>
  );
}

function LabeledField({ label, children }) {
  return (
    <div className="min-w-0 space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</Label>
      {children}
    </div>
  );
}

function PreviewTeam({ name, logo, align = "left", external = false }) {
  const contentAlign = align === "right" ? "sm:items-end sm:text-right" : "sm:items-start sm:text-left";

  return (
    <div className={`flex min-w-0 flex-col items-center gap-3 overflow-hidden ${contentAlign}`}>
      <div className="relative h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-slate-50 shadow-sm">
        {logo ? (
          <Image
            src={normalizeUrl(logo)}
            alt={name}
            fill
            className="object-contain p-3"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl font-bold text-orange-500">
            {(name || "T").charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="break-words text-sm font-semibold text-slate-900">{name}</p>
        <p className="text-xs text-slate-500">{external ? "Outside opponent" : "Club team"}</p>
      </div>
    </div>
  );
}

function ScoreFields({ form, setForm, teams, team1Label, team2Label, predictedResult, existingMatch, teamMap }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-[0.6fr_1.4fr]">
        <div className="space-y-2 rounded-xl border p-4">
          <Label className="text-sm font-medium">Status</Label>
          <Select
            value={form.status}
            onValueChange={(value) => setForm({ ...form, status: value })}
          >
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {MATCH_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Winner and result are calculated automatically from the entered scores.
          </p>
        </div>

        <ResultPreview preview={predictedResult} />
      </div>

      <MatchScoreEditor
        team1Label={team1Label}
        team2Label={team2Label}
        team1Score={form.team1Score}
        team2Score={form.team2Score}
        onTeam1Change={(value) => setForm({ ...form, team1Score: value })}
        onTeam2Change={(value) => setForm({ ...form, team2Score: value })}
      />

      <textarea
        className="min-h-[96px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground"
        value={form.notes}
        onChange={(event) => setForm({ ...form, notes: event.target.value })}
        placeholder="Match notes or reason (optional)"
      />

      {existingMatch && (
        <MatchResultSummary match={existingMatch} teamMap={teamMap} />
      )}

      <div className="rounded-xl border bg-slate-50 p-4 text-xs text-slate-600">
        Enter the final team scores to complete this match. Use In Progress while scores are being entered, Completed when both innings are final, or Cancelled if the fixture did not happen.
      </div>
    </div>
  );
}
