import { IDBPDatabase, IDBPTransaction } from "idb";
import { Table } from "../define-schema";
import { ColumnBase } from "../column-base";

export function newStore(
  database: IDBPDatabase,
  transaction: IDBPTransaction<unknown, string[], "versionchange">,
  sc: Table<any, any>,
  indexColumns: ColumnBase<any>[],
) {}
