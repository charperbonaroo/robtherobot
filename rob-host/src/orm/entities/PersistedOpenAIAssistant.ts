import { OpenAIAssistant } from "../../OpenAIAssistant";
import OpenAI from "openai";
import { Injector } from "../../util/Injector";
import { OpenAIAssistantMessageRepo } from "../OpenAIAssistantMessageRepo";
import { AITool } from "rob-host/src/AITool";
import { OpenAIAssistantRepo } from "../OpenAIAssistantRepo";

export class PersistedOpenAIAssistant extends OpenAIAssistant {
  constructor(
    private injector: Injector, 
    public id: number, 
    private toolNames: string[],
    model: OpenAI.Chat.ChatModel, 
    directory: string, 
    openai: OpenAI
  ) {
    super(model, directory, openai);
  }

  public restoreMessages() {
    const repo = this.injector.get(OpenAIAssistantMessageRepo);
    this.messages = repo.getMessages(this.id);
  }

  public getUnboundToolNames() {
    return this.toolNames.filter(name => !this.tools.find(tool => tool.name === name));
  }

  public pushMessage(...messages: OpenAIAssistant.Message[]) {
    const repo = this.injector.get(OpenAIAssistantMessageRepo)
    for (const message of messages)
      repo.createMessage(this.id, message);

    super.pushMessage(...messages);
  }

  public restoreTools(...tools: AITool[]) {
    for (const tool of tools) {
      if (!this.toolNames.includes(tool.name))
        throw new Error(`Tool ${tool.name} was not added before; use addTools() to add it.`);
      this.tools.push(tool);
    }
  }

  public addTools(...tools: AITool[]): void {
    super.addTools(...tools);

    const repo = this.injector.get(OpenAIAssistantRepo);
    this.toolNames = this.tools.map(tool => tool.name);
    repo.updateAssistantTools(this.id, this.toolNames);
  }
}
