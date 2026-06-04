/**
 * useAdminAuth — manages Firebase auth state for the admin panel.
 */
import { useEffect, useState } from "react";

export function useAdminAuth() {
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [adminToken, setAdminToken] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe;
    import("firebase/auth").then(({ onAuthStateChanged, getIdToken }) =>
      import("../firebase").then(({ auth }) => {
        if (cancelled) return;
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (cancelled) return;
          setAdminAuthed(!!user);
          if (user) {
            const token = await getIdToken(user);
            setAdminToken(token);
          } else {
            setAdminToken(null);
          }
          setAuthChecked(true);
        });
      })
    );
    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const logout = async () => {
    const { signOut } = await import("firebase/auth");
    const { auth } = await import("../firebase");
    await signOut(auth);
  };

  return { adminAuthed, setAdminAuthed, authChecked, adminToken, logout };
}
