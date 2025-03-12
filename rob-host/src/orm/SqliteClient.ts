import { DatabaseSync } from "node:sqlite";
import { MigrationsRepo } from "./MigrationsRepo";
import { OpenAIAssistantRepo } from "./OpenAIAssistantRepo";
import { Injector } from "../util/Injector";
import { OpenAIAssistantMessageRepo } from "./OpenAIAssistantMessageRepo";

export class SqliteClient {
  private db: DatabaseSync;

  private injector = new Injector(this);

  constructor(path: string) {
    this.db = new DatabaseSync(path);
    this.db.exec("CREATE TABLE IF NOT EXISTS migrations (sql TEXT PRIMARY KEY)");

    this.injector.set(this.db);
    this.injector.set(new MigrationsRepo(this.injector));
    this.injector.set(new OpenAIAssistantRepo(this.injector));
    this.injector.set(new OpenAIAssistantMessageRepo(this.injector));
  }

  public get<T>(constructor: new (...args: any[]) => T): T {
    return this.injector.get(constructor);
  }
}
