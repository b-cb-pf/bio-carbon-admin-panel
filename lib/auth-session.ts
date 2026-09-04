export type AuthenticatedAdmin = {
  id: string;
  email: string;
  title: string | null;
  firstName: string;
  lastName: string;
  role: "super_admin";
  status: "active" | "inactive";
};

export type StoredAuthSession = {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  admin: AuthenticatedAdmin;
};

const SESSION_KEY = "bio-carbon-admin-session";

export function getAuthSession(): StoredAuthSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as StoredAuthSession;
    if (!session.accessToken || new Date(session.expiresAt).getTime() <= Date.now()) {
      clearAuthSession();
      return null;
    }
    return session;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function setAuthSession(session: StoredAuthSession) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(SESSION_KEY);
}
