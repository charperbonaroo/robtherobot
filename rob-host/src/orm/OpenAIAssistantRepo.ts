import { DatabaseSync, StatementSync } from "node:sqlite";
import { Injector } from "../util/Injector";
import { MigrationsRepo } from "./MigrationsRepo";
import OpenAI, { ClientOptions } from "openai";
import { PersistedOpenAIAssistant } from "./entities";

export class OpenAIAssistantRepo {
  private db: DatabaseSync;
  private migrationsRepo: MigrationsRepo;
  private insertStatement: StatementSync;
  private updateToolsStatement: StatementSync;
  private static MIGRATIONS = [
    `CREATE TABLE IF NOT EXISTS openai_assistants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model TEXT NOT NULL,
      directory TEXT NOT NULL,
      client_options TEXT NOT NULL,
      tools TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  constructor(private injector: Injector) {
    this.db = injector.get(DatabaseSync);
    this.migrationsRepo = injector.get(MigrationsRepo);
    this.migrationsRepo.ensureMigrationSqlMany(OpenAIAssistantRepo.MIGRATIONS);
    this.insertStatement = this.db.prepare(`
      INSERT INTO openai_assistants (model, directory, client_options, tools) 
      VALUES (?, ?, ?, '[]')
    `);
    this.updateToolsStatement = this.db.prepare("UPDATE openai_assistants SET tools = ? WHERE id = ?");
  }

  public createAssistant(model: OpenAI.Chat.ChatModel, directory: string, clientOptions: ClientOptions) {
    const clientOptionsJson = JSON.stringify(clientOptions)
    const { lastInsertRowid: id } = this.insertStatement.run(model, directory, clientOptionsJson);
    return new PersistedOpenAIAssistant(this.injector, id as number, [], model, directory, new OpenAI(clientOptions));
  }

  public updateAssistantTools(id: number, toolNames: string[]) {
    this.updateToolsStatement.run(JSON.stringify(toolNames), id);
  }
}
