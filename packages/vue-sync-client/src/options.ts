import { ColumnBase, OnSyncFn, OnSyncStateFn, Table } from "sync-client";

export interface Options {
  dbVersion: number;
  schema: Table<any, Record<string, ColumnBase<any>>>[];
  onSync?: OnSyncFn;
  onSyncState?: OnSyncStateFn;
}
