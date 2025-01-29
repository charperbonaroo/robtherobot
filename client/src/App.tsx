import React, { useState } from "react";
import { MonadValue } from "./components/MonadValue";
import { useClient } from "./hooks/useClient";
import { RobTheRobot } from "../../shared/RobTheRobot";

export function App() {
  const cwdResult = useClient("cwd");
  const [messages, setMessages] = useState<RobTheRobot.Message[]>([]);

  return <div className="container">
    <h1>Hello, world</h1>
    <code>CWD: <MonadValue {...cwdResult}>{(cwd) => cwd}</MonadValue></code>
    <textarea type="text" />
  </div>;
}
