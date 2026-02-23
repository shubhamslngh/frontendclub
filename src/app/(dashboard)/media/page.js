"use client";

import { useEffect, useState } from "react";
import { clubService } from "@/services/clubService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

const FALLBACK_MEDIA_BASE = "http://127.0.0.1:8000";

const normalizeUrl = (file) => {
  if (!file) return "";
  if (file.startsWith("http://") || file.startsWith("https://")) return file;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || FALLBACK_MEDIA_BASE;
  const needsSlash = file.startsWith("/") ? "" : "/";
  return `${base}${needsSlash}${file}`;
};

const getTypeBadge = (type) => {
  const normalized = (type || "").toLowerCase();
  if (normalized === "video") {
    return <Badge className="bg-blue-600 hover:bg-blue-700">Video</Badge>;
  }
  if (normalized === "photo") {
    return <Badge className="bg-green-600 hover:bg-green-700">Photo</Badge>;
  }
  return <Badge variant="outline">{type || "Unknown"}</Badge>;
};

export default function MediaPage() {
  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    media_type: "photo",
    file: null,
  });

  const loadMedia = async () => {
    try {
      const res = await clubService.getMedia();
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load media", error);
      setItems([]);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!formData.file) {
      toast.error("Please select a file to upload.");
      return;
    }

    const payload = new FormData();
    payload.append("file", formData.file);
    payload.append("media_type", formData.media_type);
    if (formData.title) payload.append("title", formData.title);

    try {
      setUploading(true);
      await clubService.uploadMedia(payload);
      toast.success("Media uploaded.");
      setFormData({ title: "", media_type: "photo", file: null });
      await loadMedia();
    } catch (error) {
      console.error("Failed to upload media", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this media item?");
    if (!confirmed) return;
    try {
      setDeletingId(id);
      await clubService.deleteMedia(id);
      toast.success("Media deleted.");
      await loadMedia();
    } catch (error) {
      console.error("Failed to delete media", error);
      toast.error("Delete failed. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
        <p className="text-muted-foreground">
          View club photos and videos uploaded through the admin.
        </p>
      </div>

      <form
        onSubmit={handleUpload}
        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.7fr_1fr_auto] md:items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Title</label>
            <Input
              value={formData.title}
              onChange={(event) => setFormData({ ...formData, title: event.target.value })}
              placeholder="e.g. Net Practice"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Media Type</label>
            <select
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
              value={formData.media_type}
              onChange={(event) => setFormData({ ...formData, media_type: event.target.value })}
            >
              <option value="photo">Photo</option>
              <option value="video">Video</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">File</label>
            <input
              className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
              type="file"
              accept={formData.media_type === "video" ? "video/*" : "image/*"}
              onChange={(event) => setFormData({ ...formData, file: event.target.files?.[0] || null })}
            />
          </div>
          <Button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </form>

      <div className="border rounded-lg bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Preview</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No media uploaded yet.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const mediaType = (item.media_type || "").toLowerCase();
                const isVideo = mediaType === "video";
                const src = normalizeUrl(item.file);
                return (
                  <TableRow key={item.id} className="hover:bg-slate-50/50">
                    <TableCell className="w-28">
                      <div className="h-16 w-24 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                        {isVideo ? (
                          <video className="h-full w-full object-cover" src={src} />
                        ) : (
                          <img className="h-full w-full object-cover" src={src} alt={item.title || "Media"} />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.title || "Untitled"}
                    </TableCell>
                    <TableCell>{getTypeBadge(item.media_type)}</TableCell>
                    <TableCell>
                      {item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? "Deleting..." : "Delete"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
