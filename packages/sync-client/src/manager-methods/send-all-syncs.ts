import { resolveSyncs } from "./resolve-syncs";
import { SyncContext } from "../sync-context";
import { getSyncTargets } from "./get-sync-targets";

export async function sendAllSyncs(syncContext: SyncContext) {
  const entries = await getSyncTargets(syncContext);

  if (!syncContext.onSyncCallback || syncContext.networkStatus !== "online")
    return;

  entries.forEach((entry) => {
    syncContext.onSyncCallback(
      entry,
      resolveSyncs(syncContext, entry.action.id),
    );
  });

  syncContext.syncCount = entries.length;
  syncContext.onSyncStateCallback(
    syncContext.networkStatus,
    syncContext.syncCount,
  );
}
