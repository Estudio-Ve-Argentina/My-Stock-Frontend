"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { SubscriptionStatus } from "@/config/site.types";
import { decodeJwt, isTokenValid } from "@/lib/auth/jwt";
import { fetchMe, logout as apiLogout } from "@/lib/api/auth";
import { isMockEnabled } from "@/lib/api/mock";
import { registerSessionExpiredHandler } from "@/lib/api/client";
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
  subscriptionStatus: SubscriptionStatus | null;
  name: string;
  lastName: string;
  emailVerified: boolean;
  hasPassword: boolean;
}

export interface AuthContextValue {
  user: SessionUser | null;
  ready: boolean;
  signIn: (token: string, refreshToken: string, fallbackUsername?: string) => void;
  signOut: () => void;
  refreshUser: () => void;
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
    subscriptionStatus: null,
    name: "",
    lastName: "",
    emailVerified: false,
    hasPassword: true,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const signOutRef = useRef<() => void>(() => {});

  const hydrateFromBackend = useCallback((baseUser: SessionUser) => {
    if (isMockEnabled()) return;
    fetchMe()
      .then((me) => {
        setUser((current) => {
          if (current?.username !== baseUser.username) return current;
          return {
            ...current,
            userId: me.id,
            roles: me.roles,
            planName: me.planName,
            maxProducts: me.maxProducts,
            subscriptionStatus: me.subscriptionStatus,
            name: me.name,
            lastName: me.lastName,
            emailVerified: me.emailVerified,
            hasPassword: me.hasPassword,
          };
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const token = readTokenCookie();
    if (token) {
      const next = userFromToken(token);
      if (next) {
        setUser(next);
        hydrateFromBackend(next);
      } else {
        clearAllTokens();
      }
    }
    setReady(true);
  }, [hydrateFromBackend]);

  const signIn = useCallback(
    (token: string, refreshToken: string, fallbackUsername?: string) => {
      const next = userFromToken(token, fallbackUsername);
      if (!next) {
        return;
      }
      writeTokenCookie(token);
      writeRefreshCookie(refreshToken);
      setUser(next);
      hydrateFromBackend(next);
    },
    [hydrateFromBackend],
  );

  const refreshUser = useCallback(() => {
    if (!user) return;
    hydrateFromBackend(user);
  }, [user, hydrateFromBackend]);

  const signOut = useCallback(() => {
    const refresh = readRefreshCookie();
    if (refresh) {
      apiLogout(refresh).catch(() => {});
    }
    clearAllTokens();
    setUser(null);
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    signOutRef.current = signOut;
  }, [signOut]);

  useEffect(() => {
    registerSessionExpiredHandler(() => signOutRef.current());
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, ready, signIn, signOut, refreshUser }),
    [user, ready, signIn, signOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
