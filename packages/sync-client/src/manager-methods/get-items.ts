import { ColumnBase } from "../column-base";
import { Table } from "../define-schema";
import { SyncContext } from "../sync-context";

export async function getItemsScoped<
  TColumn,
  TDataSchema extends Record<string, ColumnBase<TColumn>>,
>(syncContext: SyncContext, table: Table<TColumn, TDataSchema>) {
  return syncContext.db.getAll(table.name);
}
