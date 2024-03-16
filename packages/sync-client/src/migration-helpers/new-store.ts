import { IDBPDatabase, IDBPTransaction } from "idb";
import { Table } from "../define-schema";
import { ColumnBase } from "../column-base";

export function newStore(
  database: IDBPDatabase,
  transaction: IDBPTransaction<unknown, string[], "versionchange">,
  sc: Table<any, any>,
  indexColumns: ColumnBase<any>[],
) {
  const store = transaction.objectStore(sc.name);
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
}
