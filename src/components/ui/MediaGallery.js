"use client";

import { useEffect, useRef, useState } from "react";
import { clubService } from "@/services/clubService";

const FALLBACK_MEDIA_BASE = "http://127.0.0.1:8000";

const normalizeUrl = (file) => {
  if (!file) return "";
  if (file.startsWith("http://") || file.startsWith("https://")) return file;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || FALLBACK_MEDIA_BASE;
  const needsSlash = file.startsWith("/") ? "" : "/";
  return `${base}${needsSlash}${file}`;
};

export default function MediaGallery() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);
  const featuredRef = useRef(null);

  useEffect(() => {
    const loadMedia = async () => {
      try {
        const res = await clubService.getMedia();
        const data = Array.isArray(res.data) ? res.data : [];
        setItems(data);
        if (data.length > 0) setActive(data[0]); // default first featured
      } catch (error) {
        console.error("Failed to load media", error);
      }
    };
    loadMedia();
  }, []);

  if (!active) return null;

  return (
    <section className="text-white py-12 sm:py-16">
      <div className="space-y-12">

        {/* FEATURED SECTION */}
        <div ref={featuredRef} className="relative h-[320px] overflow-hidden rounded-3xl sm:h-[420px] lg:h-[520px]">
          {active && (
            <>
              <img
                src={normalizeUrl(active.file)}
                alt={active.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 sm:p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">Featured</p>
                <h3 className="mt-2 text-lg font-semibold text-white sm:text-2xl">
                  {active.title || "Club Moment"}
                </h3>
              </div>
            </>
          )}
        </div>

        {/* GRID SECTION */}
        <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible lg:grid-cols-4">
          {items.map((item) => {
            const isActive = active?.id === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActive(item);
                  featuredRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`relative h-44 min-w-[180px] overflow-hidden rounded-2xl text-left transition-all duration-300 sm:min-w-0 sm:h-52 ${
                  isActive ? "ring-2 ring-[color:var(--kk-ember)]" : ""
                }`}
              >
                <img
                  src={normalizeUrl(item.file)}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent p-3">
                  <p className="text-xs font-semibold text-white">
                    {item.title || "Club Highlight"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
