import { ColumnBase, Table } from "sync-client";
import { OnSyncFn, OnSyncStateFn } from "sync-client/src/connect";

export interface Options {
  dbVersion: number;
  schema: Table<any, Record<string, ColumnBase<any>>>[];
  onSync?: OnSyncFn;
  onSyncState?: OnSyncStateFn;
}
