import { SITE_URL } from "./seo";

export function getAppUrl() {
  const raw = (process.env.NEXTAUTH_URL ?? "").trim().replace(/\/$/, "");
  const isLocal = !raw || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(raw);
  if (process.env.NODE_ENV === "production" && isLocal) {
    return SITE_URL;
  }
  return raw || "http://localhost:3000";
}
