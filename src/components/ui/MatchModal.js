"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle } from "lucide-react";
import { clubService } from "@/services/clubService";

export default function MatchModal({ open, onOpenChange, match, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [grounds, setGrounds] = useState([]);
  const [matchType, setMatchType] = useState("internal");

  const [form, setForm] = useState({
    team1: "",
    team2: "",
    external_opponent: "",
    ground: "",
    date: "",
    reporting_time: "",
    ball_type: "whiteleather",
    team_dress: "",
    result: "",
    winner: ""
  });

  const isCancelled = form.result === "cancelled";
  const isCompleted = ["win", "loss", "draw"].includes(form.result);

  /* ---------------- Load Data ---------------- */
  useEffect(() => {
    if (!open) return;
    Promise.all([
      clubService.getTeams(),
      clubService.getGrounds()
    ]).then(([t, g]) => {
      setTeams(t.data);
      setGrounds(g.data);
    });
  }, [open]);

  /* ---------------- Populate Edit ---------------- */
  useEffect(() => {
    if (!match) {
      setForm({
        team1: "",
        team2: "",
        external_opponent: "",
        ground: "",
        date: "",
        reporting_time: "",
        ball_type: "whiteleather",
        team_dress: "",
        result: "",
        winner: ""
      });
      setMatchType("internal");
      return;
    }

    setMatchType(match.external_opponent ? "external" : "internal");

    setForm({
      team1: match.team1?.toString() || "",
      team2: match.team2?.toString() || "",
      external_opponent: match.external_opponent || "",
      ground: match.ground?.toString() || "",
      date: match.date
        ? new Date(match.date).toISOString().slice(0, 16)
        : "",
      reporting_time: match.reporting_time || "",
      ball_type: match.ball_type || "whiteleather",
      team_dress: match.team_dress || "",
      result: match.result || "",
      winner: match.winner?.toString() || ""
    });
  }, [match, open]);

  /* ---------------- Submit ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (matchType === "internal" && form.team1 === form.team2) {
        toast.error("Teams cannot be the same");
        return;
      }

      if (isCompleted && !form.winner) {
        toast.error("Winner must be selected");
        return;
      }

      const payload = {
        team1: Number(form.team1),
        team2: matchType === "internal" ? Number(form.team2) : null,
        external_opponent:
          matchType === "external" ? form.external_opponent : null,
        ground: Number(form.ground),
        date: new Date(form.date).toISOString(),
        reporting_time: form.reporting_time,
        ball_type: form.ball_type,
        team_dress: form.team_dress,
        result: form.result || null,
        winner: isCompleted ? Number(form.winner) : null
      };

      if (match?.id) {
        await clubService.updateMatch(match.id, payload);
        toast.success("Match updated");
      } else {
        await clubService.createMatch(payload);
        toast.success("Match created");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save match");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {match ? "Edit Match" : "Schedule Match"}
          </DialogTitle>
        </DialogHeader>

        {/* Cancelled visual */}
        {isCancelled && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-red-700">
            <AlertTriangle className="h-4 w-4" />
            This match has been cancelled
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Match Type */}
          <RadioGroup
            value={matchType}
            onValueChange={setMatchType}
            className="flex gap-4"
            disabled={!!match}
          >
            <Label className="flex items-center gap-2">
              <RadioGroupItem value="internal" /> Internal
            </Label>
            <Label className="flex items-center gap-2">
              <RadioGroupItem value="external" /> External
            </Label>
          </RadioGroup>

          {/* Teams */}
          <Select disabled={isCancelled} value={form.team1}
            onValueChange={v => setForm({ ...form, team1: v })}>
            <SelectTrigger><SelectValue placeholder="Home Team" /></SelectTrigger>
            <SelectContent>
              {teams.map(t => (
                <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {matchType === "internal" ? (
            <Select disabled={isCancelled} value={form.team2}
              onValueChange={v => setForm({ ...form, team2: v })}>
              <SelectTrigger><SelectValue placeholder="Away Team" /></SelectTrigger>
              <SelectContent>
                {teams
                  .filter(t => t.id.toString() !== form.team1)
                  .map(t => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              disabled={isCancelled}
              placeholder="External Team"
              value={form.external_opponent}
              onChange={e => setForm({ ...form, external_opponent: e.target.value })}
            />
          )}

          {/* Date & Ground */}
          <div className="grid grid-cols-2 gap-4">
            <Input disabled={isCancelled} type="datetime-local" value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })} />
            <Select disabled={isCancelled} value={form.ground}
              onValueChange={v => setForm({ ...form, ground: v })}>
              <SelectTrigger><SelectValue placeholder="Ground" /></SelectTrigger>
              <SelectContent>
                {grounds.map(g => (
                  <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              disabled={isCancelled}
              type="time"
              value={form.reporting_time}
              onChange={e => setForm({ ...form, reporting_time: e.target.value })}
              placeholder="Reporting Time"
              required
            />
            <Select
              disabled={isCancelled}
              value={form.ball_type}
              onValueChange={v => setForm({ ...form, ball_type: v })}
            >
              <SelectTrigger><SelectValue placeholder="Ball Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="whiteleather">White Leather</SelectItem>
                <SelectItem value="redleather">Red Leather</SelectItem>
                <SelectItem value="pinkleather">Pink Leather</SelectItem>
                <SelectItem value="tennis">Tennis</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            disabled={isCancelled}
            value={form.team_dress}
            onChange={e => setForm({ ...form, team_dress: e.target.value })}
            placeholder="Team Dress"
            required
          />

          {/* Result */}
          {match && (
            <>
              <Select value={form.result}
                onValueChange={v => setForm({ ...form, result: v })}>
                <SelectTrigger><SelectValue placeholder="Result" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="win">Win</SelectItem>
                  <SelectItem value="loss">Loss</SelectItem>
                  <SelectItem value="draw">Draw</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {isCompleted && (
                <Select value={form.winner}
                  onValueChange={v => setForm({ ...form, winner: v })}>
                  <SelectTrigger><SelectValue placeholder="Winner" /></SelectTrigger>
                  <SelectContent>
                    {teams.map(t => (
                      <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </>
          )}

          <DialogFooter>
            <Button disabled={loading} className="w-full">
              {loading ? "Saving..." : match ? "Update Match" : "Create Match"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
