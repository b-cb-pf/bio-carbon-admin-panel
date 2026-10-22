import { Pencil } from "lucide-react";
import type { MasterDataRow } from "@/lib/types";
import { groupMasterData } from "@/lib/master-data-groups";
import { maintenanceText as t } from "@/lib/maintenance-i18n";

type Props = {
  rows: MasterDataRow[];
  editable: boolean;
  onEdit: (row: MasterDataRow) => void;
};

export function MasterDataGroups({ rows, editable, onEdit }: Props) {
  return (
    <div className="master-groups">
      <p className="master-group-help">{t("Match template by type code, unit and EF year")}</p>
      <p className="master-group-help">{t("Factor catalog only")}</p>
      {rows.length >= 500 && (
        <p className="maintenance-alert" role="status">
          {t("Factor result limit")}
        </p>
      )}
      {rows.length === 0 && <p className="empty-cell">{t("No factors match these filters")}</p>}
      {groupMasterData(rows).map((scope) => (
        <details className="admin-card master-scope" key={scope.scopeNo} open>
          <summary>
            <strong>
              {t("Scope")} {scope.scopeNo}
            </strong>
            <span>
              {scope.factorCount} {t("EF entries shown")}
            </span>
          </summary>
          {scope.activities.map((activity) => (
            <section className="master-activity" key={activity.key}>
              <h2>
                {scope.scopeNo === 3 && (
                  <span>
                    {t("Category")} {activity.categoryNo} ·{" "}
                  </span>
                )}
                {activity.label}
                {activity.code && activity.code !== activity.label && <code>{activity.code}</code>}
              </h2>
              <div className="table-wrap">
                <table className="admin-table master-group-table">
                  <thead>
                    <tr>
                      <th scope="col">{t("Template item / type code")}</th>
                      <th scope="col">{t("Source item")}</th>
                      <th scope="col">{t("Unit")}</th>
                      <th scope="col">{t("kgCO₂e / unit")}</th>
                      <th scope="col">{t("EF year")}</th>
                      <th scope="col">{t("Source")}</th>
                      <th scope="col">{t("Factor key")}</th>
                      <th scope="col">{t("Active")}</th>
                      <th scope="col">
                        <span className="sr-only">{t("Edit")}</span>
                      </th>
                    </tr>
                  </thead>
                  {activity.items.map((item) => (
                    <tbody key={item.key}>
                      {item.factors.map((row, index) => (
                        <tr key={row.factorKey}>
                          {index === 0 && (
                            <th scope="rowgroup" rowSpan={item.factors.length}>
                              <strong>{item.label}</strong>
                              {item.typeCode ? (
                                <code>{item.typeCode}</code>
                              ) : (
                                <small>{t("Type code unavailable")}</small>
                              )}
                            </th>
                          )}
                          <td>{row.sourceName || "—"}</td>
                          <td>{row.unit}</td>
                          <td>{row.kgCo2ePerUnit}</td>
                          <td>{row.sourceYear ?? "—"}</td>
                          <td>{row.source || "—"}</td>
                          <td>
                            <code>{row.factorKey}</code>
                          </td>
                          <td>{row.isActive ? t("Enabled EF") : t("Inactive EF")}</td>
                          <td>
                            {editable && (
                              <button
                                className="icon-button"
                                onClick={() => onEdit(row)}
                                aria-label={`${t("Edit")} ${row.factorKey}`}
                              >
                                <Pencil size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  ))}
                </table>
              </div>
            </section>
          ))}
        </details>
      ))}
    </div>
  );
}
