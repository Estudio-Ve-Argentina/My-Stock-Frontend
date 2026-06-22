export interface JwtClaims {
  username: string | null;
  userId: number | null;
  roles: string[];
  expiresAt: number | null;
}

interface RawClaims {
  sub?: string;
  username?: string;
  userId?: number;
  id?: number;
  roles?: string[] | string;
  authorities?: string[] | string;
  scope?: string;
  exp?: number;
}

function decodeBase64Url(segment: string): string {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof atob === "function") {
    return atob(padded);
  }
  return Buffer.from(padded, "base64").toString("binary");
}

function normalizeRoles(raw: RawClaims): string[] {
  const source = raw.roles ?? raw.authorities ?? raw.scope ?? [];
  if (Array.isArray(source)) {
    return source;
  }
  return source.split(/[\s,]+/).filter(Boolean);
}

export function decodeJwt(token: string): JwtClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1])) as RawClaims;
    return {
      username: payload.username ?? payload.sub ?? null,
      userId: payload.userId ?? payload.id ?? null,
      roles: normalizeRoles(payload),
      expiresAt: payload.exp ? payload.exp * 1000 : null,
    };
  } catch {
    return null;
  }
}

export function isTokenValid(token: string): boolean {
  const claims = decodeJwt(token);
  if (!claims) {
    return false;
  }
  if (claims.expiresAt === null) {
    return true;
  }
  return claims.expiresAt > Date.now();
}
