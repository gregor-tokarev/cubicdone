import { ColumnBase } from "../column-base";

export class IntegerBase extends ColumnBase<number> {
  constructor(name: string) {
    super(name, "int");
  }
}

export function integer(name: string) {
  return new IntegerBase(name);
}
