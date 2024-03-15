import { SyncEntry } from "../sync-entry";

export interface OnSyncFn {
  (entries: SyncEntry, resolveFn: () => void): void;
}
