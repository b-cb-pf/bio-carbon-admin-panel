import { companies, masterRows, staffMembers, templateFiles } from "@/lib/mock-data";
import type { Company, MasterDataRow, Staff, TemplateFile } from "@/lib/types";

let staffStore: Staff[] = structuredClone(staffMembers);
let companyStore: Company[] = structuredClone(companies);
let templateStore: TemplateFile[] = structuredClone(templateFiles);

const masterDataStore: MasterDataRow[] = masterRows.map((row) => ({
  id: row[0],
  scope: row[1],
  item: row[2],
  category: row[3],
  unit: row[4],
  source: row[5],
  year: row[6],
}));

export const mockStore = {
  get staff() { return staffStore; },
  set staff(value: Staff[]) { staffStore = value; },
  get companies() { return companyStore; },
  set companies(value: Company[]) { companyStore = value; },
  get templates() { return templateStore; },
  set templates(value: TemplateFile[]) { templateStore = value; },
  get masterData() { return masterDataStore; },
};
