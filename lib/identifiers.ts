export function isEmailIdentifier(value: string) {
  return value.includes("@");
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function compactPhone(value: string) {
  return value.trim().replace(/[\s()-]/g, "");
}

export function userLookupWhere(identifier: string) {
  const trimmed = identifier.trim();
  if (isEmailIdentifier(trimmed)) {
    return { email: { equals: trimmed, mode: "insensitive" as const } };
  }
  const phone = compactPhone(trimmed);
  return { OR: [{ phone: trimmed }, { phone }] };
}
