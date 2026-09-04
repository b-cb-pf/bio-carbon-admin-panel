import { apiRequest, ApiError } from "./client";
import { clearAuthSession, setAuthSession, type StoredAuthSession } from "@/lib/auth-session";

export type AuthSession = StoredAuthSession & { expiresIn: number };

type SetupPasswordResponse = StoredAuthSession["admin"];

export const authApi = {
  login(email: string, password: string) {
    return apiRequest<AuthSession>({
      path: "/platform/auth/login",
      method: "POST",
      body: { email, password },
      remote: true,
      mock: () => {
        if (!email || !password) throw new ApiError("Email and password are required", 400);
        return {
          accessToken: "mock-token",
          tokenType: "Bearer",
          expiresIn: 7200,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          admin: {
            id: "admin-01",
            email,
            title: null,
            firstName: "CarbonProfile",
            lastName: "Admin",
            role: "super_admin",
            status: "active",
          },
        };
      },
    }).then((session) => {
      setAuthSession(session);
      return session;
    });
  },

  validateInvitation(token: string) {
    return apiRequest<{ valid: boolean }>({
      path: `/platform/auth/invitations/validate?token=${encodeURIComponent(token)}`,
      remote: true,
      mock: () => ({ valid: Boolean(token) }),
    });
  },

  setPassword(token: string, password: string) {
    return apiRequest<SetupPasswordResponse>({
      path: "/platform/auth/setup-password",
      method: "POST",
      body: { token, password },
      remote: true,
      mock: () => ({
        id: "mock-user",
        email: "invited@example.com",
        title: null,
        firstName: "Invited",
        lastName: "Admin",
        role: "super_admin",
        status: "inactive",
      }),
    });
  },

  requestPasswordReset(email: string) {
    return apiRequest<{ accepted: boolean }>({
      path: "/platform/auth/password-resets",
      method: "POST",
      body: { email },
      remote: true,
      mock: () => ({ accepted: true }),
    });
  },

  validatePasswordReset(token: string) {
    return apiRequest<{ valid: boolean }>({
      path: `/platform/auth/password-resets/validate?token=${encodeURIComponent(token)}`,
      remote: true,
      mock: () => ({ valid: Boolean(token) }),
    });
  },

  resetPassword(token: string, password: string) {
    return apiRequest<void>({
      path: "/platform/auth/reset-password",
      method: "POST",
      body: { token, password },
      remote: true,
      mock: () => undefined,
    });
  },

  async logout() {
    try {
      await apiRequest<void>({
        path: "/platform/auth/logout",
        method: "POST",
        remote: true,
        authenticated: true,
        mock: () => undefined,
      });
    } finally {
      clearAuthSession();
    }
  },
};
