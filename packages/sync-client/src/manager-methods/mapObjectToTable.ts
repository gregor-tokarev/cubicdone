import { ColumnBase } from "../column-base";
import { Table } from "../define-schema";

export function mapObjectToTable<
  TColumn extends ColumnBase<any>,
  TDataSchema extends Record<string, TColumn>,
  M extends Record<keyof TDataSchema, any>,
>(table: Table<any, TDataSchema>, object: M): M {
  const obj = {} as M;

  for (const objKey in table.dataSchema) {
    const column = Object.values(table.dataSchema).find(
      (c) => c.config.name === objKey,
    );

    const defaultValue =
      column.config.default ?? column.config.defaultFn
        ? column.config.defaultFn()
        : null;
    obj[objKey] = JSON.parse(JSON.stringify(object[objKey])) ?? defaultValue;
  }

  return obj;
}
