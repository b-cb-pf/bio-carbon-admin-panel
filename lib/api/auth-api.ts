import { apiRequest, ApiError } from "./client";

export type AuthSession = {
  user: { id: string; name: string; email: string; role: string };
  expiresAt: string;
};

export const authApi = {
  login(email: string, password: string) {
    return apiRequest<AuthSession>({
      path: "/auth/login",
      method: "POST",
      body: { email, password },
      mock: () => {
        if (!email || !password) throw new ApiError("Email and password are required", 400);
        return {
          user: { id: "admin-01", name: "CarbonProfile Admin", email, role: "admin" },
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        };
      },
    });
  },

  requestPasswordReset(email: string) {
    return apiRequest<{ sent: true }>({ path: "/auth/forgot-password", method: "POST", body: { email }, mock: () => ({ sent: true }) });
  },

  setPassword(password: string) {
    return apiRequest<{ success: true }>({ path: "/auth/set-password", method: "POST", body: { password }, mock: () => ({ success: true }) });
  },
};
