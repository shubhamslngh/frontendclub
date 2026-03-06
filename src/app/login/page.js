"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import { clubService } from "@/services/clubService";

const displayFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const getErrorMessage = (err) => {
    const data = err?.response?.data;
    if (!data) return "";
    if (typeof data === "string") return data;
    const fields = ["detail", "error", "message", "phone_number", "password"];
    for (const field of fields) {
      if (!data[field]) continue;
      const value = data[field];
      if (Array.isArray(value)) return value.join(" ");
      if (typeof value === "string") return value;
    }
    if (typeof data === "object") {
      const messages = Object.entries(data)
        .map(([, value]) => (Array.isArray(value) ? value.join(" ") : value))
        .filter(Boolean);
      if (messages.length) return messages.join(" ");
    }
    return "";
  };

  useEffect(() => {
    const token = localStorage.getItem("club_token");
    if (token) {
      const storedUrl = localStorage.getItem("club_dashboard_url");
      const dashboardUrl = storedUrl && !storedUrl.startsWith("/api/") ? storedUrl : null;
      const role = localStorage.getItem("club_user_role");
      const fallback = role === "player" ? "/" : "/dashboard";
      router.replace(dashboardUrl || fallback);
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await clubService.login(phoneNumber, password);
      const accessToken = data.access || data.token;
      if (accessToken) {
        localStorage.setItem("club_token", accessToken);
      }
      if (data.refresh) {
        localStorage.setItem("club_refresh_token", data.refresh);
      }
      const displayName =
        [data.first_name, data.last_name].filter(Boolean).join(" ").trim() ||
        data.full_name ||
        data.name ||
        data.username ||
        data.phone_number ||
        phoneNumber;
      localStorage.setItem("club_user_name", displayName);
      if (data.player_id !== undefined && data.player_id !== null) {
        localStorage.setItem("club_player_id", String(data.player_id));
      }
      if (data.player_role) {
        localStorage.setItem("club_player_role", data.player_role);
      }
      if (data.role) {
        localStorage.setItem("club_user_role", data.role);
      }
      const dashboardUrl =
        data.dashboard_url && !data.dashboard_url.startsWith("/api/")
          ? data.dashboard_url
          : null;
      if (dashboardUrl) {
        localStorage.setItem("club_dashboard_url", dashboardUrl);
      }
      const fallback = data.role === "player" ? "/" : "/dashboard";
      router.push(dashboardUrl || fallback);
    } catch (err) {
      const message = getErrorMessage(err) || "Invalid phone number or password. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const glassCard =
    "rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-[0_10px_30px_rgba(0,0,0,0.35)]";

  return (
    <div className={`${displayFont.variable} ${bodyFont.variable} min-h-screen bg-[#0B0F1A] text-white`}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,107,0,0.22),transparent_60%)]" />
          <div className="absolute -left-24 top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.12),transparent_65%)] blur-2xl" />
          <div className="absolute left-1/3 top-12 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(46,204,113,0.16),transparent_65%)] blur-2xl" />
          <div className="absolute right-[-120px] top-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_top,rgba(0,180,216,0.10),transparent_65%)] blur-2xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.0),rgba(0,0,0,0.65))]" />
        </div>
        <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-16">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-black ring-2 ring-orange-500/40 shadow-lg">
                <Image
                  src="/KK11-logo.webp"
                  alt="KK Cricket Club"
                  width={62}
                  height={62}
                  className="object-cover"
                  priority
                />
              </span>
              <div>
                <p className={`text-2xl uppercase tracking-[0.2em] ${displayFont.className}`}>
                  KK Cricket Club
                </p>
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-orange-400">
                  Member Access
                </p>
              </div>
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold text-emerald-300 hover:text-orange-300"
            >
              New member? Register
            </Link>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <section className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">
                Club Portal
              </p>
              <h1 className={`text-5xl uppercase ${displayFont.className}`}>
                Member Login
              </h1>
              <p className="max-w-xl text-sm text-white/70">
                Sign in to manage training schedules, match registrations, and club updates. Your member profile keeps
                everything in one place.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "Training schedules",
                  "Ground bookings",
                  "Match updates",
                  "Club announcements",
                ].map((item) => (
                  <div
                    key={item}
                    className={`${glassCard} px-4 py-3 text-sm text-white/80`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className={`${glassCard} p-8`}>
              <div className="mb-6">
                <p className={`text-2xl uppercase ${displayFont.className}`}>Welcome back</p>
                <p className="mt-2 text-sm text-white/60">
                  Use your club credentials to access the dashboard.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full rounded-2xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full rounded-2xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:opacity-60"
                >
                  {loading ? "Authenticating..." : "Sign In"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-white/60">Need a new account? </span>
                <Link
                  href="/register"
                  className="font-semibold text-orange-300 hover:text-emerald-300"
                >
                  Register
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
