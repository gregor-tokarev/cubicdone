import { ColumnBase } from "../column-base";
import { Table } from "../define-schema";

export function mapObjectToTable<
  TColumn extends ColumnBase<any>,
  TDataSchema extends Record<string, TColumn>,
  M extends Record<keyof TDataSchema, any>,
>(table: Table<any, TDataSchema>, settingObject: M): M {
  const resultObject = {} as M;

  for (const objKey in table.dataSchema) {
    const column = table.dataSchema[objKey];

    const defaultValue =
      column.config.default ?? column.config.defaultFn
        ? column.config.defaultFn()
        : null;

    resultObject[objKey] = settingObject[objKey] ?? defaultValue;
  }

  return JSON.parse(JSON.stringify(resultObject));
}
