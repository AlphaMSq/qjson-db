declare class JSONdb {
  constructor(
    filePath: string,
    options?: {
      asyncWrite?: boolean;
      syncOnWrite?: boolean;
      jsonSpaces?: number;
      stringify?: (value: any, replacer?: any, space?: string | number) => string;
      parse?: (text: string) => any;
    }
  );

  init(key: string, value: any): void;
  set(key: string, value: any): void;
  get(key: string): any;
  has(key: string): boolean;
  delete(key: string): boolean | undefined;
  deleteAll(): this;
  sync(): void;
  JSON(storage?: Record<string, any>): Record<string, any>;
}

export = JSONdb;