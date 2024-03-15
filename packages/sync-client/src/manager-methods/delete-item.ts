import { StoreKey } from "idb/build/entry";
import { ColumnBase } from "../column-base";
import { Table } from "../define-schema";
import { createSync, DeleteSyncAction } from "../sync-entry";
import { mergeSyncEntries } from "./merge-sync-entries";
import { SyncContext } from "../sync-context";
import { resolveSyncs } from "./resolve-syncs";

export function deleteItemScoped<
  TColumn extends StoreKey<unknown, any> | IDBKeyRange,
  TDataSchema extends Record<string, ColumnBase<TColumn>>,
>(
  syncContext: SyncContext,
  table: Table<TColumn, TDataSchema>,
  key: string | number | string[] | number[],
) {
  (async () => {
    const iterable = Array.isArray(key) ? key : [key];

    for await (const k of iterable) {
      const exist = await syncContext.db.get(table.name, k);
      if (!exist) return;

      await syncContext.db.delete(table.name, k);

      const deleteAction = new DeleteSyncAction(k);
      await createSync(syncContext, deleteAction, table);

      const syncEvent = await mergeSyncEntries(syncContext, k);
      syncContext.onSyncCallback &&
        syncContext.networkStatus === "online" &&
        syncContext.onSyncCallback(syncEvent, resolveSyncs(syncContext, k));

      syncContext.syncCount++;
      syncContext.onSyncStateCallback(
        syncContext.networkStatus,
        syncContext.syncCount,
      );
    }
  })();
}
