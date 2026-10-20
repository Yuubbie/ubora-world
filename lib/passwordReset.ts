import { createHash, randomBytes } from "crypto";
import { SITE_URL } from "@/lib/seo";

export const RESET_TTL_MS = 60 * 60 * 1000;

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createResetToken() {
  return randomBytes(32).toString("hex");
}

export function resetUrl(token: string) {
  return `${SITE_URL}/reset-password?token=${encodeURIComponent(token)}`;
}

export function genericForgotMessage() {
  return "If an account exists for those details, a reset link will be sent. Check inbox and spam, or chat us on WhatsApp if it does not arrive.";
}
