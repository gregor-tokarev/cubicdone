import { SyncEntry } from "../sync-entry";
import { SyncContext } from "../sync-context";
import { SYNC_STORE_NAME } from "../connect";

export async function mergeSyncEntries(
  syncContext: SyncContext,
  targetId: string | number,
): Promise<SyncEntry> {
  const allSyncs = (await syncContext.db.getAll(
    SYNC_STORE_NAME,
  )) as SyncEntry[];
  const targetSyncs = allSyncs
    .filter((sy) => sy.action.id === targetId)
    .sort((prev, next) => prev.timestamp - next.timestamp);

  const deleteEvent = targetSyncs.find(
    (se) => se.action.actionName === "delete",
  );
  if (deleteEvent) return deleteEvent;

  const creationEvent = targetSyncs.find(
    (se) => se.action.actionName === "create",
  );

  let finalData = creationEvent ? creationEvent.action["data"] : {};

  const updateEntries = targetSyncs.filter(
    (se) => se.action.actionName === "update",
  );

  updateEntries.forEach((se) => {
    finalData = Object.assign(finalData, se.action["data"]);
  });

  return creationEvent
    ? {
        ...creationEvent,
        // @ts-ignore
        action: { ...creationEvent.action, data: finalData },
      }
    : {
        ...updateEntries[updateEntries.length - 1],
        action: {
          ...updateEntries[updateEntries.length - 1].action,
          data: finalData,
        },
      };
}
