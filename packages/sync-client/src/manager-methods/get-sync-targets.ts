import { SyncEntry } from "../sync-entry";
import { mergeSyncEntries } from "./merge-sync-entries";
import { SyncContext } from "../sync-context";
import { SYNC_STORE_NAME } from "../connect";

export async function getSyncTargets(syncContext: SyncContext) {
  const allSyncs = (await syncContext.db.getAll(
    SYNC_STORE_NAME,
  )) as SyncEntry[];
  const targetIds = allSyncs.map((sync) => sync.action.id);

  return Promise.all(targetIds.map((id) => mergeSyncEntries(syncContext, id)));
}
