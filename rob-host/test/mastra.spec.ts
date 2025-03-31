import { createTool, Mastra } from "@mastra/core";
import { Agent } from "@mastra/core/agent";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";

// Mock @mastra/rag since we don't need it for this test
jest.mock('@mastra/rag', () => ({
  MDocument: jest.fn()
}));

describe("mastra", () => {
  it("uses a tool", async () => {
    const weatherTool = createTool({
      id: "weather",
      description: "Get the weather for a location",
      inputSchema: z.object({
        location: z.string()
      }),
      outputSchema: z.string(),
      execute: async ({ context }: { context: { location: string } }) => {
        return `The weather in ${context.location} is sunny`;
      }
    });

    const agent = new Agent({
      name: "Weather Agent",
      instructions: "You are a helpful weather assistant.",
      model: openai("gpt-4"),
      tools: { weatherTool }
    });

    const mastra = new Mastra({
      agents: { weatherAgent: agent }
    });

    const result = await mastra.getAgent("weatherAgent").generate("What's the weather in Amsterdam?");
    expect(result.text).toContain("sunny");
  });
});
