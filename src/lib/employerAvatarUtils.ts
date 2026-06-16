const AVATAR_BG_CLASSES = [
  'bg-[#3366ff]',
  'bg-[#101426]',
  'bg-[#7941eb]',
  'bg-[#0f766e]',
  'bg-[#1d4ed8]',
  'bg-[#0369a1]',
  'bg-[#4f46e5]',
  'bg-[#0891b2]',
  'bg-[#059669]',
  'bg-[#3f3ebd]',
];

export function resolveOwnerAvatarBg(seed: string): string {
  const normalized = seed.trim().toLowerCase() || 'employer';
  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash * 31 + normalized.charCodeAt(i)) | 0;
  }
  return AVATAR_BG_CLASSES[Math.abs(hash) % AVATAR_BG_CLASSES.length];
}

export function resolveOwnerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0]?.[0] ?? 'E').toUpperCase();
}

/** Prefer company initials; ignore generic seeded placeholder text like "CO". */
export function resolveEmployerLogoLabel(name: string, logoText?: string | null): string {
  const text = logoText?.trim();
  if (text && text.toUpperCase() !== 'CO') {
    return text.slice(0, 2).toUpperCase();
  }
  return resolveOwnerInitials(name);
}
