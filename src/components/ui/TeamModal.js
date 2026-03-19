"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Crown, Shield, Users } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatRoleLabel, normalizeRoleGroup } from "@/lib/players";
import { clubService } from "@/services/clubService";

const ROLE_ORDER = [
  { id: "batter", label: "Batters" },
  { id: "bowler", label: "Bowlers" },
  { id: "all_rounder", label: "All-Rounders" },
  { id: "wicket_keeper", label: "Wicket Keepers" },
  { id: "other", label: "Other Roles" },
];

const getPlayerFullName = (player) =>
  [player?.first_name, player?.last_name].filter(Boolean).join(" ").trim() || "Unknown Player";

function PlayerSelectionCard({
  player,
  checked,
  isCaptain,
  onToggle,
}) {
  return (
    <label
      htmlFor={`player-${player.id}`}
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-3 transition ${
        checked
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <Checkbox
        id={`player-${player.id}`}
        checked={checked}
        onCheckedChange={() => onToggle(player.id)}
        className="mt-0.5"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`text-sm font-semibold ${checked ? "text-white" : "text-slate-950"}`}>
            {getPlayerFullName(player)}
          </p>
          {isCaptain ? (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                checked
                  ? "bg-amber-400/20 text-amber-100"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              Captain
            </span>
          ) : null}
        </div>

        <div className={`mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs ${checked ? "text-white/75" : "text-slate-500"}`}>
          <span>{formatRoleLabel(player.role)}</span>
          {player.age ? <span>Age {player.age}</span> : null}
          {player.membership_active ? <span>Membership Active</span> : null}
          {player.membership?.status ? <span>{player.membership.status}</span> : null}
        </div>
      </div>
    </label>
  );
}

export default function TeamModal({ open, onOpenChange, team, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    captain: "",
    player_ids: [],
  });

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const res = await clubService.getPlayers();
        setPlayers(res.data || []);
      } catch (err) {
        toast.error("Could not load players list");
      }
    };

    if (open) {
      loadPlayers();
    }
  }, [open]);

  useEffect(() => {
    if (team) {
      const existingPlayerIds = team.players?.map((player) => player.id) || [];
      const captainId = team.captain ? team.captain.toString() : "";
      const captainInt = team.captain ? Number(team.captain) : null;
      const normalizedIds =
        captainInt && !existingPlayerIds.includes(captainInt)
          ? [...existingPlayerIds, captainInt]
          : existingPlayerIds;

      setFormData({
        name: team.name || "",
        captain: captainId,
        player_ids: normalizedIds,
      });
      return;
    }

    setFormData({
      name: "",
      captain: "",
      player_ids: [],
    });
  }, [team, open]);

  const togglePlayer = (playerId) => {
    setFormData((prev) => {
      const captainId = prev.captain ? parseInt(prev.captain, 10) : null;
      const isSelected = prev.player_ids.includes(playerId);

      if (isSelected && captainId === playerId) {
        toast.error("Captain must remain in the squad.");
        return prev;
      }

      return {
        ...prev,
        player_ids: isSelected
          ? prev.player_ids.filter((id) => id !== playerId)
          : [...prev.player_ids, playerId],
      };
    });
  };

  const selectedPlayers = useMemo(
    () => players.filter((player) => formData.player_ids.includes(player.id)),
    [players, formData.player_ids]
  );

  const captainOptions = useMemo(
    () => selectedPlayers.sort((a, b) => getPlayerFullName(a).localeCompare(getPlayerFullName(b))),
    [selectedPlayers]
  );

  const playersByRole = useMemo(() => {
    const grouped = ROLE_ORDER.reduce((acc, role) => {
      acc[role.id] = [];
      return acc;
    }, {});

    players.forEach((player) => {
      grouped[normalizeRoleGroup(player.role)].push(player);
    });

    return ROLE_ORDER.map((role) => ({
      ...role,
      players: grouped[role.id].sort((a, b) =>
        getPlayerFullName(a).localeCompare(getPlayerFullName(b))
      ),
    })).filter((role) => role.players.length > 0);
  }, [players]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const captainId = formData.captain ? parseInt(formData.captain, 10) : null;
      const finalSquadIds = [...formData.player_ids];

      if (captainId && !finalSquadIds.includes(captainId)) {
        finalSquadIds.push(captainId);
      }

      const payload = {
        name: formData.name,
        captain: captainId,
        player_ids: finalSquadIds,
      };

      if (team?.id) {
        await clubService.updateTeam(team.id, payload);
        toast.success("Team updated successfully");
      } else {
        await clubService.createTeam(payload);
        toast.success("Team created successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Save Error:", error);
      if (error.response?.data) {
        toast.error(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        toast.error("Failed to save team details.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96vw] h-[90vh] overflow-hidden border-slate-200 p-0 md:max-w-4xl">
        <DialogHeader className="border-b border-slate-200 bg-slate-50 px-6 py-5">
          <DialogTitle className="text-xl font-semibold text-slate-950">
            {team ? "Manage Team" : "Create Team"}
          </DialogTitle>
          <p className="text-sm text-slate-500">
            Build the squad, assign a captain, and organize players by role.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Team Name</Label>
                    <Input
                      placeholder="e.g. Thunderbolts"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Team Captain</Label>
                    <Select
                      value={formData.captain}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, captain: value }))
                      }
                      disabled={captainOptions.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            captainOptions.length === 0
                              ? "Select players first"
                              : "Choose squad captain"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {captainOptions.map((player) => (
                          <SelectItem key={player.id} value={player.id.toString()}>
                            {getPlayerFullName(player)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Squad Assignment</p>
                      <p className="text-sm text-slate-500">
                        Select players from each role group for this team.
                      </p>
                    </div>
                    <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                      {formData.player_ids.length} Selected
                    </div>
                  </div>
                </div>

                <ScrollArea className="h-[52vh] px-4 py-4 md:h-[420px]">
                  <div className="space-y-5">
                    {playersByRole.map((group) => (
                      <section key={group.id} className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{group.label}</p>
                            <p className="text-xs text-slate-500">
                              {group.players.length} available player
                              {group.players.length === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          {group.players.map((player) => (
                            <PlayerSelectionCard
                              key={player.id}
                              player={player}
                              checked={formData.player_ids.includes(player.id)}
                              isCaptain={Number(formData.captain) === player.id}
                              onToggle={togglePlayer}
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-500" />
                  <p className="text-sm font-semibold text-slate-950">Squad Summary</p>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-1">
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Team Name
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {formData.name || "Untitled Team"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Squad Size
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {formData.player_ids.length} players
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Captain
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {captainOptions.find((player) => String(player.id) === formData.captain)
                        ? getPlayerFullName(
                            captainOptions.find(
                              (player) => String(player.id) === formData.captain
                            )
                          )
                        : "Not selected"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl overflow-scroll h-100 border border-green-400 bg-white p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  <p className="text-sm font-semibold text-slate-950">Selected Players</p>
                </div>

                <div className="my-2 space-y-2">
                  {selectedPlayers.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Select players from the role groups to build this squad.
                    </p>
                  ) : (
                    selectedPlayers.map((player) => {
                      const isCaptain = String(player.id) === formData.captain;

                      return (
                        <div
                          key={player.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-950">
                              {getPlayerFullName(player)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatRoleLabel(player.role)}
                            </p>
                          </div>

                          {isCaptain ? (
                            <div className="rounded-full bg-amber-50 p-2 text-amber-700">
                              <Crown className="h-4 w-4" />
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </aside>
          </div>

          <DialogFooter className="border-t border-slate-200 pt-5">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl md:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-950 text-white hover:bg-slate-800 md:w-auto"
            >
              {loading ? "Saving..." : team ? "Update Team" : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
