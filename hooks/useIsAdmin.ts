"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Whether the signed-in user is an admin. Asked of the server because the admin
 * list is server-only. A UI hint only: every admin API checks again on its own.
 */
export function useIsAdmin() {
  const { user } = useAuth();
  const [admin, setAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user) {
      setAdmin(false);
      setChecked(true);
      return;
    }

    let cancelled = false;
    setChecked(false);
    user
      .getIdToken()
      .then((token) => fetch("/api/admin/me", { headers: { authorization: `Bearer ${token}` } }))
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setAdmin(Boolean(data.admin));
      })
      .catch(() => {
        if (!cancelled) setAdmin(false);
      })
      .finally(() => {
        if (!cancelled) setChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { admin, checked };
}
