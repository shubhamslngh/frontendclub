const STATUS_ALIASES = {
  scheduled: "scheduled",
  upcoming: "scheduled",
  live: "live",
  in_progress: "live",
  inprogress: "live",
  completed: "completed",
  complete: "completed",
  abandoned: "abandoned",
  no_result: "no_result",
  noresult: "no_result",
  cancelled: "cancelled",
  canceled: "cancelled",
};

const BALL_TYPE_META = {
  whiteleather: {
    label: "RedLeather",
    image: "/RedLeatherbg.png",
  },
  redleather: {
    label: "WhiteLeather",
    image: "/WhiteLeatherbg.png",
  },
  pinkleather: {
    label: "PinkLeather",
    image: "/PinkBallbg.png",
  },
  tennis: {
    label: "Tennis",
    image: "/Tennisbg.png",
  },
  other: {
    label: "Other",
    image: "/OtherBallBG.png",
  },
};

const STATUS_META = {
  scheduled: {
    label: "Scheduled",
    shortLabel: "Upcoming fixture",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  live: {
    label: "Live",
    shortLabel: "In progress",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  completed: {
    label: "Completed",
    shortLabel: "Final",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  abandoned: {
    label: "Abandoned",
    shortLabel: "Match abandoned",
    className: "border-slate-300 bg-slate-100 text-slate-700",
  },
  no_result: {
    label: "No Result",
    shortLabel: "No result",
    className: "border-slate-300 bg-slate-100 text-slate-700",
  },
  cancelled: {
    label: "Cancelled",
    shortLabel: "Cancelled",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

const MATCH_SURFACE_META = {
  t10: {
    cardAccent: "border-l-rose-500",
    cardShell: "bg-[linear-gradient(180deg,#fff1f2_0%,#ffffff_44%,#fff7ed_100%)]",
    detailShell: "bg-[linear-gradient(180deg,#ffffff_0%,#fff1f2_100%)]",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  },
  t20: {
    cardAccent: "border-l-orange-500",
    cardShell: "bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_44%,#fffbeb_100%)]",
    detailShell: "bg-[linear-gradient(180deg,#ffffff_0%,#fff7ed_100%)]",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
  },
  odi: {
    cardAccent: "border-l-sky-500",
    cardShell: "bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_44%,#f0fdf4_100%)]",
    detailShell: "bg-[linear-gradient(180deg,#ffffff_0%,#eff6ff_100%)]",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
  },
  test: {
    cardAccent: "border-l-emerald-600",
    cardShell: "bg-[linear-gradient(180deg,#ecfdf5_0%,#ffffff_44%,#f8fafc_100%)]",
    detailShell: "bg-[linear-gradient(180deg,#ffffff_0%,#ecfdf5_100%)]",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  other: {
    cardAccent: "border-l-violet-500",
    cardShell: "bg-[linear-gradient(180deg,#f5f3ff_0%,#ffffff_44%,#faf5ff_100%)]",
    detailShell: "bg-[linear-gradient(180deg,#ffffff_0%,#f5f3ff_100%)]",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
  },
  friendly: {
    pill: "bg-white/80 text-slate-700 border-slate-200",
  },
  tournament: {
    pill: "bg-slate-900 text-white border-slate-900",
  },
};

export const MATCH_STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const formatMatchFormat = (value) => {
  if (!value) return "";

  const normalized = String(value).trim();
  const aliases = {
    t10: "T10",
    t20: "T20",
    odi: "ODI",
    test: "Test",
  };

  const lower = normalized.toLowerCase();
  if (aliases[lower]) return aliases[lower];

  return normalized
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getBallTypeMeta = (ballType) => BALL_TYPE_META[ballType] || BALL_TYPE_META.other;

export const getMatchSurfaceMeta = (match) => {
  const formatKey = match?.match_format || "other";
  const typeKey = match?.match_type || "friendly";

  return {
    ...(MATCH_SURFACE_META[formatKey] || MATCH_SURFACE_META.other),
    typePill: (MATCH_SURFACE_META[typeKey] || MATCH_SURFACE_META.friendly).pill,
  };
};

export const isValidCricketOvers = (value) => {
  if (value === null || value === undefined || value === "") return true;
  return /^\d+(\.[0-5])?$/.test(String(value).trim());
};

export const oversToBalls = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (!isValidCricketOvers(value)) return null;

  const [oversPart, ballsPart = "0"] = String(value).trim().split(".");
  return (Number(oversPart) * 6) + Number(ballsPart);
};

export const parseScoreString = (score) => {
  if (!score) return null;

  const trimmed = String(score).trim();
  const match = trimmed.match(/^(\d+)(?:\s*[/\-]\s*(\d+))?(?:\s*\(\s*(\d+(?:\.[0-5])?)\s*\))?$/);
  if (!match) return null;

  const runs = Number(match[1]);
  const wickets = match[2] !== undefined ? Number(match[2]) : null;
  const overs = match[3] !== undefined ? match[3] : "";

  if (Number.isNaN(runs)) return null;
  if (wickets !== null && (Number.isNaN(wickets) || wickets < 0 || wickets > 10)) return null;
  if (overs && !isValidCricketOvers(overs)) return null;

  return { runs, wickets, overs };
};

export const buildScoreString = ({ runs, wickets, overs }) => {
  const normalizedRuns = runs === "" || runs === null || runs === undefined ? "" : String(runs).trim();
  const normalizedWickets = wickets === "" || wickets === null || wickets === undefined ? "" : String(wickets).trim();
  const normalizedOvers = overs === "" || overs === null || overs === undefined ? "" : String(overs).trim();

  if (!normalizedRuns) return "";

  let result = normalizedRuns;
  if (normalizedWickets) result += `/${normalizedWickets}`;
  if (normalizedOvers) result += ` (${normalizedOvers})`;

  return result;
};

export const getMatchTitle = (match, teamMap = {}) => {
  if (!match) return "Match";

  const team1Id = match.team1 || match.team1_id || match.team_1 || null;
  const team2Id = match.team2 || match.team2_id || match.team_2 || null;
  const team1Name = match.team1_name || (team1Id ? teamMap[team1Id] : null);
  const team2Name = match.team2_name || (team2Id ? teamMap[team2Id] : null);

  if (match.match_title || match.title) return match.match_title || match.title;
  if (match.external_opponent) return `${team1Name || "Team"} vs ${match.external_opponent}`;
  if (team1Name && team2Name) return `${team1Name} vs ${team2Name}`;
  if (team1Id && team2Id) return `Team #${team1Id} vs Team #${team2Id}`;

  return "Match";
};

export const getMatchScore = (match, teamNumber) => {
  if (!match) return "";

  const directKey = `team${teamNumber}_score`;
  if (match[directKey]) return match[directKey];

  const runsKey = `team${teamNumber}_runs`;
  const oversKey = `team${teamNumber}_overs`;
  const runs = match[runsKey];
  const overs = match[oversKey];

  if (runs === null || runs === undefined || runs === "") return "";
  if (overs === null || overs === undefined || overs === "") return String(runs);

  return `${runs} (${overs})`;
};

export const getMatchFormatMeta = (match) => {
  const formatLabel = formatMatchFormat(match?.match_format || match?.match_type);
  const overs = match?.overs_per_side ?? match?.overs_limit;

  if (formatLabel && overs) return `${formatLabel} • ${overs} overs`;
  if (formatLabel) return formatLabel;
  if (overs) return `${overs} overs`;

  return "";
};

export const normalizeMatchStatus = (match) => {
  const backendStatus = String(match?.status || "").trim().toLowerCase();
  if (backendStatus && STATUS_ALIASES[backendStatus]) {
    return STATUS_ALIASES[backendStatus];
  }

  if (match?.is_no_result) return "no_result";
  if (match?.computed_result || match?.result_summary || match?.computed_winner || match?.winner || match?.result) {
    return "completed";
  }

  const hasScore = Boolean(getMatchScore(match, 1) || getMatchScore(match, 2));
  if (hasScore) return "live";

  return "scheduled";
};

export const getStatusMeta = (status) => STATUS_META[status] || STATUS_META.scheduled;

export const getComputedWinnerName = (match, teamMap = {}) => {
  if (!match) return "";

  const winner =
    match.computed_winner_name ||
    match.winner_name ||
    match.computed_winner ||
    match.winner ||
    null;

  if (!winner) return "";
  if (typeof winner === "string" && Number.isNaN(Number(winner))) return winner;

  return teamMap[winner] || "";
};

export const getMatchResultText = (match, teamMap = {}) => {
  if (!match) return "Score Pending";
  if (match.computed_result) return match.computed_result;
  if (match.result_summary) return match.result_summary;

  const normalizedStatus = normalizeMatchStatus(match);
  if (normalizedStatus === "abandoned") return "Match abandoned";
  if (normalizedStatus === "no_result") return "No result";
  if (normalizedStatus === "cancelled") return "Match cancelled";

  const winnerName = getComputedWinnerName(match, teamMap);
  if (winnerName) return `${winnerName} won`;
  if (normalizedStatus === "completed") return "Result available";
  if (normalizedStatus === "live") return "Score update in progress";

  return "Score Pending";
};

export const getPredictedResult = (team1Name, team2Name, team1Score, team2Score, status) => {
  if (status === "abandoned") return "Match abandoned";
  if (status === "no_result") return "No result";
  if (status === "cancelled") return "Match cancelled";

  const first = parseScoreString(team1Score);
  const second = parseScoreString(team2Score);
  if (!first || !second) return "Result pending";

  if (first.runs === second.runs) return "Match tied";

  if (second.runs > first.runs) {
    const wicketsLeft = second.wickets === null ? null : Math.max(0, 10 - second.wickets);
    if (wicketsLeft !== null) return `${team2Name} won by ${wicketsLeft} wicket${wicketsLeft === 1 ? "" : "s"}`;
    return `${team2Name} won`;
  }

  return `${team1Name} won by ${first.runs - second.runs} run${first.runs - second.runs === 1 ? "" : "s"}`;
};

export const validateStructuredScore = ({ runs, wickets, overs, oversLimit, allowEmpty = true }) => {
  const hasAnyValue = [runs, wickets, overs].some((value) => value !== "" && value !== null && value !== undefined);
  if (!hasAnyValue && allowEmpty) return null;

  if (runs === "" || runs === null || runs === undefined) return "Runs are required";
  if (Number(runs) < 0) return "Runs cannot be negative";
  if (wickets !== "" && wickets !== null && wickets !== undefined) {
    const wicketsValue = Number(wickets);
    if (Number.isNaN(wicketsValue) || wicketsValue < 0 || wicketsValue > 10) {
      return "Wickets must be between 0 and 10";
    }
  }
  if (!overs) return "Overs are required";
  if (!isValidCricketOvers(overs)) return "Overs must use cricket notation like 19.2";

  const oversBalls = oversToBalls(overs);
  const limitBalls = oversToBalls(oversLimit);
  if (oversBalls !== null && limitBalls !== null && oversBalls > limitBalls) {
    return "Overs cannot exceed the match limit";
  }

  return null;
};
