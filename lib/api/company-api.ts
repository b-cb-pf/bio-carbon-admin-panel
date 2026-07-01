import { apiRequest, ApiError } from "./client";
import { mockStore } from "./mock-store";
import type { Company } from "@/lib/types";

export type CompanyInput = Omit<Company, "id">;

export const companyApi = {
  list(query = "") {
    return apiRequest<Company[]>({
      path: `/companies${query ? `?search=${encodeURIComponent(query)}` : ""}`,
      mock: () => mockStore.companies.filter((company) => company.name.toLowerCase().includes(query.toLowerCase())),
    });
  },

  getById(id: string) {
    return apiRequest<Company>({
      path: `/companies/${id}`,
      mock: () => {
        const company = mockStore.companies.find((item) => item.id === id);
        if (!company) throw new ApiError("Company not found", 404);
        return company;
      },
    });
  },

  create(input: CompanyInput) {
    return apiRequest<Company>({
      path: "/companies",
      method: "POST",
      body: input,
      mock: () => {
        const created = { id: crypto.randomUUID(), ...input };
        mockStore.companies = [created, ...mockStore.companies];
        return created;
      },
    });
  },

  update(id: string, input: Partial<CompanyInput>) {
    return apiRequest<Company>({
      path: `/companies/${id}`,
      method: "PATCH",
      body: input,
      mock: () => {
        const existing = mockStore.companies.find((item) => item.id === id);
        if (!existing) throw new ApiError("Company not found", 404);
        const updated = { ...existing, ...input };
        mockStore.companies = mockStore.companies.map((item) => item.id === id ? updated : item);
        return updated;
      },
    });
  },

  remove(id: string) {
    return apiRequest<void>({
      path: `/companies/${id}`,
      method: "DELETE",
      mock: () => { mockStore.companies = mockStore.companies.filter((item) => item.id !== id); },
    });
  },
};
