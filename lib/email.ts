export function extractEmailAddress(value?: string | null): string {
  const text = (value || "").trim();
  if (!text) return "";
  const bracketMatch = text.match(/<([^>]+)>/);
  const email = (bracketMatch?.[1] || text).trim();
  return email.includes("@") ? email : "";
}

export function extractEmailDisplayName(value?: string | null): string {
  const text = (value || "").trim();
  if (!text) return "";
  const bracketMatch = text.match(/^(.*?)\s*<[^>]+>$/);
  if (!bracketMatch) return "";
  return bracketMatch[1].trim().replace(/^"|"$/g, "");
}

export function normalizeEmailAddress(value?: string | null): string {
  return extractEmailAddress(value).toLowerCase();
}

export function emailsMatch(
  left?: string | null,
  right?: string | null,
): boolean {
  const normalizedLeft = normalizeEmailAddress(left);
  const normalizedRight = normalizeEmailAddress(right);
  return !!normalizedLeft && normalizedLeft === normalizedRight;
}
