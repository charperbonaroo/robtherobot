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
  private selectOneStatement: StatementSync;

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
    this.selectOneStatement = this.db.prepare("SELECT * FROM openai_assistants WHERE directory = ? ORDER BY id DESC LIMIT 1");
  }

  public createAssistant(model: OpenAI.Chat.ChatModel, directory: string, clientOptions: ClientOptions) {
    const clientOptionsJson = JSON.stringify(clientOptions)
    const { lastInsertRowid: id } = this.insertStatement.run(model, directory, clientOptionsJson);
    return new PersistedOpenAIAssistant(this.injector, id as number, [], model, directory, new OpenAI(clientOptions));
  }

  public updateAssistantTools(id: number, toolNames: string[]) {
    this.updateToolsStatement.run(JSON.stringify(toolNames), id);
  }

  public findAssistant(directory: string) {
    const row = this.selectOneStatement.get(directory) as any;
    if (!row)
      return null;
    const clientOptions = JSON.parse(row.client_options);
    const assistant = new PersistedOpenAIAssistant(this.injector, row.id as number, JSON.parse(row.tools), row.model, row.directory, new OpenAI(clientOptions));
    assistant.restoreMessages();
    return assistant;
  }

  public findOrCreateAssistant(directory: string, defaultModel: OpenAI.Chat.ChatModel, defaultClientOptions: ClientOptions) {
    return this.findAssistant(directory) ?? this.createAssistant(defaultModel, directory, defaultClientOptions);
  }
}
