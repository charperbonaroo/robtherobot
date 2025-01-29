import React from "react";
import { MonadValue } from "./components/MonadValue";
import { usePromise } from "./hooks/usePromise";
import { RobTheRobotClient } from "./service/RobTheRobotClient";

export function App() {
  const cwdResult = usePromise(RobTheRobotClient.instance.cwd());

  return <div className="container">
    <h1>Hello, world</h1>
    <code>CWD: <MonadValue {...cwdResult}>{(cwd) => cwd}</MonadValue></code>
  </div>;
}
