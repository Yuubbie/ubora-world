const DEMO_EMAIL_SUFFIXES = ["@uboraworld.test", "@uboraworldapp.com"];

export function isDemoEmail(email: string | null | undefined) {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return DEMO_EMAIL_SUFFIXES.some((suffix) => normalized.endsWith(suffix));
}

export function isRealStudent(user: { role: string; email: string | null | undefined }) {
  return user.role === "student" && !isDemoEmail(user.email);
}

export function isPaidSubscription(sub: { paymentId: string | null; payment: { status: string } | null } | undefined) {
  return Boolean(sub?.paymentId && sub.payment?.status === "success");
}
