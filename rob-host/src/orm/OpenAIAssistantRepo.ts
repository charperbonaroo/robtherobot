import { DatabaseSync, StatementSync } from "node:sqlite";
import { Injector } from "../util/Injector";
import { MigrationsRepo } from "./MigrationsRepo";
import { OpenAIAssistant } from "../OpenAIAssistant";
import OpenAI, { ClientOptions } from "openai";

export class OpenAIAssistantRepo {
  private db: DatabaseSync;
  private migrationsRepo: MigrationsRepo;
  private insertAssistant: StatementSync;

  private static MIGRATIONS = [
    `CREATE TABLE IF NOT EXISTS openai_assistants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model TEXT NOT NULL,
      directory TEXT NOT NULL,
      client_options TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  constructor(injector: Injector) {
    this.db = injector.get(DatabaseSync);
    this.migrationsRepo = injector.get(MigrationsRepo);

    this.migrationsRepo.ensureMigrationSqlMany(OpenAIAssistantRepo.MIGRATIONS);

    this.insertAssistant = this.db.prepare("INSERT INTO openai_assistants (model, directory, client_options) VALUES (?, ?, ?)");
  }

  public createAssistant(model: OpenAI.Chat.ChatModel, directory: string, clientOptions: ClientOptions) {
    const clientOptionsJson = JSON.stringify(clientOptions)
    const { lastInsertRowid: id } = this.insertAssistant.run(model, directory, clientOptionsJson);
    const assistant = OpenAIAssistant.withOptions(model, directory, JSON.parse(clientOptionsJson));
    // wrap the assistant in a class that has an id property, and stores any messages in the database
    // TODO
    return assistant;
  }
}
