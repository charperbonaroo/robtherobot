import OpenAI, { ClientOptions } from "openai";
import { AITool } from "./AITool";

export class OpenAIAssistant {
  private messages: OpenAIAssistant.Message[] = [];
  private tools: AITool[] = [];

  public static withOptions(model: OpenAI.Chat.ChatModel, directory: string, clientOptions: ClientOptions) {
    return new OpenAIAssistant(model, directory, new OpenAI(clientOptions));
  }

  constructor(
    private model: OpenAI.Chat.ChatModel,
    private directory: string,
    private openai = new OpenAI(),
  ) {
  }

  public getOpenaiMessages() {
    return this.messages;
  }

  getMessages(): OpenAIAssistant.Message[] {
    return this.messages;
  }

  addTools(...tools: AITool[]) {
    for (const tool of tools) {
      this.tools.push(tool);
      this.addSystemMessage(`You've been given access to the following tool: ${tool.name}.\n`
          + `Use it when you think is appropriate. The tool's description is:\n\n${tool.description}`)
    }
  }

  addSystemMessage(content: string) {
    this.messages.push({ role: "system", content });
  }

  pushMessage(...messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
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

  async sendMessage(...messages: OpenAIAssistant.Message[]) {
    return await this.run(...messages);
  }

  async run(...messages: OpenAIAssistant.Message[]): Promise<OpenAIAssistant.Message> {
    let last: OpenAIAssistant.Message|null = null;
    for await (const value of this.runMessageStream(...messages))
      last = value;
    if (!last)
      throw new Error(`Unexpected lack of message`);
    return last;
  }

  async *runMessageStream(...messages: OpenAIAssistant.Message[]): AsyncGenerator<OpenAIAssistant.Message, true, void> {
    for (const message of messages)
      yield message;

    this.pushMessage(...messages);

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
      yield choice.message;

      if (choice.message.tool_calls?.length) {
        for (const tool_call of choice.message.tool_calls) {
          const tool = this.tools.find((tool) => tool.name === tool_call.function.name);
          if (!tool)
            throw new Error(`ChatGPT tried to call tool '${tool_call.function.name}' but it doesn't exist. Huh?`);

          const params = JSON.parse(tool_call.function.arguments);
          const result = await tool?.run(params, this.directory);
          const message: OpenAIAssistant.Message = {
            role: "tool",
            content: JSON.stringify(result),
            tool_call_id: tool_call.id
          }
          this.messages.push(message);
          yield message;
        }

        body.messages = this.messages;
      }

      if (choice.message.content)
        return true;
    }
  }
}

export namespace OpenAIAssistant {
  export type Message = OpenAI.Chat.Completions.ChatCompletionMessageParam;
}
