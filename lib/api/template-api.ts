import { apiRequest } from "./client";
import { mockStore } from "./mock-store";
import type { TemplateFile } from "@/lib/types";

export const templateApi = {
  list(scope = 3, category = "Category 1") {
    return apiRequest<TemplateFile[]>({
      path: `/templates?scope=${scope}&category=${encodeURIComponent(category)}`,
      mock: () => mockStore.templates,
    });
  },

  upload(fileName: string) {
    return apiRequest<TemplateFile>({
      path: "/templates",
      method: "POST",
      body: { fileName },
      mock: () => {
        const created = { id: crypto.randomUUID(), name: fileName, uploadedAt: new Date().toLocaleString() };
        mockStore.templates = [created, ...mockStore.templates];
        return created;
      },
    });
  },

  remove(id: string) {
    return apiRequest<void>({
      path: `/templates/${id}`,
      method: "DELETE",
      mock: () => { mockStore.templates = mockStore.templates.filter((item) => item.id !== id); },
    });
  },
};
