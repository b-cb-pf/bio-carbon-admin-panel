export type StaffStatus = "Active" | "Inactive";

export type Staff = {
  id: string;
  name: string;
  email: string;
  status: StaffStatus;
};

export type Company = {
  id: string;
  workspace?: string;
  loginUrl?: string;
  name: string;
  legalEntityNumber: string;
  contractStartDate: string;
  contractEndDate: string;
  adminEmail?: string;
  adminInvitationStatus?: "pending" | "sent" | "logged" | "failed" | "expired" | "accepted";
  status?: "active" | "suspended";
  createdAt?: string;
  invitation?: {
    setupUrl: string;
    expiresAt: string;
    deliveryStatus: "sent" | "logged" | "failed";
  };
};

export type TemplateFile = {
  id: string;
  name: string;
  uploadedAt: string;
  purchased?: boolean;
};

export type MasterDataRow = {
  id: string;
  scope: string;
  item: string;
  category: string;
  unit: string;
  source: string;
  year: string;
};
