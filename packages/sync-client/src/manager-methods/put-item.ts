import { ColumnBase } from "../column-base";
import { Table } from "../define-schema";
import { mapObjectToTable } from "./mapObjectToTable";
import { createSync, CreateSyncAction, UpdateSyncAction } from "../sync-entry";
import { mergeSyncEntries } from "./merge-sync-entries";
import { resolveSyncs } from "./resolve-syncs";
import { SyncContext } from "../models/sync-context.model";

export function putItemScoped<
  TColumn,
  TDataSchema extends Record<string, ColumnBase<TColumn>>,
  R extends Record<keyof TDataSchema, any>,
>(syncContext: SyncContext, table: Table<TColumn, TDataSchema>, object: R): R {
  const defaultedObj = mapObjectToTable(
    table,
    JSON.parse(JSON.stringify(object)),
  );

  (async () => {
    const res = await syncContext.db.get(table.name, defaultedObj["id"]);

    await syncContext.db.put(table.name, defaultedObj);

    const action = res
      ? new UpdateSyncAction(defaultedObj["id"], defaultedObj)
      : new CreateSyncAction(defaultedObj["id"], defaultedObj);
    await createSync(syncContext, action, table);

    const syncEvent = await mergeSyncEntries(syncContext, defaultedObj["id"]);
    syncContext.onSyncCallback &&
      syncContext.networkStatus === "online" &&
      syncContext.onSyncCallback(
        { ...syncEvent },
        resolveSyncs(syncContext, defaultedObj["id"]),
      );

    syncContext.syncCount++;
    syncContext.onSyncStateCallback(
      syncContext.networkStatus,
      syncContext.syncCount,
    );
  })();

  return object;
}
