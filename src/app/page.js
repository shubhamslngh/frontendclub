import Image from "next/image";
import Link from "next/link";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import MediaGallery from "@/components/ui/MediaGallery";
import HomeHeaderActions from "@/components/ui/HomeHeaderActions";
import HomeKpis from "@/components/ui/HomeKpis";

const displayFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

const services = [
  {
    title: "Nets",
    description:
      "Sharpen your skills with our regular net practice sessions. Open to players of all levels, these sessions focus on batting, bowling, and fielding drills under expert guidance to help you perform at your best on match day.",
  },
  {
    title: "Grounds",
    description:
      "Book our well-maintained cricket ground for matches, tournaments, or practice sessions. Ideal for clubs, corporate events, and friendly games with all essential facilities available.",
  },
  {
    title: "Coaching",
    description:
      "Professional coaching sessions designed to develop technical skills, game strategy, and fitness. Led by experienced coaches, our program caters to all age groups and skill levels, helping players reach their full potential.",
  },
];


const photoSets = [
  { title: "Net Practice", tone: "from-[#f0b35a] to-[#e67f2d]" },
  { title: "Match Day", tone: "from-[#7dc38a] to-[#2f6b3f]" },
  { title: "Club Spirit", tone: "from-[#d97a6a] to-[#a63a2e]" },
  { title: "Grounds", tone: "from-[#7ab6e8] to-[#2a6fa1]" },
  { title: "Coaching", tone: "from-[#98c9b4] to-[#3c7d64]" },
  { title: "Community", tone: "from-[#f2d28c] to-[#c9892b]" },
];

const products = [
  { title: "Bats and Gloves", detail: "Match-ready gear built for power and control." },
  { title: "Balls and Kits", detail: "Consistent quality for training and game play." },
  { title: "Protective Gear", detail: "Helmets, pads, and guards for confidence at the crease." },
  { title: "Training Tools", detail: "Cones, targets, and fitness tools to level up." },
];

export default function Home() {
  return (
    <div
      className={`${displayFont.variable} ${bodyFont.variable} min-h-screen bg-(--kk-sand) text-(--kk-ink)`}
      style={{
        "--kk-sand": "#f7f3e8",
        "--kk-ink": "#1f241a",
        "--kk-ember": "#d66b2d",
        "--kk-field": "#2f6b3f",
        "--kk-cream": "#fff7e8",
        "--kk-line": "#e4d8c4",
      }}
    >
      <header className="sticky top-0 z-20 border-b border-(--kk-line) bg-(--kk-sand)/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
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
                KK11 Cricket Club
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-(--kk-field)">
                Fueling Passion, Building Champions
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
            <a className="hover:text-(--kk-ember)" href="#services">Services</a>
            <a className="hover:text-(--kk-ember)" href="#photos">Photos</a>
            <a className="hover:text-(--kk-ember)" href="#products">Products</a>
            <a className="hover:text-(--kk-ember)" href="#news">News</a>
            <a className="hover:text-(--kk-ember)" href="#contact">Contact</a>
          </nav>
          <HomeHeaderActions />
        </div>
      </header>

      <main>
        <section className="relative mx-auto overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(214,107,45,0.35),transparent_70%)] blur-2xl" />
            <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_top,rgba(47,107,63,0.3),transparent_65%)] blur-2xl" />
            <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_bottom,rgba(255,247,232,0.9),transparent_65%)] blur-2xl" />
          </div>
          <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20 lg:flex-row lg:items-center">
            <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-(--kk-field)">
                Welcome to KK Cricket Club
              </p>
              <h1 className={`text-5xl font-semibold uppercase leading-none sm:text-6xl lg:text-7xl ${displayFont.className}`}>
                Fueling Passion,
                <span className="block text-(--kk-ember)">Building Champions.</span>
              </h1>
              <p className="max-w-xl text-lg text-(--kk-ink)/80">
                KK Cricket Club is a home for players, learners, and the community. From structured coaching to match-ready
                facilities, we build skills, confidence, and team spirit every day.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="#contact"
                  className="rounded-full bg-(--kk-ember) px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Join Us Now
                </Link>
                <Link
                  href="#services"
                  className="rounded-full border border-(--kk-field) px-6 py-3 text-sm font-semibold text-(--kk-field) transition hover:bg-(--kk-field) hover:text-white"
                >
                  View Services
                </Link>
              </div>
            </div>
            <div
              className="grid flex-1 gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-bottom-6 duration-700"
              style={{ animationDelay: "120ms" }}
            >
              <div className="rounded-3xl border border-(--kk-line) bg-(--kk-cream) p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.4em] text-(--kk-field)">Training</p>
                <p className={`mt-3 text-3xl uppercase ${displayFont.className}`}>Net Sessions</p>
                <p className="mt-4 text-sm text-(--kk-ink)/70">
                  Weekly drills focused on fundamentals, reflexes, and match readiness.
                </p>
              </div>
              <div className="rounded-3xl border border-(--kk-line) bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.4em] text-(--kk-field)">Facilities</p>
                <p className={`mt-3 text-3xl uppercase ${displayFont.className}`}>Ground Booking</p>
                <p className="mt-4 text-sm text-(--kk-ink)/70">
                  Book our ground for matches, tournaments, or corporate events.
                </p>
              </div>
              <div className="rounded-3xl border border-(--kk-line) bg-white p-6 shadow-sm sm:col-span-2">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-(--kk-field)">Club Promise</p>
                    <p className={`mt-3 text-3xl uppercase ${displayFont.className}`}>
                      Community and Competition
                    </p>
                    <p className="mt-4 max-w-xl text-sm text-(--kk-ink)/70">
                      We create a space where beginners find guidance and experienced players sharpen their edge.
                    </p>
                  </div>

                </div>
                
              </div>

            </div>

          </div>
          <HomeKpis />

        </section>

        <section id="services" className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-(--kk-field)">
                Services
              </p>
              <h2 className={`mt-4 text-4xl uppercase ${displayFont.className}`}>Built for Every Player</h2>
            </div>
            <p className="max-w-md text-sm text-(--kk-ink)/70">
              Structured sessions, professional coaching, and match-ready facilities designed to help you grow.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {services.map((service, index) => (
              <div
                key={service.title}
                className="group rounded-3xl border border-(--kk-line) bg-white p-6 shadow-sm transition hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-6 duration-700"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <p className={`text-2xl uppercase ${displayFont.className}`}>{service.title}</p>
                <p className="mt-4 text-sm text-(--kk-ink)/70">{service.description}</p>
                <div className="mt-6 h-1 w-12 rounded-full bg-(--kk-ember) transition group-hover:w-20" />
              </div>
            ))}
          </div>
        </section>

        <section id="photos" className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-(--kk-field)">
                Photos
              </p>
              <h2 className={`mt-4 text-4xl uppercase ${displayFont.className}`}>Moments at the Club</h2>
            </div>
            <Link
              href="#contact"
              className="text-sm font-semibold text-(--kk-ember)"
            >
              View All Photos
            </Link>
          </div>
          <div className="mt-10">
            <MediaGallery fallback={photoSets} />
          </div>
        </section>

        <section id="products" className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="rounded-3xl border border-(--kk-line) bg-white p-10 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-(--kk-field)">
                  Products We Use
                </p>
                <h2 className={`mt-4 text-4xl uppercase ${displayFont.className}`}>Trusted Gear</h2>
              </div>
              <p className="max-w-md text-sm text-(--kk-ink)/70">
                We use top-quality cricket gear and equipment from trusted brands to ensure the best performance and safety.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {products.map((product, index) => (
                <div
                  key={product.title}
                  className="rounded-2xl border border-(--kk-line) bg-(--kk-cream) p-6 animate-in fade-in slide-in-from-bottom-6 duration-700"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <p className={`text-2xl uppercase ${displayFont.className}`}>{product.title}</p>
                  <p className="mt-3 text-sm text-(--kk-ink)/70">{product.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="news" className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-(--kk-field)">
                News
              </p>
              <h2 className={`mt-4 text-4xl uppercase ${displayFont.className}`}>Club Updates</h2>
            </div>
            <Link
              href="#contact"
              className="text-sm font-semibold text-(--kk-ember)"
            >
              View All News
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {["Match Fixtures", "Coaching Batches", "Ground Availability"].map((title, index) => (
              <div
                key={title}
                className="rounded-3xl border border-(--kk-line) bg-white p-6 shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-700"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <p className={`text-xl uppercase ${displayFont.className}`}>{title}</p>
                <p className="mt-3 text-sm text-(--kk-ink)/70">
                  Fresh updates are posted here. Stay tuned for schedules, registrations, and announcements.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="rounded-3xl border border-(--kk-line) bg-(--kk-ember) p-10 text-white shadow-sm">
            <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em]">Join Us Now</p>
                <h2 className={`mt-4 text-4xl uppercase ${displayFont.className}`}>
                  Become Part of the KK Cricket Club
                </h2>
                <p className="mt-4 text-sm text-white/80">
                  Looking for coaching, ground bookings, or a competitive team environment? Share your details and
                  we will reach out with the next steps.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link
                    href="/login"
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-(--kk-ember)"
                  >
                    Member Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full border border-white px-6 py-3 text-sm font-semibold text-white"
                  >
                    Register Interest
                  </Link>
                </div>
              </div>
              <form className="rounded-2xl bg-white/10 p-6 backdrop-blur">
                <div className="grid gap-4">
                  <input
                    className="w-full rounded-full border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/70"
                    placeholder="Full name"
                    type="text"
                  />
                  <input
                    className="w-full rounded-full border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/70"
                    placeholder="Email address"
                    type="email"
                  />
                  <input
                    className="w-full rounded-full border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/70"
                    placeholder="Tell us what you are looking for"
                    type="text"
                  />
                  <button
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-(--kk-ember)"
                    type="button"
                  >
                    Send Details
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
        
      </main>
    </div>
  );
}
