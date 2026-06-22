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
import type { PlanId } from "@/config/site.types";
import { decodeJwt, isTokenValid } from "@/lib/auth/jwt";
import {
  clearTokenCookie,
  readTokenCookie,
  writeTokenCookie,
} from "@/lib/auth/session";

export interface SessionUser {
  username: string;
  userId: number | null;
  roles: string[];
  plan: PlanId;
}

export interface AuthContextValue {
  user: SessionUser | null;
  ready: boolean;
  signIn: (token: string, fallbackUsername?: string) => void;
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
    plan: "free",
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
        clearTokenCookie();
      }
    }
    setReady(true);
  }, []);

  const signIn = useCallback(
    (token: string, fallbackUsername?: string) => {
      const next = userFromToken(token, fallbackUsername);
      if (!next) {
        return;
      }
      writeTokenCookie(token);
      setUser(next);
    },
    [],
  );

  const signOut = useCallback(() => {
    clearTokenCookie();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, ready, signIn, signOut }),
    [user, ready, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
