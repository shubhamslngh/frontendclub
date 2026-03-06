"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const FALLBACK_MEDIA_BASE = "http://127.0.0.1:8000";

const normalizeUrl = (file) => {
  if (!file) return null;
  if (file.startsWith("http")) return file;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || FALLBACK_MEDIA_BASE;
  const trimmedBase = base.replace(/\/+$/, "");
  const trimmedPath = file.replace(/^\/+/, "");
  return `${trimmedBase}/${trimmedPath}`;
};

export default function SquadCard({
  player,
  href,
  compact = false,
  className,
}) {
  const fullName =
    `${player.first_name || ""} ${player.last_name || ""}`.trim();

  const imageUrl = normalizeUrl(player.profile_picture) || "/Default.avif";

  const Wrapper = href ? Link : "div";

  return (
    <Wrapper href={href || "#"} className="group block">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl transition duration-500",
          "hover:-translate-y-2",
          compact ? "h-40" : "h-64",
          className,
        )}>
        {/* Full Bleed Image */}
        <Image
          src={imageUrl}
          alt={fullName || "Player"}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-red-800/50 via-white/10 to-transparent" />

        {/* Bottom Text Content */}
        <div className="absolute text-center capitalize bottom-0 left-0 w-full p-4 text-white">
          <p className="text-sm font-semibold tracking-wide">
            {fullName || "Player"}
          </p>
          <p className="text-xs text-white/70">{player.role || "Player"}</p>

          {!compact && player.age && (
            <p className="text-xs text-white/60 mt-1">Age {player.age}</p>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
