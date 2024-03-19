export type ColumnType = "int" | "string" | "timestamp" | "object";

interface DefaultFn<T> {
  (): T;
}

interface ColumnConfig<T> {
  readonly name: string;
  isPrimary: boolean;
  createIndex: boolean;
  default: T | null;
  defaultFn: DefaultFn<T> | null;
  columnType: ColumnType;
}

export class ColumnBase<T> {
  config: ColumnConfig<T>;

  constructor(name: string, columnType: ColumnType) {
    this.config = {
      name,
      columnType,
      default: null,
      defaultFn: null,
      createIndex: false,
      isPrimary: false,
    };
  }

  primaryKey() {
    this.config.isPrimary = true;
    return this;
  }

  default(value: T | DefaultFn<T>) {
    if (value instanceof Function) this.config.defaultFn = value;
    else this.config.default = value;
    return this;
  }

  index() {
    this.config.createIndex = true;
    return this;
  }
}
