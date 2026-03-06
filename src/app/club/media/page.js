"use client";

import Link from "next/link";
import { Bebas_Neue } from "next/font/google";
import MediaGallery from "@/components/ui/MediaGallery";

const displayFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export default function PublicMediaPage() {
  return (
    <div className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-400">Club Media</p>
            <h1 className={`text-4xl uppercase ${displayFont.className}`}>Gallery</h1>
          </div>
          <Link href="/" className="text-sm font-semibold text-orange-400 hover:underline">
            Back to Home
          </Link>
        </div>
        <MediaGallery />
    </div>
  );
}
