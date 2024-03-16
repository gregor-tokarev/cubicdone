import { Table } from "./define-schema";
import { ColumnBase } from "./column-base";
import { SYNC_STORE_NAME } from "./connect";
import { nanoid } from "nanoid";
import { SyncContext } from "./models/sync-context.model";

export abstract class SyncAction {
  id: string | number;
  actionName: string;
  data?: any;
}

export class UpdateSyncAction extends SyncAction {
  constructor(
    public readonly id: string | number,
    public data: Record<string, any>,
  ) {
    super();
  }

  actionName = "update";
}
export class DeleteSyncAction extends SyncAction {
  constructor(public readonly id: string | number) {
    super();
  }

  actionName = "delete";
}
export class CreateSyncAction extends SyncAction {
  constructor(
    public readonly id: string | number,
    public data: Record<string, any>,
  ) {
    super();
  }

  actionName = "create";
}

export class SyncEntry {
  timestamp: number;
  id: string;

  constructor(
    public action: SyncAction,
    public targetTable: string,
  ) {
    this.timestamp = Date.now();
    this.id = nanoid();
  }
}

export async function createSync<
  TDataSchema extends Record<string, ColumnBase<any>>,
>(
  syncContext: SyncContext,
  syncAction: SyncAction,
  table: Table<any, TDataSchema>,
) {
  const sync = new SyncEntry(syncAction, table.name);
  await syncContext.db.put(SYNC_STORE_NAME, sync);

  return sync;
}

// export async function getItemSyncs<
//   TDataSchema extends Record<string, ColumnBase<any>>,
// >(table: Table<any, TDataSchema>, itemId: string | number) {
//   await DB.getAll(table.name, {});
// }
