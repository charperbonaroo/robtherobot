import { OpenAIAssistantRepo } from "../../src/orm/OpenAIAssistantRepo";
import { SqliteClient } from "../../src/orm/SqliteClient";
import OpenAI from "openai";

describe("OpenAIAssistantRepo", () => {
  const model: OpenAI.Chat.ChatModel = "gpt-3.5-turbo";

  let repo: OpenAIAssistantRepo;

  beforeEach(() => {
    const client = new SqliteClient(":memory:");
    repo = client.get(OpenAIAssistantRepo);
  });

  it("creates a working OpenAIAssistant", async () => {
    const assistant = repo.createAssistant(model, ".", {});
    const message = await assistant.send("This is just a test. Respond with 'Hello, world!'");
    expect(message.content).toContain("Hello, world!");
  });

  it("finds restores a working assistant", async () => {
    const assistant = repo.createAssistant(model, ".", {});
    await assistant.send("My name is Kitty.");
    const assistantMessages = assistant.getOpenaiMessages();

    const restored = repo.findAssistant(".");
    expect(restored?.getOpenaiMessages()).toEqual(assistantMessages);
    const message = await restored!.send("Say my name.");
    expect(message.content).toContain("Kitty");
  });
});
