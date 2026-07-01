import { apiRequest, ApiError } from "./client";
import { mockStore } from "./mock-store";
import type { Staff, StaffStatus } from "@/lib/types";

export type CreateStaffInput = Pick<Staff, "name" | "email">;

export const staffApi = {
  list(query = "") {
    return apiRequest<Staff[]>({
      path: `/staff${query ? `?search=${encodeURIComponent(query)}` : ""}`,
      mock: () => mockStore.staff.filter((person) => `${person.name} ${person.email}`.toLowerCase().includes(query.toLowerCase())),
    });
  },

  create(input: CreateStaffInput) {
    return apiRequest<Staff>({
      path: "/staff",
      method: "POST",
      body: input,
      mock: () => {
        const created: Staff = { id: crypto.randomUUID(), ...input, status: "Active" };
        mockStore.staff = [created, ...mockStore.staff];
        return created;
      },
    });
  },

  updateStatus(id: string, status: StaffStatus) {
    return apiRequest<Staff>({
      path: `/staff/${id}/status`,
      method: "PATCH",
      body: { status },
      mock: () => {
        const existing = mockStore.staff.find((person) => person.id === id);
        if (!existing) throw new ApiError("Staff not found", 404);
        const updated = { ...existing, status };
        mockStore.staff = mockStore.staff.map((person) => person.id === id ? updated : person);
        return updated;
      },
    });
  },

  remove(id: string) {
    return apiRequest<void>({
      path: `/staff/${id}`,
      method: "DELETE",
      mock: () => { mockStore.staff = mockStore.staff.filter((person) => person.id !== id); },
    });
  },
};
