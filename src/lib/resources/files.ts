import type { ResourceType } from "../models/resources";

export type SharerRole = "admin" | "mentor";

export function resourceTypeFromMime(mime: string): ResourceType {
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (
    mime === "application/pdf" ||
    mime.includes("word") ||
    mime.includes("document") ||
    mime.includes("sheet") ||
    mime.includes("presentation") ||
    mime.startsWith("text/")
  ) {
    return "document";
  }
  return "other";
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
}

/** Storage folder a user may upload into; paths outside it are rejected. */
export function uploadPrefix(role: SharerRole, userId: string): string {
  return role === "admin" ? `admin-uploads/${userId}/` : `mentor-uploads/${userId}/`;
}

/** Link resources point at an external URL instead of a storage path. */
export function isExternalResource(resource: { file_url: string }): boolean {
  return /^https?:\/\//i.test(resource.file_url);
}
