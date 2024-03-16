import { IDBPDatabase } from "idb";
import { OnSyncFn, OnSyncStateFn } from "../connect";

export interface SyncContext {
  db: IDBPDatabase | null;
  syncCount: number;
  networkStatus: "online" | "offline";
  onSyncCallback: OnSyncFn | null;
  onSyncStateCallback: OnSyncStateFn | null;
}
