import { maintenanceText as t } from "@/lib/maintenance-i18n";

export function ValidationReport({
  report,
}: {
  report: { errors?: string[]; warnings?: string[] };
}) {
  const errors = report.errors ?? [];
  const warnings = report.warnings ?? [];
  if (!errors.length && !warnings.length)
    return <span>{t("ผ่านการตรวจโครงสร้าง")}</span>;
  return (
    <details>
      <summary>
        {t("Validation")}: {errors.length} {t("Errors")}, {warnings.length}{" "}
        {t("Warnings")}
      </summary>
      <div
        style={{ maxHeight: 320, overflow: "auto", overflowWrap: "anywhere" }}
      >
        {errors.length > 0 && (
          <>
            <strong>{t("Errors")}</strong>
            <ul>
              {errors.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </>
        )}
        {warnings.length > 0 && (
          <>
            <strong>{t("Warnings")}</strong>
            <ul>
              {warnings.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </details>
  );
}
