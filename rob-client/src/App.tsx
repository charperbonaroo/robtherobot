import React, { useState } from "react";
import { MonadValue } from "./components/MonadValue";
import { useClient } from "./hooks/useClient";
import { RobWeb } from "rob-web";
import { MessageForm } from "./components/MessageForm";
import { RobWebClient } from "./service/RobWebClient";
import { MessageList } from "./components/MessageList";

export function App() {
  const cwdResult = useClient("cwd");
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<RobWeb.Message[]>([]);

  const onMessage = async (content: string) => {
    const userMessage = { content, role: "user" };
    setLoading(true);
    setMessages([...messages, userMessage]);
    const responseMessage = await RobWebClient.instance.send(userMessage.content);
    setMessages([...messages, userMessage, responseMessage]);
    setLoading(false);
  };

  return <div className="container">
    <h1>Hello, world (5)</h1>
    <code>CWD: <MonadValue {...cwdResult}>{(cwd) => cwd}</MonadValue></code>
    <MessageList messages={messages} />
    <MessageForm disabled={loading} onMessage={onMessage} />
  </div>;
}
