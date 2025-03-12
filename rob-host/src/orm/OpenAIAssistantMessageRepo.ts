import { DatabaseSync, StatementSync } from "node:sqlite";
import { Injector } from "../util";
import { MigrationsRepo } from "./MigrationsRepo";
import { OpenAIAssistant } from "../OpenAIAssistant";

export class OpenAIAssistantMessageRepo {
  private db: DatabaseSync;
  private insertStatement: StatementSync;
  private updateToolsStatement: StatementSync;

  private static MIGRATIONS = [
    `CREATE TABLE IF NOT EXISTS openai_assistant_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openai_assistant_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  constructor(injector: Injector) {
    this.db = injector.get(DatabaseSync);
    injector.get(MigrationsRepo).ensureMigrationSqlMany(OpenAIAssistantMessageRepo.MIGRATIONS);

    this.insertStatement = this.db.prepare("INSERT INTO openai_assistant_messages (openai_assistant_id, message) VALUES (?, ?)");
    this.updateToolsStatement = this.db.prepare("UPDATE openai_assistants SET tools = ? WHERE id = ?");
  }

  public createMessage(openaiAssistantId: number, message: OpenAIAssistant.Message): OpenAIAssistant.Message & {id: number} {
    const messageJson = JSON.stringify(message);
    const { lastInsertRowid: id } = this.insertStatement.run(openaiAssistantId, messageJson);
    return Object.assign(JSON.parse(messageJson), { id });
  }

  public updateAssistantTools(assistantId: number, tools: string[]): void {
    this.updateToolsStatement.run(JSON.stringify(tools), assistantId);
  }
}
