import { ColumnBase } from "../column-base";
import { Table } from "../define-schema";
import { SyncContext } from "../sync-context";

export async function backwardSyncScoped<
  TColumn,
  TDataSchema extends Record<string, ColumnBase<TColumn>>,
  R extends Record<keyof TDataSchema, any>,
>(syncContext: SyncContext, table: Table<TColumn, TDataSchema>, records: R[]) {
  await syncContext.db.clear(table.name);

  return Promise.all(
    records.map((r) => {
      return syncContext.db.put(table.name, r);
    }),
  );
}
