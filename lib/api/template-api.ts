import { apiRequest } from "./client";
import type { MaintenanceLog, TemplateFile, TemplateMappingPreview } from "@/lib/types";

const unavailable = (): never => {
  throw new Error("Activity maintenance requires the backend.");
};
const options = { authenticated: true, remote: true, mock: unavailable };
const base = "/platform/activity-maintenance";
const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const templateApi = {
  page(scopeNo: number, categoryNo: number, page: number) {
    return apiRequest<{ items: TemplateFile[]; total: number }>({
      ...options,
      path: `${base}/templates/page?scopeNo=${scopeNo}&categoryNo=${categoryNo}&page=${page}&pageLimit=10`,
    });
  },
  logPage(entityType: string, page: number, startDate: string, endDate: string) {
    const params = new URLSearchParams({ entityType, page: String(page), pageLimit: "10" });
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    return apiRequest<{ items: MaintenanceLog[]; total: number }>({
      ...options,
      path: `${base}/activity-log/page?${params}`,
    });
  },
  deleteDraft(id: string) {
    return apiRequest<{ deleted: boolean; queued: boolean }>({
      ...options,
      path: `${base}/templates/${id}`,
      method: "DELETE",
    });
  },
  list(scopeNo: number, categoryNo: number) {
    return apiRequest<TemplateFile[]>({
      ...options,
      path: `${base}/templates?scopeNo=${scopeNo}${scopeNo === 3 ? `&categoryNo=${categoryNo}` : ""}`,
    });
  },
  async upload(file: File, scopeNo: number, categoryNo: number, versionLabel: string) {
    const intent = await apiRequest<{ id: string; url: string; fields: Record<string, string> }>({
      ...options,
      path: `${base}/templates/upload-intents`,
      method: "POST",
      body: {
        scopeNo,
        categoryNo,
        versionLabel,
        fileName: file.name,
        contentType: XLSX,
        sizeBytes: file.size,
      },
    });
    const body = new FormData();
    Object.entries(intent.fields).forEach(([key, value]) => body.append(key, value));
    body.append("file", file);
    if (!(await fetch(intent.url, { method: "POST", body })).ok) throw new Error("Upload failed");
    return apiRequest<TemplateFile>({
      ...options,
      path: `${base}/templates/${intent.id}/complete`,
      method: "POST",
    });
  },
  preview(id: string, masterVersionId: string) {
    return apiRequest<TemplateMappingPreview>({
      ...options,
      path: `${base}/templates/${id}/mapping-preview`,
      method: "POST",
      body: { masterVersionId },
    });
  },
  publish(id: string, masterVersionId: string, previewToken: string) {
    return apiRequest<TemplateFile & { versionSetId: string }>({
      ...options,
      path: `${base}/templates/${id}/publish`,
      method: "POST",
      body: { masterVersionId, previewToken },
    });
  },
  async download(id: string) {
    const { url } = await apiRequest<{ url: string }>({
      ...options,
      path: `${base}/templates/${id}/download`,
    });
    const link = document.createElement("a");
    link.href = url;
    link.click();
  },
  activityLog() {
    return apiRequest<MaintenanceLog[]>({ ...options, path: `${base}/activity-log?limit=100` });
  },
};
