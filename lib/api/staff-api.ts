import { apiRequest, ApiError } from "./client";
import { mockStore } from "./mock-store";
import type { Staff, StaffStatus } from "@/lib/types";

export type InvitationStatus = "pending" | "sent" | "logged" | "failed" | "expired" | "accepted";

export type CreateStaffInput = {
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
};

type StaffResponse = {
  id: string;
  email: string;
  title: string | null;
  firstName: string;
  lastName: string;
  role: "super_admin";
  status: "active" | "inactive";
  invitationStatus: InvitationStatus;
  invitationExpiresAt: string | null;
  canResendInvitation: boolean;
};

export type PaginationResponse = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  from: number;
  to: number;
};

type BackendStaffListResponse = {
  items: StaffResponse[];
  pagination: PaginationResponse;
};

type StaffInvitationResponse = StaffResponse & {
  setupUrl: string;
};

export type StaffDeletionResponse = {
  id: string;
  deletedAt: string;
};

export type StaffDetails = Staff & {
  title: string | null;
  firstName: string;
  lastName: string;
  role: "super_admin";
  invitationStatus: InvitationStatus;
  invitationExpiresAt: string | null;
  canResendInvitation: boolean;
};

export type StaffListResponse = {
  items: StaffDetails[];
  pagination: PaginationResponse;
};

export type StaffInvitation = StaffDetails & {
  setupUrl: string;
};

function toStaff(person: StaffResponse): StaffDetails {
  return {
    id: person.id,
    name: [person.title, person.firstName, person.lastName].filter(Boolean).join(" "),
    email: person.email,
    status: person.status === "active" ? "Active" : "Inactive",
    title: person.title,
    firstName: person.firstName,
    lastName: person.lastName,
    role: person.role,
    invitationStatus: person.invitationStatus,
    invitationExpiresAt: person.invitationExpiresAt,
    canResendInvitation: person.canResendInvitation,
  };
}

function toInvitation(response: StaffInvitationResponse): StaffInvitation {
  return {
    ...toStaff(response),
    setupUrl: response.setupUrl,
    invitationExpiresAt: response.invitationExpiresAt,
  };
}

export const staffApi = {
  list(query = "") {
    return apiRequest<BackendStaffListResponse>({
      path: `/platform/staff${query ? `?search=${encodeURIComponent(query)}` : ""}`,
      remote: true,
      authenticated: true,
      mock: () => ({
        items: mockStore.staff.map((person) => ({
          id: person.id,
          email: person.email,
          title: null,
          firstName: person.name,
          lastName: "",
          role: "super_admin" as const,
          status: person.status.toLowerCase() as "active" | "inactive",
          invitationStatus: person.status === "Active" ? "accepted" as const : "logged" as const,
          invitationExpiresAt: person.status === "Active" ? null : new Date(Date.now() + 86400000).toISOString(),
          canResendInvitation: person.status !== "Active",
        })),
        pagination: {
          page: 1,
          pageSize: mockStore.staff.length,
          totalItems: mockStore.staff.length,
          totalPages: 1,
          from: mockStore.staff.length ? 1 : 0,
          to: mockStore.staff.length,
        },
      }),
    }).then((response): StaffListResponse => ({
      items: response.items.map(toStaff),
      pagination: response.pagination,
    }));
  },

  getById(id: string) {
    return apiRequest<StaffResponse>({
      path: `/platform/staff/${id}`,
      remote: true,
      authenticated: true,
      mock: () => {
        const person = mockStore.staff.find((item) => item.id === id);
        if (!person) throw new ApiError("Staff not found", 404);
        return { id: person.id, email: person.email, title: null, firstName: person.name, lastName: "", role: "super_admin", status: person.status.toLowerCase() as "active" | "inactive", invitationStatus: person.status === "Active" ? "accepted" : "logged", invitationExpiresAt: person.status === "Active" ? null : new Date(Date.now() + 86400000).toISOString(), canResendInvitation: person.status !== "Active" };
      },
    }).then(toStaff);
  },

  create(input: CreateStaffInput) {
    return apiRequest<StaffInvitationResponse>({
      path: "/platform/staff",
      method: "POST",
      body: input,
      remote: true,
      authenticated: true,
      mock: () => {
        const id = crypto.randomUUID();
        return { id, email: input.email, title: input.title ?? null, firstName: input.firstName, lastName: input.lastName, role: "super_admin", status: "inactive", invitationStatus: "logged", invitationExpiresAt: new Date(Date.now() + 86400000).toISOString(), canResendInvitation: true, setupUrl: `/setup-password?token=mock-${id}` };
      },
    }).then(toInvitation);
  },

  updateStatus(id: string, status: StaffStatus) {
    const action = status === "Active" ? "activate" : "deactivate";
    return apiRequest<StaffResponse>({
      path: `/platform/staff/${id}/${action}`,
      method: "PATCH",
      remote: true,
      authenticated: true,
      mock: () => {
        const existing = mockStore.staff.find((person) => person.id === id);
        if (!existing) throw new ApiError("Staff not found", 404);
        const updated = { ...existing, status };
        mockStore.staff = mockStore.staff.map((person) => person.id === id ? updated : person);
        return { id: updated.id, email: updated.email, title: null, firstName: updated.name, lastName: "", role: "super_admin", status: updated.status.toLowerCase() as "active" | "inactive", invitationStatus: updated.status === "Active" ? "accepted" : "logged", invitationExpiresAt: updated.status === "Active" ? null : new Date(Date.now() + 86400000).toISOString(), canResendInvitation: updated.status !== "Active" };
      },
    }).then(toStaff);
  },

  resendInvitation(id: string) {
    return apiRequest<StaffInvitationResponse>({
      path: `/platform/staff/${id}/resend-invitation`,
      method: "POST",
      remote: true,
      authenticated: true,
      mock: () => {
        const person = mockStore.staff.find((item) => item.id === id);
        if (!person) throw new ApiError("Staff not found", 404);
        return { id: person.id, email: person.email, title: null, firstName: person.name, lastName: "", role: "super_admin", status: "inactive", invitationStatus: "logged", invitationExpiresAt: new Date(Date.now() + 86400000).toISOString(), canResendInvitation: true, setupUrl: `/setup-password?token=mock-${id}` };
      },
    }).then(toInvitation);
  },

  remove(id: string) {
    return apiRequest<StaffDeletionResponse>({
      path: `/platform/staff/${id}`,
      method: "DELETE",
      remote: true,
      authenticated: true,
      mock: () => {
        mockStore.staff = mockStore.staff.filter((person) => person.id !== id);
        return { id, deletedAt: new Date().toISOString() };
      },
    });
  },
};
