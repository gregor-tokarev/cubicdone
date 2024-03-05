import { ColumnBase } from "./column-base";

export class Table<
  TColumn extends any,
  TSchema extends Record<string, ColumnBase<TColumn>>,
> {
  constructor(
    public name: string,
    public dataSchema: TSchema,
  ) {}
}

export function defineSchema<TSchema extends Record<string, ColumnBase<any>>>(
  tableName: string,
  dataSchema: TSchema,
) {
  return new Table(tableName, dataSchema);
}
