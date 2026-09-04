import { apiRequest } from "./client";
import { mockStore } from "./mock-store";
import type { MasterDataRow } from "@/lib/types";

export type MasterDataFilters = Partial<Pick<MasterDataRow, "scope" | "category" | "unit" | "source" | "year">>;

export const masterDataApi = {
  list(filters: MasterDataFilters = {}) {
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => Boolean(value)) as [string, string][]);
    return apiRequest<MasterDataRow[]>({
      path: `/master-data${params.size ? `?${params}` : ""}`,
      mock: () => mockStore.masterData.filter((row) => Object.entries(filters).every(([key, value]) => !value || row[key as keyof MasterDataRow] === value)),
    });
  },
};
