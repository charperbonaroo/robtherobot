export interface Repository<T extends object, ID extends keyof T> {
  getById(id: T[ID]): Promise<T>;
  getCursor(): Repository.Cursor<T>;
  getAll(limit?: number): Promise<T[]>;
  getCount(): Promise<number>;
  getCountAndCursor(): Promise<[number, Repository.Cursor<T>]>;

  insert(value: Omit<T, ID>): Promise<T>;
  update(id: T[ID], value: Partial<Omit<T, ID>>): Promise<T>;
  remove(id: T[ID]): Promise<T>;
}

export namespace Repository {
  export interface Cursor<T> {
    hasNext: boolean;
    read(): Promise<T[]>;
    next(): Cursor<T>;
  }
}
