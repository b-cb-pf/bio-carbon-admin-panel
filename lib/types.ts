export type StaffStatus = "Active" | "Inactive";

export type Staff = {
  id: string;
  name: string;
  email: string;
  status: StaffStatus;
};

export type Company = {
  id: string;
  name: string;
  legalEntityNumber: string;
  contractStartDate: string;
  contractEndDate: string;
  adminEmail: string;
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
