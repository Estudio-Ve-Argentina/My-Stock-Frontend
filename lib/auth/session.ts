export const TOKEN_COOKIE = "stockeo_token";
export const REFRESH_COOKIE = "stockeo_refresh";

const ACCESS_MAX_AGE = 30 * 60;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function setCookie(name: string, value: string, maxAge: number): void {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function readTokenCookie(): string | null {
  return getCookie(TOKEN_COOKIE);
}

export function readRefreshCookie(): string | null {
  return getCookie(REFRESH_COOKIE);
}

export function writeTokenCookie(token: string): void {
  setCookie(TOKEN_COOKIE, token, ACCESS_MAX_AGE);
}

export function writeRefreshCookie(refreshToken: string): void {
  setCookie(REFRESH_COOKIE, refreshToken, REFRESH_MAX_AGE);
}

export function clearTokenCookie(): void {
  deleteCookie(TOKEN_COOKIE);
}

export function clearAllTokens(): void {
  deleteCookie(TOKEN_COOKIE);
  deleteCookie(REFRESH_COOKIE);
}
