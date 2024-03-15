import { SyncContext } from "./sync-context.model";

export interface OnSyncStateFn {
  (state: SyncContext["networkStatus"], syncCount: number): void;
}
