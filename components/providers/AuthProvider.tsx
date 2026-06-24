"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { decodeJwt, isTokenValid } from "@/lib/auth/jwt";
import { logout as apiLogout } from "@/lib/api/auth";
import {
  clearAllTokens,
  readRefreshCookie,
  readTokenCookie,
  writeRefreshCookie,
  writeTokenCookie,
} from "@/lib/auth/session";

export interface SessionUser {
  username: string;
  userId: number | null;
  roles: string[];
  planName: string;
  maxProducts: number | null;
}

export interface AuthContextValue {
  user: SessionUser | null;
  ready: boolean;
  signIn: (token: string, refreshToken: string, fallbackUsername?: string) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function userFromToken(
  token: string,
  fallbackUsername?: string,
): SessionUser | null {
  if (!isTokenValid(token)) {
    return null;
  }
  const claims = decodeJwt(token);
  const username = claims?.username ?? fallbackUsername ?? null;
  if (!username) {
    return null;
  }
  return {
    username,
    userId: claims?.userId ?? null,
    roles: claims?.roles ?? [],
    planName: "FREE",
    maxProducts: null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = readTokenCookie();
    if (token) {
      const next = userFromToken(token);
      if (next) {
        setUser(next);
      } else {
        clearAllTokens();
      }
    }
    setReady(true);
  }, []);

  const signIn = useCallback(
    (token: string, refreshToken: string, fallbackUsername?: string) => {
      const next = userFromToken(token, fallbackUsername);
      if (!next) {
        return;
      }
      writeTokenCookie(token);
      writeRefreshCookie(refreshToken);
      setUser(next);
    },
    [],
  );

  const signOut = useCallback(() => {
    const refresh = readRefreshCookie();
    if (refresh) {
      apiLogout(refresh).catch(() => {});
    }
    clearAllTokens();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, ready, signIn, signOut }),
    [user, ready, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
