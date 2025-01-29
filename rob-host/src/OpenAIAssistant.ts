import OpenAI from "openai";
import { AITool } from "./AITool";

export class OpenAIAssistant {
  private openai = new OpenAI();
  private messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  private tools: AITool[] = [];

  constructor(private model: OpenAI.Chat.ChatModel, private directory: string) {
  }

  public getMessages() {
    return this.messages;
  }

  addTools(...tools: AITool[]) {
    for (const tool of tools) {
      this.tools.push(tool);
      this.messages.push({
        role: "system",
        content: `You've been given access to the following tool: ${tool.name}.\n`
          + `Use it when you think is appropriate. The tool's description is:\n\n${tool.description}`
      });
    }
  }

  async pushMessage(...messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
    this.messages.push(...messages);
  }

  /**
   * Send a next message and return the replies.
   * @param prompt
   */
  async send(prompt: string): Promise<OpenAIAssistant.Message> {
    return await this.sendMessage({
      role: "user",
      content: [{ type: "text", text: prompt }]
    });
  }

  async sendMessage(...messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
    this.pushMessage(...messages);
    return await this.run();
  }

  async run(): Promise<OpenAIAssistant.Message> {
    const body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
      model: this.model,
      messages: this.messages,
    };

    if (this.tools.length) {
      body.tools = this.tools.map((aiTool) => ({
        type: "function",
        function: {
          name: aiTool.name,
          description: aiTool.description,
          strict: true,
          parameters: {
            type: "object",
            properties: aiTool.params,
            additionalProperties: false,
            required: Object.keys(aiTool.params),
          }
        }
      }));
    }

    let response: OpenAI.Chat.Completions.ChatCompletion;

    while(true) {
      response = await this.openai.chat.completions.create(body);

      const choice = response.choices[0];
      this.messages.push(choice.message);

      if (choice.message.tool_calls?.length) {
        for (const tool_call of choice.message.tool_calls) {
          const tool = this.tools.find((tool) => tool.name === tool_call.function.name);
          if (!tool)
            throw new Error(`ChatGPT tried to call tool '${tool_call.function.name}' but it doesn't exist. Huh?`);

          const params = JSON.parse(tool_call.function.arguments);
          const result = await tool?.run(params, this.directory);
          this.messages.push({
            role: "tool",
            content: JSON.stringify(result),
            tool_call_id: tool_call.id
          });
        }

        body.messages = this.messages;
      }

      if (choice.message.content) {
        return choice.message as OpenAIAssistant.Message;
      }
    }
  }
}

export namespace OpenAIAssistant {
  export interface Message {
    content: string;
  }
}
