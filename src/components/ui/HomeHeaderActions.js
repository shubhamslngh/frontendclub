"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomeHeaderActions() {
  const [hasToken, setHasToken] = useState(false);
  const [role, setRole] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("club_token");
    setHasToken(Boolean(token));
    setRole(localStorage.getItem("club_user_role") || "");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("club_token");
    localStorage.removeItem("club_refresh_token");
    localStorage.removeItem("club_user_name");
    localStorage.removeItem("club_user_role");
    localStorage.removeItem("club_dashboard_url");
    localStorage.removeItem("club_player_id");
    localStorage.removeItem("club_player_role");
    setHasToken(false);
    setRole("");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      {hasToken ? (
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-[color:var(--kk-field)] px-4 py-2 text-xs font-semibold text-[color:var(--kk-field)] transition hover:bg-[color:var(--kk-field)] hover:text-white sm:text-sm"
        >
          Logout
        </button>
      ) : (
        <Link
          href="/login"
          className="rounded-full border border-[color:var(--kk-field)] px-4 py-2 text-xs font-semibold text-[color:var(--kk-field)] transition hover:bg-[color:var(--kk-field)] hover:text-white sm:text-sm"
        >
          Member Login
        </Link>
      )}
      {hasToken && role === "player" ? (
        <Link
          href="/player/dashboard"
          className="hidden rounded-full border border-[color:var(--kk-ember)] px-5 py-2 text-sm font-semibold text-[color:var(--kk-ember)] transition hover:bg-[color:var(--kk-ember)] hover:text-white sm:inline-flex"
        >
          Player Dashboard
        </Link>
      ) : hasToken ? (
        <Link
          href="/dashboard"
          className="hidden rounded-full border border-[color:var(--kk-ember)] px-5 py-2 text-sm font-semibold text-[color:var(--kk-ember)] transition hover:bg-[color:var(--kk-ember)] hover:text-white sm:inline-flex"
        >
          Admin Dashboard
        </Link>
      ) : (
        <Link
          href="#contact"
          className="hidden rounded-full border border-[color:var(--kk-ember)] px-5 py-2 text-sm font-semibold text-[color:var(--kk-ember)] transition hover:bg-[color:var(--kk-ember)] hover:text-white sm:inline-flex"
        >
          Join Us
        </Link>
      )}
    </div>
  );
}
