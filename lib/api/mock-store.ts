import { companies, staffMembers } from "@/lib/mock-data";
import type { Company, Staff } from "@/lib/types";

let staffStore: Staff[] = structuredClone(staffMembers);
let companyStore: Company[] = structuredClone(companies);

export const mockStore = {
  get staff() { return staffStore; },
  set staff(value: Staff[]) { staffStore = value; },
  get companies() { return companyStore; },
  set companies(value: Company[]) { companyStore = value; },
};
