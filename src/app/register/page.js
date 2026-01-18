"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import { toast } from "sonner";
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

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    phone_number: "",
    password: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("club_token");
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await clubService.register(formData);
      toast.success("Registration successful! Please login.");
      router.push("/login");
    } catch (error) {
      console.error(error);
      const msg = error.response?.data
        ? JSON.stringify(error.response.data)
        : "Registration failed";
      toast.error(msg);
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
                  Join the Club
                </p>
              </div>
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold text-[color:var(--kk-field)] hover:text-[color:var(--kk-ember)]"
            >
              Already a member? Sign in
            </Link>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <section className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[color:var(--kk-field)]">
                New Member
              </p>
              <h1 className={`text-5xl uppercase ${displayFont.className}`}>
                Register Your Spot
              </h1>
              <p className="max-w-xl text-sm text-[color:var(--kk-ink)]/70">
                Get access to coaching schedules, announcements, and match updates. We will confirm your membership
                details after you register.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "Coaching programs",
                  "Match entries",
                  "Member updates",
                  "Club community",
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
                <p className={`text-2xl uppercase ${displayFont.className}`}>Create Account</p>
                <p className="mt-2 text-sm text-[color:var(--kk-ink)]/60">
                  Share your details so we can set up your member profile.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--kk-field)]">
                      First Name
                    </label>
                    <input
                      required
                      className="w-full rounded-2xl border border-[color:var(--kk-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--kk-ember)]"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--kk-field)]">
                      Last Name
                    </label>
                    <input
                      required
                      className="w-full rounded-2xl border border-[color:var(--kk-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--kk-ember)]"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--kk-field)]">
                    Username
                  </label>
                  <input
                    required
                    className="w-full rounded-2xl border border-[color:var(--kk-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--kk-ember)]"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--kk-field)]">
                    Phone Number
                  </label>
                  <input
                    required
                    type="tel"
                    className="w-full rounded-2xl border border-[color:var(--kk-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--kk-ember)]"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--kk-field)]">
                    Password
                  </label>
                  <input
                    required
                    type="password"
                    className="w-full rounded-2xl border border-[color:var(--kk-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--kk-ember)]"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[color:var(--kk-ember)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Registering..." : "Sign Up"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-[color:var(--kk-ink)]/60">Already have an account? </span>
                <Link
                  href="/login"
                  className="font-semibold text-[color:var(--kk-ember)] hover:text-[color:var(--kk-field)]"
                >
                  Sign in
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
