import { apiRequest, ApiError } from "./client";
import { mockStore } from "./mock-store";
import type { Company } from "@/lib/types";
import type { PaginationResponse } from "./staff-api";

export type CompanyInput = Pick<Company, "name" | "legalEntityNumber" | "contractStartDate" | "contractEndDate" | "adminEmail">;
export type CompanyListResponse = { items: Company[]; pagination: PaginationResponse };
export type TenantInvitation = NonNullable<Company["invitation"]>;

export const companyApi = {
  list(query = "", page = 1) {
    return apiRequest<CompanyListResponse>({
      path: `/platform/tenants?page=${page}${query ? `&search=${encodeURIComponent(query)}` : ""}`,
      remote: true,
      authenticated: true,
      mock: () => {
        const matches = mockStore.companies.filter((company) => company.name.toLowerCase().startsWith(query.toLowerCase()));
        const pageSize = 10;
        const fromIndex = (page - 1) * pageSize;
        const items = matches.slice(fromIndex, fromIndex + pageSize);
        return {
          items,
          pagination: {
            page,
            pageSize,
            totalItems: matches.length,
            totalPages: Math.ceil(matches.length / pageSize),
            from: items.length ? fromIndex + 1 : 0,
            to: fromIndex + items.length,
          },
        };
      },
    });
  },

  getById(id: string) {
    return apiRequest<Company>({
      path: `/platform/tenants/${id}`,
      remote: true,
      authenticated: true,
      mock: () => {
        const company = mockStore.companies.find((item) => item.id === id);
        if (!company) throw new ApiError("Company not found", 404);
        return company;
      },
    });
  },

  create(input: CompanyInput) {
    return apiRequest<Company>({
      path: "/platform/tenants",
      method: "POST",
      body: input,
      remote: true,
      authenticated: true,
      mock: () => {
        const created = { id: crypto.randomUUID(), ...input };
        mockStore.companies = [created, ...mockStore.companies];
        return created;
      },
    });
  },

  update(id: string, input: Partial<CompanyInput>) {
    return apiRequest<Company>({
      path: `/platform/tenants/${id}`,
      method: "PATCH",
      body: input,
      remote: true,
      authenticated: true,
      mock: () => {
        const existing = mockStore.companies.find((item) => item.id === id);
        if (!existing) throw new ApiError("Company not found", 404);
        const updated = { ...existing, ...input };
        mockStore.companies = mockStore.companies.map((item) => item.id === id ? updated : item);
        return updated;
      },
    });
  },

  resendInvitation(id: string) {
    return apiRequest<TenantInvitation>({
      path: `/platform/tenants/${id}/resend-invitation`,
      method: "POST",
      remote: true,
      authenticated: true,
      mock: () => ({
        setupUrl: `/setup-password?token=mock-${crypto.randomUUID()}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        deliveryStatus: "sent",
      }),
    });
  },

  remove(id: string) {
    return apiRequest<void>({
      path: `/platform/tenants/${id}`,
      method: "DELETE",
      remote: true,
      authenticated: true,
      mock: () => { mockStore.companies = mockStore.companies.filter((item) => item.id !== id); },
    });
  },
};
