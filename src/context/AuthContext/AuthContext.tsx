'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { ApiError, getUser, loginUser, registerUser } from '@/api/fitness';
import type { User } from '@/types';

export type AuthMode = 'login' | 'register';

interface AuthContextValue {
  /** undefined until the browser storage has been read */
  token: string | null | undefined;
  user: User | null;
  authMode: AuthMode | null;
  openAuth: (mode: AuthMode) => void;
  closeAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const TOKEN_KEY = 'sky-fitness-token';
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function writeToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
  listeners.forEach((listener) => listener());
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore<string | null | undefined>(
    subscribe,
    readToken,
    () => undefined,
  );
  const [loadedUser, setLoadedUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);

  const logout = useCallback(() => {
    writeToken(null);
    setLoadedUser(null);
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getUser(token)
      .then((data) => {
        if (!cancelled) setLoadedUser(data);
      })
      .catch((error: unknown) => {
        // An expired or broken token ends the session; a network failure does not.
        if (!cancelled && error instanceof ApiError && error.status !== 0) {
          logout();
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user: token ? loadedUser : null,
      authMode,
      openAuth: setAuthMode,
      closeAuth: () => setAuthMode(null),
      login: async (email, password) => {
        const data = await loginUser(email, password);
        writeToken(data.token);
        setAuthMode(null);
      },
      register: async (email, password) => {
        await registerUser(email, password);
        const data = await loginUser(email, password);
        writeToken(data.token);
        setAuthMode(null);
      },
      logout,
      refreshUser: async () => {
        if (token) setLoadedUser(await getUser(token));
      },
    }),
    [token, loadedUser, authMode, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}

/** Sends guests to the main page; returns the token once it is known. */
export function useRequireAuth() {
  const { token } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (token === null) router.replace('/');
  }, [token, router]);
  return token ?? null;
}
