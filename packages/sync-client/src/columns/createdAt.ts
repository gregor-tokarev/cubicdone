import { ColumnBase } from "../column-base";

export class CreatedAtBase extends ColumnBase<number> {
  constructor(name: string) {
    super(name, "int");

    this.config.defaultFn = Date.now;
  }
}

export function createdAt(name: string) {
  return new CreatedAtBase(name);
}
