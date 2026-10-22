import type { MasterDataRow } from "./types";

export type MasterDataItem = {
  key: string;
  typeCode?: string;
  label: string;
  factors: MasterDataRow[];
};
export type MasterDataActivity = {
  key: string;
  code?: string;
  label: string;
  categoryNo: number;
  items: MasterDataItem[];
};
export type MasterDataScope = {
  scopeNo: number;
  factorCount: number;
  activities: MasterDataActivity[];
};

export function groupMasterData(rows: MasterDataRow[]): MasterDataScope[] {
  const scopes = new Map<number, MasterDataScope>();
  const activities = new Map<string, MasterDataActivity>();
  const items = new Map<string, MasterDataItem>();
  for (const row of rows) {
    let scope = scopes.get(row.scopeNo);
    if (!scope) {
      scope = { scopeNo: row.scopeNo, factorCount: 0, activities: [] };
      scopes.set(row.scopeNo, scope);
    }
    scope.factorCount++;
    const typeCode = row.sourceTypeCode?.trim() || undefined;
    const activityCode = typeCode?.match(/^(S\d+_\d+_SRC\d+)_TYP\d+$/)?.[1];
    const activityKey = JSON.stringify([row.versionId, row.scopeNo, row.categoryNo, activityCode ?? row.activityLabel]);
    let activity = activities.get(activityKey);
    if (!activity) {
      activity = {
        key: activityKey,
        code: activityCode,
        label: row.activityLabel,
        categoryNo: row.categoryNo,
        items: [],
      };
      activities.set(activityKey, activity);
      scope.activities.push(activity);
    }
    // Legacy rows without stable codes must not be matched by display names.
    const itemKey = JSON.stringify([activityKey, typeCode ?? row.factorKey]);
    let item = items.get(itemKey);
    if (!item) {
      item = { key: itemKey, typeCode, label: row.detailLabel, factors: [] };
      items.set(itemKey, item);
      activity.items.push(item);
    }
    item.factors.push(row);
  }
  const compare = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });
  for (const scope of scopes.values()) {
    scope.activities.sort((a, b) => a.categoryNo - b.categoryNo || compare(a.code ?? a.label, b.code ?? b.label));
    for (const activity of scope.activities) {
      activity.items.sort((a, b) =>
        a.typeCode && b.typeCode
          ? compare(a.typeCode, b.typeCode)
          : a.typeCode
            ? -1
            : b.typeCode
              ? 1
              : compare(a.key, b.key),
      );
      for (const item of activity.items) {
        item.factors.sort(
          (a, b) =>
            compare(a.unit, b.unit) || (b.sourceYear ?? 0) - (a.sourceYear ?? 0) || compare(a.factorKey, b.factorKey),
        );
      }
    }
  }
  return [...scopes.values()].sort((a, b) => a.scopeNo - b.scopeNo);
}
