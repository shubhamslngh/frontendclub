import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const FALLBACK_MEDIA_BASE = "http://127.0.0.1:8000";

export function normalizeMediaUrl(file) {
  if (!file || typeof file !== "string") return null;
  if (file.startsWith("http://") || file.startsWith("https://")) return file;

  const base = process.env.NEXT_PUBLIC_API_BASE_URL || FALLBACK_MEDIA_BASE;
  const trimmedBase = base.replace(/\/+$/, "");
  const trimmedPath = file.replace(/^\/+/, "");

  return `${trimmedBase}/${trimmedPath}`;
}
