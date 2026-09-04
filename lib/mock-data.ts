import type { Company, Staff, TemplateFile } from "./types";

export const staffMembers: Staff[] = [
  { id: "staff-01", name: "Carbon P.", email: "carbonprofile@lcenter.com", status: "Active" },
  { id: "staff-02", name: "Mr. Wabcdefo Sabcdefg", email: "pmnp@carbonprofile.com", status: "Active" },
  { id: "staff-03", name: "Ms. Sabcdefg Kabcdefg", email: "email-email@carbonprofile.com", status: "Inactive" },
  { id: "staff-04", name: "Mrs. Wfdfsfdf Sabcdilling", email: "email-email@carbonprofile.com", status: "Active" },
  { id: "staff-05", name: "Mr. Jidafdf Fdfdsjdfn", email: "email-email@carbonprofile.com", status: "Active" },
  { id: "staff-06", name: "Ms. Kdfsjkfdskj Fldfsfkjslkjd", email: "email-email@carbonprofile.com", status: "Active" },
  { id: "staff-07", name: "Mr. Pilijk Tmmmmmaag", email: "email-email@carbonprofile.com", status: "Active" },
  { id: "staff-08", name: "Mr. Nicabcda Wabacdefl", email: "email-email@carbonprofile.com", status: "Inactive" },
  { id: "staff-09", name: "Ms. Tdsfsfdsa Sdfsdfsd", email: "email-email@carbonprofile.com", status: "Inactive" },
  { id: "staff-10", name: "Mr. Sdfddfdt Sdfsdee", email: "email-email@carbonprofile.com", status: "Active" },
];

export const companies: Company[] = [
  { id: "carbon-profile", name: "Carbon Profile Co., Ltd.", legalEntityNumber: "0100990009999", contractStartDate: "01 Jan 2024", contractEndDate: "31 May 2027", adminEmail: "admin@carbonprofile.co" },
  { id: "siam-green", name: "Siam Green Energy Platform Co., Ltd.", legalEntityNumber: "0105538123456", contractStartDate: "01 Mar 2024", contractEndDate: "01 Mar 2027", adminEmail: "admin@siamgreen.co.th" },
  { id: "blue-ocean", name: "BlueOcean Trading Co., Ltd.", legalEntityNumber: "0105539021468", contractStartDate: "01 Jan 2024", contractEndDate: "31 Dec 2026", adminEmail: "admin@blueocean.co.th" },
  { id: "thai-digital", name: "Thai Digital Solutions Co., Ltd.", legalEntityNumber: "0105561058743", contractStartDate: "15 Jan 2024", contractEndDate: "14 Jan 2026", adminEmail: "admin@thaidigital.co.th" },
  { id: "future-vision", name: "Future Vision Holdings Co., Ltd.", legalEntityNumber: "0105539619921", contractStartDate: "20 Feb 2024", contractEndDate: "19 Feb 2026", adminEmail: "admin@futurevision.co.th" },
  { id: "sunrise-biotech", name: "Sunrise Biotech Co., Ltd.", legalEntityNumber: "0105560004739", contractStartDate: "01 Dec 2023", contractEndDate: "30 Nov 2026", adminEmail: "admin@sunrisebio.co.th" },
  { id: "infinity-logistics", name: "Infinity Logistics Co., Ltd.", legalEntityNumber: "0105531234500", contractStartDate: "01 Sep 2023", contractEndDate: "31 Aug 2025", adminEmail: "admin@infinitylogistics.co.th" },
  { id: "greenleaf", name: "GreenLeaf Innovations Co., Ltd.", legalEntityNumber: "0105562981204", contractStartDate: "10 May 2023", contractEndDate: "09 May 2026", adminEmail: "admin@greenleaf.co.th" },
  { id: "united-food", name: "United Food Supply Co., Ltd.", legalEntityNumber: "0105537086249", contractStartDate: "15 Jul 2023", contractEndDate: "14 Jul 2025", adminEmail: "admin@unitedfood.co.th" },
  { id: "advance-tech", name: "Advance Tech Engineering Co., Ltd.", legalEntityNumber: "0105567891022", contractStartDate: "01 Nov 2022", contractEndDate: "31 Oct 2025", adminEmail: "admin@advancetech.co.th" },
];

export const templateFiles: TemplateFile[] = [
  { id: "tpl-1", name: "[VARUNA] CarbonProfile - Scope 3 Universal Template v3.0", uploadedAt: "04 Jun 2568 23:09", purchased: true },
  { id: "tpl-2", name: "[VARUNA] CarbonProfile - Scope 3 Universal Template v2.7", uploadedAt: "12 Feb 2568 14:22" },
  { id: "tpl-3", name: "[VARUNA] CarbonProfile - Scope 3 Universal Template v2.0", uploadedAt: "12 Feb 2568 08:34" },
  { id: "tpl-4", name: "[VARUNA] CarbonProfile - Scope 3 Universal Template v1.0", uploadedAt: "01 Jan 2568 06:46" },
  { id: "tpl-5", name: "[VARUNA] CarbonProfile - Scope 3 Universal Template", uploadedAt: "08 Jan 2568 23:38" },
];

export const masterRows = [
  ["EF_201_JP1", "1", "การขนส่งวัตถุดิบ", "รถบรรทุก", "kgCO₂e / t.km", "กรมควบคุมมลพิษ", "2566"],
  ["EF_201_JP2", "1", "การขนส่งผลิตภัณฑ์", "รถบรรทุก", "kgCO₂e / t.km", "TGO Thailand", "2566"],
  ["EF_201_JP3", "2", "การเดินทางทางธุรกิจ", "รถยนต์", "kgCO₂e / km", "IPCC Guidelines", "2565"],
  ["EF_202_JP1", "3", "การใช้ไฟฟ้า", "พลังงาน", "kgCO₂e / kWh", "กฟผ.", "2566"],
  ["EF_202_JP2", "3", "การใช้เชื้อเพลิง", "พลังงาน", "kgCO₂e / L", "กรมธุรกิจพลังงาน", "2566"],
  ["EF_203_JP1", "4", "การจัดการของเสีย", "ของเสีย", "kgCO₂e / kg", "TGO Thailand", "2565"],
  ["EF_204_JP1", "5", "การจัดซื้อสินค้า", "วัตถุดิบ", "kgCO₂e / kg", "Ecoinvent 3.9", "2566"],
  ["EF_205_JP1", "6", "การขนส่งทางอากาศ", "ขนส่ง", "kgCO₂e / t.km", "DEFRA", "2566"],
];
