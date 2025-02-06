import React, { useState } from "react";
import { MonadValue } from "./components/MonadValue";
import { useClient } from "./hooks/useClient";
import { RobWeb } from "rob-web";
import { RobWebClient } from "./service/RobWebClient";
import { MessageForm, ResponseList } from "rob-gui";

export function App() {
  const cwdResult = useClient("cwd");
  const lastResponsesResult = useClient("lastResponses", 30);
  const [loading, setLoading] = useState<boolean>(false);
  const [responses, setResponses] = useState<RobWeb.Response[]>([]);

  const onMessage = async (content: string) => {
    const userMessage = { content, role: "user" };
    setLoading(true);
    setResponses((acc) => [...acc, { type: "message", message: userMessage }]);
    for await (const response of RobWebClient.instance.send(userMessage.content))
      setResponses((acc) => [...acc, response]);

    setLoading(false);
  };

  return <div className="container">
    <code>CWD: <MonadValue {...cwdResult}>{(cwd) => cwd}</MonadValue></code>
    <MonadValue {...lastResponsesResult}>{(lastResponses) => <ResponseList responses={lastResponses as any} />}</MonadValue>
    <ResponseList responses={responses} />
    <MessageForm disabled={loading} onMessage={onMessage} />
    <div className="p-4" />
  </div>;
}
