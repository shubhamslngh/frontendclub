"use client";

import { useEffect, useState, useMemo } from "react";
import { clubService } from "@/services/clubService";
import { motion, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import {
  Users,
  Shield,
  Swords,
  Calendar,
  Trophy,
  Crown,
  MapPin,
  Image as ImageIcon
} from "lucide-react";

// --- Configuration ---

// Map your distinct colors to Tailwind/CSS Variable classes
const TONE_CONFIG = {
  ink: {
    text: "text-white",
    bg: "bg-white/5",
    border: "border-white/15",
  },
  field: {
    text: "text-emerald-300",
    bg: "bg-emerald-400/10",
    border: "border-emerald-300/30",
  },
  ember: {
    text: "text-orange-300",
    bg: "bg-orange-400/10",
    border: "border-orange-300/30",
  },
};

// Map icons to labels
const getIconForLabel = (label) => {
  if (label.includes("Players")) return Users;
  if (label.includes("Teams")) return Shield;
  if (label.includes("Upcoming Matches")) return Calendar; // Specific check before "Matches"
  if (label.includes("Matches")) return Swords;
  if (label.includes("Upcoming Tournaments")) return Crown; // Specific check before "Tournaments"
  if (label.includes("Tournaments")) return Trophy;
  if (label.includes("Grounds")) return MapPin;
  if (label.includes("Media")) return ImageIcon;
  return Trophy;
};

const getRouteForLabel = (label) => {
  if (label.includes("Players")) return "/club/players";
  if (label.includes("Teams")) return "/club/teams";
  if (label.includes("Upcoming Matches")) return "/club/matches";
  if (label.includes("Matches")) return "/club/matches";
  if (label.includes("Media")) return "/club/media";
  return null;
};

// --- Sub-Components ---

// 1. Animated Counter Component
function AnimatedNumber({ value }) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    // If value is numeric, animate to it. If "--", do nothing.
    if (!isNaN(value)) {
      spring.set(value);
    }
  }, [value, spring]);

  if (isNaN(value)) return <span>--</span>;
  return <motion.span>{display}</motion.span>;
}

// 2. Single Card Component
function StatCard({ label, value, tone }) {
  const config = TONE_CONFIG[tone] || TONE_CONFIG.ink;
  const Icon = getIconForLabel(label);
  const href = getRouteForLabel(label);

  const card = (
    <motion.div
      variants={{
        hidden: { opacity: 0.9, y: 10, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1 },
      }}
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className={`
        relative w-full
        overflow-hidden rounded-3xl border
        ${config.border}
        bg-white/5
        p-4 shadow-[0_12px_30px_rgba(0,0,0,0.35)] sm:p-6
        backdrop-blur-lg
        ${href ? "cursor-pointer transition hover:-translate-y-1 hover:border-orange-500/40 hover:bg-white/10" : ""}
      `}
    >
      {/* Accent glow */}
      <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${config.bg} blur-3xl opacity-60`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,122,26,0.08),transparent_60%)]" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex flex-col gap-1 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/60">
            {label}
          </p>
        </div>

        {/* Icon */}
        <motion.div
          whileHover={{ rotate: 8, scale: 1.1 }}
          className={`
            flex h-11 w-11 items-center justify-center
            rounded-xl border
            ${config.border}
            ${config.bg}
          `}
        >
          <Icon className={`h-5 w-5 ${config.text}`} />
        </motion.div>
      </div>

      {/* Value */}
      <div
        className={`
          relative z-10 mt-4 text-left
          text-[34px] font-bold leading-none sm:text-[42px]
          ${config.text}
          font-[family-name:var(--font-display)]
        `}
      >
        <AnimatedNumber value={value} />
      </div>

      {/* Bottom accent line */}
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={`
          absolute bottom-0 left-0 h-[3px]
          bg-gradient-to-r
          from-transparent
          via-[color:var(--kk-ember)]
          to-transparent
          opacity-40
        `}
      />
    </motion.div>
  );

  if (!href) return card;

  return (
    <Link href={href} className="block h-full">
      {card}
    </Link>
  );
}


// --- Main Component ---

const fallbackStats = [
  { label: "Total Players", value: "--", tone: "ink" },
  { label: "Total Teams", value: "--", tone: "field" },
  { label: "Total Matches", value: "--", tone: "ember" },
  { label: "Upcoming Matches", value: "--", tone: "ember" },
  { label: "Total Tournaments", value: "--", tone: "field" },
  { label: "Upcoming Tournaments", value: "--", tone: "field" },
  { label: "Total Grounds", value: "--", tone: "ink" },
  { label: "Total Media", value: "--", tone: "ember" },
];

export default function HomeKpis() {
  const [stats, setStats] = useState(fallbackStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    const loadKpis = async () => {
      try {
        const res = await clubService.getKpis();
        const data = res.data || {};

        const nextStats = [
          { label: "Players", value: data.total_players ?? 0, tone: "ink" },
          { label: "Teams", value: data.total_teams ?? 0, tone: "field" },
          { label: "Matches", value: data.total_matches ?? 0, tone: "ember" },
          { label: "Upcoming Matches", value: data.upcoming_matches ?? 0, tone: "ember" },
          { label: "Tournaments", value: data.total_tournaments ?? 0, tone: "field" },
          { label: "Upcoming Tournaments", value: data.upcoming_tournaments ?? 0, tone: "field" },
          { label: "Grounds", value: data.total_grounds ?? 0, tone: "ink" },
          { label: "Media", value: data.total_media ?? 0, tone: "ember" },
        ];

        if (isActive) {
          setStats(nextStats);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load KPIs", error);
        if (isActive) {
          setStats(fallbackStats);
          setLoading(false);
        }
      }
    };

    loadKpis();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className="
      grid
      w-full
      gap-4
      p-2
      grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-4
      sm:gap-6
      sm:p-4
    "
    >
      {stats.map((stat, index) => (
        <StatCard
          key={stat.label + index}
          label={stat.label}
          value={stat.value}
          tone={stat.tone}
        />
      ))}
    </motion.div>
  );
}
