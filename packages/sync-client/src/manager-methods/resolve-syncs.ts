import { SyncEntry } from "../sync-entry";
import { SyncContext } from "../sync-context";
import { SYNC_STORE_NAME } from "../connect";

export function resolveSyncs(
  syncContext: SyncContext,
  targetId: string | number,
) {
  return async () => {
    const allSyncs = (await syncContext.db.getAll(
      SYNC_STORE_NAME,
    )) as SyncEntry[];
    const targetSyncs = allSyncs.filter((sy) => sy.action.id === targetId);

    const operations = targetSyncs.map((e) =>
      syncContext.db.delete(SYNC_STORE_NAME, e.id),
    );
    await Promise.all(operations);

    syncContext.syncCount -= 1;
    syncContext.onSyncStateCallback(
      syncContext.networkStatus,
      syncContext.syncCount,
    );
  };
}
