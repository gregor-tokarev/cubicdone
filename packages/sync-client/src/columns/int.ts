import { ColumnBase } from "../column-base";

export class IntBase extends ColumnBase<number> {
  constructor(name: string) {
    super(name, "int");
  }
}

export function int(name: string) {
  return new IntBase(name);
}
