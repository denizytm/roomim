// Etkin ban: banlı VE (süresiz ya da süre dolmamış). Süreli ban dolunca otomatik kalkar.
export function isEffectivelyBanned(p: {
  banned: boolean;
  banned_until: string | null;
}): boolean {
  if (!p.banned) return false;
  if (!p.banned_until) return true; // süresiz
  return new Date(p.banned_until).getTime() > Date.now();
}
