import { apiRequest } from "./client";
import type { MasterDataRow, MasterDataVersion } from "@/lib/types";

const unavailable = (): never => {
  throw new Error("Activity maintenance requires the backend.");
};
const options = { authenticated: true, remote: true, mock: unavailable };
const base = "/platform/activity-maintenance/master-data";
const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
export type MasterDataFilters = {
  versionId?: string;
  scopeNo?: string;
  categoryNo?: string;
  isActive?: string;
  search?: string;
};

export type MasterCatalogRow = Pick<
  MasterDataRow,
  "scopeNo" | "categoryNo" | "activityLabel" | "detailLabel" | "unit" | "source" | "sourceYear"
> & {
  sourceTypeCode: string | null;
};
export interface MasterWorksheet {
  name: string;
  columns: { index: number; name: string }[];
  rowCount: number;
}
export interface MasterWorksheetManifest {
  versionId: string;
  sheets: MasterWorksheet[];
}
export interface MasterWorksheetPage {
  versionId: string;
  name: string;
  columns: MasterWorksheet["columns"];
  items: { sourceRow: number; values: (string | number | boolean | null)[]; formulas: Record<string, string> }[];
  total: number;
  page: number;
  pageLimit: number;
}
export const masterDataApi = {
  worksheets(versionId: string) {
    return apiRequest<MasterWorksheetManifest>({
      ...options,
      path: `${base}/versions/${versionId}/worksheets`,
      method: "POST",
    });
  },
  worksheetPage(versionId: string, sheet: string, page: number, pageLimit = 10) {
    const params = new URLSearchParams({ sheet, page: String(page), pageLimit: String(pageLimit) });
    return apiRequest<MasterWorksheetPage>({
      ...options,
      path: `${base}/versions/${versionId}/worksheets/page?${params}`,
    });
  },
  page(filters: MasterDataFilters, page: number, pageLimit = 10) {
    const params = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => Boolean(value)) as [string, string][],
    );
    params.set("page", String(page));
    params.set("pageLimit", String(pageLimit));
    return apiRequest<{ items: MasterDataRow[]; total: number; page: number; pageLimit: number }>({
      ...options,
      path: `${base}/rows/page?${params}`,
    });
  },
  catalog(versionId: string) {
    return apiRequest<MasterCatalogRow[]>({
      ...options,
      path: `${base}/catalog?versionId=${encodeURIComponent(versionId)}`,
    });
  },
  deleteDraft(id: string) {
    return apiRequest<{ deleted: boolean; queued: boolean }>({
      ...options,
      path: `${base}/versions/${id}`,
      method: "DELETE",
    });
  },
  versions() {
    return apiRequest<MasterDataVersion[]>({ ...options, path: `${base}/versions` });
  },
  list(filters: MasterDataFilters = {}) {
    const params = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => Boolean(value)) as [string, string][],
    );
    return apiRequest<MasterDataRow[]>({ ...options, path: `${base}/rows?${params}` });
  },
  async upload(file: File, versionLabel: string) {
    const intent = await apiRequest<{ id: string; url: string; fields: Record<string, string> }>({
      ...options,
      path: `${base}/upload-intents`,
      method: "POST",
      body: { versionLabel, fileName: file.name, contentType: XLSX, sizeBytes: file.size },
    });
    const body = new FormData();
    Object.entries(intent.fields).forEach(([key, value]) => body.append(key, value));
    body.append("file", file);
    if (!(await fetch(intent.url, { method: "POST", body })).ok) throw new Error("Upload failed");
    return apiRequest<MasterDataVersion>({
      ...options,
      path: `${base}/versions/${intent.id}/complete`,
      method: "POST",
    });
  },
  publish(id: string) {
    return apiRequest<MasterDataVersion>({
      ...options,
      path: `${base}/versions/${id}/publish`,
      method: "POST",
    });
  },
  update(
    versionId: string,
    factorKey: string,
    patch: Partial<
      Pick<
        MasterDataRow,
        | "sourceTypeCode"
        | "activityLabel"
        | "detailLabel"
        | "unit"
        | "kgCo2ePerUnit"
        | "source"
        | "sourceYear"
        | "isActive"
      >
    >,
  ) {
    return apiRequest<{ updated: boolean }>({
      ...options,
      path: `${base}/versions/${versionId}/rows/${encodeURIComponent(factorKey)}`,
      method: "PATCH",
      body: patch,
    });
  },
};
