import { AITool } from "../src/AITool";
import { OpenAIAssistant } from "../src/OpenAIAssistant";
import OpenAI from "openai";

describe("OpenAIAssistant", () => {
  const model: OpenAI.Chat.ChatModel = "gpt-4o-mini";

  const weatherTool: AITool = {
    name: "get_weather",
    description: "Get the current weather",
    params: {},
    run: async (params: Record<string, unknown>): Promise<unknown> => {
      return { degrees: "44.0" };
    }
  };

  it("can respond with hello", async () => {
    const assistant = new OpenAIAssistant(model, "");
    const message = await assistant.send("Say hello!");
    expect(message).toMatchObject({ content: expect.stringMatching(/hello/i) });
  });

  it("uses a tool", async () => {
    const assistant = new OpenAIAssistant(model, "");
    assistant.tools.push(weatherTool);
    const message = await assistant.send("What's the temperature today?");
    expect(message).toMatchObject({ content: expect.stringMatching(/44/i) });
  });
});
