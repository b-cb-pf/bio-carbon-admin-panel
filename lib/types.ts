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
  deletionRequestedAt?: string | null;
  id: string;
  scopeNo: number;
  categoryNo: number;
  versionLabel: string;
  fileName: string;
  status: "pending" | "validated" | "published" | "retired" | "rejected";
  validationReport: { errors?: string[]; warnings?: string[]; mappedFactors?: number };
  createdAt: string;
  validatedAt: string | null;
  publishedAt: string | null;
};

export type MasterDataRow = {
  sourceName?: string;
  sourceTypeCode?: string;
  versionId: string;
  factorKey: string;
  scopeNo: number;
  categoryNo: number;
  activityLabel: string;
  detailLabel: string;
  unit: string;
  kgCo2ePerUnit: string;
  source: string;
  sourceYear: number | null;
  isActive: boolean;
};

export type MasterDataVersion = {
  deletionRequestedAt?: string | null;
  id: string;
  versionLabel: string;
  fileName: string;
  status: TemplateFile["status"];
  rowCount: number;
  validationReport: { errors?: string[]; warnings?: string[] };
  createdAt: string;
  validatedAt: string | null;
  publishedAt: string | null;
};

export type MaintenanceLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  detail: Record<string, unknown>;
  staffName: string | null;
  createdAt: string;
};

export type TemplateMappingPreview = {
  template: TemplateFile;
  master: MasterDataVersion;
  previewToken: string | null;
  ready: boolean;
  errors: string[];
  rows: Array<{
    rowId: string;
    activityLabel: string;
    detailLabel: string;
    sourceTypeCode: string;
    unit: string;
    mode: string;
    reason: string | null;
    requestedFactorKey: string | null;
    efYear: number | null;
    status: "matched" | "missing" | "ambiguous" | "collect_only" | "formula";
    matchCount: number;
    candidates: Array<Pick<MasterDataRow, "factorKey" | "kgCo2ePerUnit" | "source" | "sourceYear" | "unit">>;
  }>;
};
