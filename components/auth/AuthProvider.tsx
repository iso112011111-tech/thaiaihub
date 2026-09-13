"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut as fbSignOut, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db, initAnalytics } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";

export interface Profile {
  handle: string;
  name: string;
  photoURL: string | null;
  promptCount: number;
}

interface AuthState {
  user: User | null;
  /** Firestore-side profile: display name and avatar live here, not in Auth. */
  profile: Profile | null;
  /** True until Firebase has reported the restored session — avoids a logged-out flash. */
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (next) => {
      setUser(next);
      setLoading(false);
    });
    // Analytics is fire-and-forget; it must never block or break rendering.
    void initAnalytics();
    return unsubscribe;
  }, []);

  // Live subscription, so an edit on the profile page updates the topbar at once.
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    return onSnapshot(doc(db, COLLECTIONS.users, user.uid), (snapshot) => {
      const data = snapshot.data();
      setProfile(
        data
          ? {
              handle: data.handle ?? "",
              name: data.name ?? user.displayName ?? "",
              photoURL: data.photoURL ?? null,
              promptCount: data.promptCount ?? 0,
            }
          : null,
      );
    });
  }, [user]);

  const value = useMemo<AuthState>(
    () => ({ user, profile, loading, signOut: () => fbSignOut(auth) }),
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
