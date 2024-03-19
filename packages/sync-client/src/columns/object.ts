import { ColumnBase } from "../column-base";

export class ObjectBase<T extends string> extends ColumnBase<T> {
  constructor(name: string) {
    super(name, "object");
  }
}

export function object<T extends string>(name: string) {
  return new ObjectBase<T>(name);
}
