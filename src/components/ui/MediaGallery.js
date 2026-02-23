"use client";

import { useEffect, useState } from "react";
import { clubService } from "@/services/clubService";

const FALLBACK_MEDIA_BASE = "http://127.0.0.1:8000";

const normalizeUrl = (file) => {
  if (!file) return "";
  if (file.startsWith("http://") || file.startsWith("https://")) return file;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || FALLBACK_MEDIA_BASE;
  const needsSlash = file.startsWith("/") ? "" : "/";
  return `${base}${needsSlash}${file}`;
};

export default function MediaGallery({ fallback = [] }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    const loadMedia = async () => {
      try {
        const res = await clubService.getMedia();
        if (!isActive) return;
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to load media", error);
        if (isActive) setItems([]);
      } finally {
        if (isActive) setLoading(false);
      }
    };
    loadMedia();
    return () => {
      isActive = false;
    };
  }, []);

  if (!loading && items.length === 0 && fallback.length === 0) {
    return (
      <div className="rounded-3xl border border-[color:var(--kk-line)] bg-white p-6 text-sm text-[color:var(--kk-ink)]/70">
        Gallery items will appear here once media is uploaded.
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {fallback.map((photo) => (
          <div
            key={photo.title}
            className={`relative h-44 overflow-hidden rounded-3xl bg-gradient-to-br ${photo.tone} p-4 text-white shadow-sm`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.3),_transparent_60%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <p className="text-xs uppercase tracking-[0.4em]">Gallery</p>
              <p className="text-2xl uppercase">{photo.title}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const mediaType = (item.media_type || "").toLowerCase();
        const isVideo = mediaType === "video";
        const src = normalizeUrl(item.file);

        return (
          <div
            key={item.id || `${item.title}-${src}`}
            className="group relative h-44 overflow-hidden rounded-3xl border border-[color:var(--kk-line)] bg-white shadow-sm"
          >
            {isVideo ? (
              <video
                className="h-full w-full object-cover"
                src={src}
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                className="h-full w-full object-cover"
                src={src}
                alt={item.title || "Gallery image"}
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="absolute bottom-3 left-3 right-3 text-white opacity-0 transition group-hover:opacity-100">
              <p className="text-xs uppercase tracking-[0.3em]">{isVideo ? "Video" : "Photo"}</p>
              <p className="text-sm font-semibold">{item.title || "Club Moment"}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
