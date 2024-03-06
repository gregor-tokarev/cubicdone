import { ColumnBase } from "../column-base";

export class StringBase<T extends string> extends ColumnBase<T> {
  constructor(name: string) {
    super(name, "string");
  }
}

export function string<T extends string>(name: string) {
  return new StringBase<T>(name);
}
