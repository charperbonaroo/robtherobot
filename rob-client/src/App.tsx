import React, { useState } from "react";
import { MonadValue } from "./components/MonadValue";
import { useClient } from "./hooks/useClient";
import { RobWeb } from "rob-web";
import { RobWebClient } from "./service/RobWebClient";
import { MessageForm, ResponseList, AutoscrollView } from "rob-gui";
import styles from "./App.module.css";

export function App() {
  const cwdResult = useClient("cwd");
  const lastResponsesResult = useClient("lastResponses", 30);
  const [loading, setLoading] = useState<boolean>(false);
  const [responses, setResponses] = useState<RobWeb.Response[]>([]);

  const onMessage = async (content: string) => {
    const userMessage = { content, role: "user" };
    setLoading(true);
    for await (const response of RobWebClient.instance.send(userMessage.content))
      setResponses((acc) => [...acc, response]);
    setLoading(false);
  };

  return <div className={styles.root}>
    <AutoscrollView>
      <div className="p-4">
        <MonadValue {...lastResponsesResult}>
          {(lastResponses) => <ResponseList responses={lastResponses as any} />}
        </MonadValue>
        <ResponseList responses={responses} />
      </div>
    </AutoscrollView>
    <div className="p-4">
      <MessageForm disabled={loading} onMessage={onMessage} />
      <code>CWD: <MonadValue {...cwdResult}>{(cwd) => cwd}</MonadValue></code>
    </div>
  </div>;
}
