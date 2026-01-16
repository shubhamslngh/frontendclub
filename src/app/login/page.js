"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await clubService.login(username, password);
      localStorage.setItem("club_token", data.token);
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${displayFont.variable} ${bodyFont.variable} min-h-screen bg-[color:var(--kk-sand)] text-[color:var(--kk-ink)]`}
      style={{
        "--kk-sand": "#f7f3e8",
        "--kk-ink": "#1f241a",
        "--kk-ember": "#d66b2d",
        "--kk-field": "#2f6b3f",
        "--kk-cream": "#fff7e8",
        "--kk-line": "#e4d8c4",
      }}
    >
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -left-20 top-10 h-60 w-60 rounded-full bg-[radial-gradient(circle_at_center,_rgba(214,107,45,0.35),_transparent_70%)] blur-2xl" />
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_top,_rgba(47,107,63,0.3),_transparent_65%)] blur-2xl" />
        </div>
        <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-16">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
             <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-900">
                          <Image
                            src="/KK11-logo.webp"
                            alt="KK Cricket Club"
                            width={62}
                            height={62}
                            className=" object-cover"
                            priority
                          />
                        </span>
              <div>
                <p className={`text-2xl uppercase tracking-[0.2em] ${displayFont.className}`}>
                  KK Cricket Club
                </p>
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-[color:var(--kk-field)]">
                  Member Access
                </p>
              </div>
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold text-[color:var(--kk-field)] hover:text-[color:var(--kk-ember)]"
            >
              New member? Register
            </Link>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <section className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[color:var(--kk-field)]">
                Club Portal
              </p>
              <h1 className={`text-5xl uppercase ${displayFont.className}`}>
                Member Login
              </h1>
              <p className="max-w-xl text-sm text-[color:var(--kk-ink)]/70">
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
                    className="rounded-2xl border border-[color:var(--kk-line)] bg-white/70 px-4 py-3 text-sm text-[color:var(--kk-ink)]/80"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-[color:var(--kk-line)] bg-white p-8 shadow-sm">
              <div className="mb-6">
                <p className={`text-2xl uppercase ${displayFont.className}`}>Welcome back</p>
                <p className="mt-2 text-sm text-[color:var(--kk-ink)]/60">
                  Use your club credentials to access the dashboard.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--kk-field)]">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-2xl border border-[color:var(--kk-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--kk-ember)]"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--kk-field)]">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full rounded-2xl border border-[color:var(--kk-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--kk-ember)]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[color:var(--kk-ember)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Authenticating..." : "Sign In"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-[color:var(--kk-ink)]/60">Need a new account? </span>
                <Link
                  href="/register"
                  className="font-semibold text-[color:var(--kk-ember)] hover:text-[color:var(--kk-field)]"
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
