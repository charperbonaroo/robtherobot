import { OpenAIAssistantRepo } from "rob-host/src/orm/OpenAIAssistantRepo";
import { SqliteClient } from "../../src/orm/SqliteClient";

describe("SqliteClient", () => {
  it("creates a new sqlite client", () => {
    const client = new SqliteClient(":memory:");
    expect(client).toBeInstanceOf(SqliteClient);
  });

  it("returns an OpenAIAssistantRepo", () => {
    const client = new SqliteClient(":memory:");
    const openaiAssistantRepo = client.get(OpenAIAssistantRepo);
    expect(openaiAssistantRepo).toBeInstanceOf(OpenAIAssistantRepo)
  });
});
