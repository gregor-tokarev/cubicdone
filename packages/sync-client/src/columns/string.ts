import { ColumnBase } from "../column-base";

export class StringBase extends ColumnBase<string> {
  constructor(name: string) {
    super(name, "string");
  }
}

export function string(name: string) {
  return new StringBase(name);
}
