import { openDB } from "idb";
import { Table } from "./define-schema";
import { ColumnBase } from "./column-base";
import { StoreKey } from "idb/build/entry";
import { putItemScoped } from "./manager-methods/put-item";
import { deleteItemScoped } from "./manager-methods/delete-item";
import { sendAllSyncs } from "./manager-methods/send-all-syncs";
import { backwardSyncScoped } from "./manager-methods/backward-sync";
import { getItemsScoped } from "./manager-methods/get-items";
import { adjustStore } from "./migration-helpers/adjust-store";
import { SyncContext } from "./models/sync-context.model";
import { OnSyncFn, OnSyncStateFn } from "./models";

const syncContext = {
  db: null,
  syncCount: 0,
  networkStatus: navigator.onLine ? "online" : "offline",
  onSyncCallback: null,
  onSyncStateCallback: null,
} satisfies SyncContext;

export const DB_NAME = "SYNC_DB";
export const SYNC_STORE_NAME = "SYNC_STORE";

export async function connect<
  M,
  R extends Record<string, ColumnBase<any>>,
  TSchema extends Table<M, R>[],
>(version: number, schema: TSchema) {
  syncContext.db = await openDB(DB_NAME, version, {
    upgrade(database, oldVersion, newVersion, transaction, _event) {
      if (oldVersion >= newVersion) return;

      if (!database.objectStoreNames.contains(SYNC_STORE_NAME))
        database.createObjectStore(SYNC_STORE_NAME, {
          keyPath: "id",
        });

      schema.forEach(async (sc) => {
        const indexColumns = Object.values(sc.dataSchema).filter(
          (column) => column.config.createIndex,
        );

        if (!database.objectStoreNames.contains(sc.name)) {
          const primaryColumn = Object.values(sc.dataSchema).find(
            (column) => column.config.isPrimary,
          );

          const store = database.createObjectStore(sc.name, {
            keyPath: primaryColumn.config.name,
          });
          const indexes = store.indexNames;

          Array.from(indexes).forEach((index) => {
            if (!indexColumns.map((c) => c.config.name).includes(index)) {
              console.log(`Deleting index ${index}...`);
              store.deleteIndex(index);
            }
          });

          indexColumns.forEach((c) => {
            if (!indexes.contains(c.config.name)) {
              console.log(`Creating index ${c.config.name}...`);
              store.createIndex(c.config.name, c.config.name);
            }
          });
        } else {
          adjustStore(transaction, sc, indexColumns);
        }
      });
    },
  });

  window.addEventListener("online", async () => {
    syncContext.networkStatus = "online";
    syncContext.onSyncStateCallback(
      syncContext.networkStatus,
      syncContext.syncCount,
    );

    await sendAllSyncs(syncContext);
  });

  window.addEventListener("offline", () => {
    syncContext.networkStatus = "offline";
    syncContext.onSyncStateCallback(
      syncContext.networkStatus,
      syncContext.syncCount,
    );
  });

  sendAllSyncs(syncContext).then(() => console.debug("Send syncs after load"));

  async function backwardSync<
    TColumn,
    TDataSchema extends Record<string, ColumnBase<TColumn>>,
    R extends Record<keyof TDataSchema, any>,
  >(table: Table<TColumn, TDataSchema>, records: R[]) {
    return backwardSyncScoped(syncContext, table, records);
  }

  async function getItems<
    TColumn,
    TDataSchema extends Record<string, ColumnBase<TColumn>>,
  >(table: Table<TColumn, TDataSchema>) {
    return getItemsScoped(syncContext, table);
  }

  function putItem<
    TColumn,
    TDataSchema extends Record<string, ColumnBase<TColumn>>,
    R extends Record<keyof TDataSchema, any>,
  >(table: Table<TColumn, TDataSchema>, object: R): R {
    return putItemScoped(
      syncContext,
      table,
      JSON.parse(JSON.stringify(object)),
    );
  }

  function deleteItem<
    TColumn extends StoreKey<unknown, any> | IDBKeyRange,
    TDataSchema extends Record<string, ColumnBase<TColumn>>,
  >(
    table: Table<TColumn, TDataSchema>,
    key: string | number | string[] | number[],
  ) {
    deleteItemScoped(syncContext, table, key);
  }

  function onSync(fn: OnSyncFn) {
    syncContext.onSyncCallback = fn;
  }

  function onSyncState(fn: OnSyncStateFn) {
    syncContext.onSyncStateCallback = fn;
  }

  return {
    putItem,
    getItems,
    deleteItem,
    onSyncState,
    onSync,
    backwardSync,
  };
}
