import { mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "fs";
import { AITool } from "../src/AITool";
import { OpenAIAssistant } from "../src/OpenAIAssistant";
import OpenAI from "openai";
import { FileTools } from "../src/tools/FileTools";

describe("OpenAIAssistant", () => {
  const model: OpenAI.Chat.ChatModel = "gpt-4o-mini";

  let path: string;

  beforeAll(() => {
    path = `.tmp/${Math.random()}`;
    mkdirSync(path);
    path = realpathSync(path);
  });

  afterAll(() => rmSync(path, { recursive: true, force: true }));

  let assistant: OpenAIAssistant;

  beforeEach(() => {
    assistant = new OpenAIAssistant(model, path);
  });

  it("can respond with hello", async () => {
    const message = await assistant.send("Say hello!");
    expect(message).toMatchObject({ content: expect.stringMatching(/hello/i) });
  });

  it("uses a tool", async () => {
    const weatherTool: AITool = {
      name: "get_weather",
      description: "Get the current weather",
      params: {},
      run: async (params: Record<string, unknown>): Promise<unknown> => {
        return { degrees: "44.0" };
      }
    };

    assistant.addTools(weatherTool);
    const message = await assistant.send("What's the temperature today?");
    expect(message).toMatchObject({ content: expect.stringMatching(/44/i) });
  });

  describe("with file tools", () => {
    beforeEach(async () => {
      assistant.addTools(new FileTools.LoggingReader(), new FileTools.LoggingWriter());
    });

    it("reads a file", async () => {
      writeFileSync(path + "/README", "Hello, my name is Banana!");
      const message = await assistant.send("Read the 'README' file; What is my name?");
      expect(message).toMatchObject({ content: expect.stringMatching(/Banana/i) });
    }, 10_000);

    it("writes a file", async () => {
      writeFileSync(path + "/README", "Hello, my name is Banana!");
      const message = await assistant.send("Read 'README', find my name, and replace my name with Pineapple!");
      expect(message).toMatchObject({ content: expect.stringMatching(/Pineapple/i) });
      expect(readFileSync(path + "/README", { encoding: "utf-8" })).toContain("Hello, my name is Pineapple!");
    }, 10_000);
  });
});
