"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ScoreRow({ label, value, onChange, disabled, helper }) {
  return (
    <div className="space-y-3 rounded-xl border p-4">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input
          disabled={disabled}
          type="number"
          min="0"
          value={value.runs}
          onChange={(event) => onChange({ ...value, runs: event.target.value })}
          placeholder="Runs"
        />
        <Input
          disabled={disabled}
          type="number"
          min="0"
          max="10"
          value={value.wickets}
          onChange={(event) => onChange({ ...value, wickets: event.target.value })}
          placeholder="Wickets"
        />
        <Input
          disabled={disabled}
          value={value.overs}
          onChange={(event) => onChange({ ...value, overs: event.target.value })}
          placeholder="Overs"
        />
      </div>
    </div>
  );
}

export default function MatchScoreEditor({
  team1Label,
  team2Label,
  team1Score,
  team2Score,
  onTeam1Change,
  onTeam2Change,
  disabled = false,
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Final Score</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Enter the final team scores to complete this match. Winner and result are calculated automatically from the entered scores.
        </p>
      </div>

      <ScoreRow
        label={team1Label}
        value={team1Score}
        onChange={onTeam1Change}
        disabled={disabled}
        helper="Example: 145 / 7 in 20.0 overs"
      />

      <ScoreRow
        label={team2Label}
        value={team2Score}
        onChange={onTeam2Change}
        disabled={disabled}
        helper="Example: 132 / 9 in 20.0 overs"
      />
    </div>
  );
}
