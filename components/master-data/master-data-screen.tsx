"use client";

import { Database, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import type { MasterDataRow } from "@/lib/types";
import { masterDataApi, type MasterDataFilters } from "@/lib/api/master-data-api";
import { PageHeading } from "@/components/ui/page-heading";
import { Pagination } from "@/components/ui/pagination";

export function MasterDataScreen() {
  const [filters, setFilters] = useState<MasterDataFilters>({});
  const [rows, setRows] = useState<MasterDataRow[]>([]);

  useEffect(() => {
    let active = true;
    masterDataApi.list(filters).then((data) => { if (active) setRows(data); });
    return () => { active = false; };
  }, [filters]);

  function update(key: keyof MasterDataFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value || undefined }));
  }

  return <div className="admin-container"><PageHeading icon={<Database size={17} />} title="Master Data" actions={<button className="button button--secondary" onClick={() => setFilters({})}><RotateCcw size={13} />Reset filter</button>} /><div className="master-filters"><select value={filters.scope ?? ""} onChange={(event) => update("scope", event.target.value)}><option value="">หมวดหมู่</option><option value="1">Scope 1</option><option value="2">Scope 2</option><option value="3">Scope 3</option></select><select value={filters.category ?? ""} onChange={(event) => update("category", event.target.value)}><option value="">ประเภทแหล่งปล่อยก๊าซเรือนกระจก</option><option value="รถบรรทุก">การขนส่ง</option><option value="พลังงาน">พลังงาน</option></select><select value={filters.unit ?? ""} onChange={(event) => update("unit", event.target.value)}><option value="">หน่วยการคำนวณ</option><option>kgCO₂e / km</option><option>kgCO₂e / kg</option></select><select value={filters.source ?? ""} onChange={(event) => update("source", event.target.value)}><option value="">แหล่งอ้างอิง</option><option>TGO Thailand</option><option>IPCC Guidelines</option></select><select value={filters.year ?? ""} onChange={(event) => update("year", event.target.value)}><option value="">ปีที่เผยแพร่</option><option>2566</option><option>2565</option></select></div><section className="admin-card table-panel"><div className="table-wrap"><table className="admin-table master-table"><thead><tr><th>ID</th><th>Scope</th><th>รายการ</th><th>ประเภท</th><th>หน่วย</th><th>แหล่งอ้างอิง</th><th>ปี</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.id}</td><td>{row.scope}</td><td>{row.item}</td><td>{row.category}</td><td>{row.unit}</td><td>{row.source}</td><td>{row.year}</td></tr>)}</tbody></table></div><Pagination total={80} /></section></div>;
}
