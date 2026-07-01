"use client";

import { Download, FileSpreadsheet, Filter, Trash2, Upload } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import type { TemplateFile } from "@/lib/types";
import { templateApi } from "@/lib/api/template-api";
import { PageHeading } from "@/components/ui/page-heading";

const categories = Array.from({ length: 15 }, (_, index) => `Category ${index + 1}`);
const activity = [
  ["04 Jun 2568 23:09", "Wabcdefo Sabcdefg", "Published", "[VARUNA] CarbonProfile - Scope 3 Universal Template v3.0"],
  ["04 Jun 2568 08:11", "Wabcdefo Sabcdefg", "Uploaded", "[VARUNA] CarbonProfile - Scope 3 Universal Template v3.0"],
  ["12 Feb 2568 14:22", "Wabcdefo Sabcdefg", "Uploaded", "[VARUNA] CarbonProfile - Scope 3 Universal Template v2.7"],
  ["12 Feb 2568 08:34", "Wabcdefo Sabcdefg", "Uploaded", "[VARUNA] CarbonProfile - Scope 3 Universal Template v2.0"],
  ["01 Jan 2568 06:46", "Wabcdefo Sabcdefg", "Uploaded", "[VARUNA] CarbonProfile - Scope 3 Universal Template v1.0"],
];

export function TemplateScreen() {
  const [scope, setScope] = useState(3);
  const [category, setCategory] = useState("Category 1");
  const [files, setFiles] = useState<TemplateFile[]>([]);

  useEffect(() => {
    let active = true;
    templateApi.list(scope, category).then((data) => { if (active) setFiles(data); });
    return () => { active = false; };
  }, [scope, category]);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const created = await templateApi.upload(file.name);
    setFiles((current) => [created, ...current]);
    event.target.value = "";
  }

  async function remove(id: string) {
    await templateApi.remove(id);
    setFiles((current) => current.filter((file) => file.id !== id));
  }

  return (
    <div className="admin-container">
      <PageHeading icon={<FileSpreadsheet size={17} />} title="Template" />
      <div className="subnav">{[1,2,3].map((item) => <button key={item} className={scope === item ? "active" : ""} onClick={() => setScope(item)}>Scope {item}</button>)}</div>
      <h2 className="form-page-title">Scope {scope}</h2>
      {scope === 3 && <div className="category-row">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>}
      <div className="template-intro">
        <p>{scope === 3 ? "การปล่อยก๊าซเรือนกระจกทางอ้อมจากการซื้อวัตถุดิบ และบริการ (Purchased Goods and Services)" : `CarbonProfile Scope ${scope} emission template`}</p>
        <label className="button button--primary"><Upload size={13} />Upload template<input className="sr-only" type="file" accept=".xlsx,.xls,.csv" onChange={upload} /></label>
      </div>
      <section className="admin-card table-panel"><div className="table-wrap"><table className="admin-table"><thead><tr><th>Template</th><th>Uploaded at</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{files.map((file) => <tr key={file.id}><td>{file.name} {file.purchased && <span className="tag">Purchased</span>}</td><td>{file.uploadedAt}</td><td><button className="icon-button" aria-label={`Download ${file.name}`}><Download size={13} /></button> <button className="icon-button" onClick={() => remove(file.id)} aria-label={`Delete ${file.name}`}><Trash2 size={13} /></button></td></tr>)}</tbody></table></div></section>
      <section className="template-section"><h2>Activity log</h2><div className="activity-toolbar"><button className="button button--secondary"><Filter size={12} />Filter</button><button className="button button--secondary">Start date - End date</button></div><section className="admin-card table-panel"><div className="table-wrap"><table className="admin-table"><thead><tr><th>Date and time</th><th>Staff</th><th>Activity</th><th>Detail</th></tr></thead><tbody>{activity.map((row) => <tr key={`${row[0]}-${row[2]}`}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div></section></section>
    </div>
  );
}
