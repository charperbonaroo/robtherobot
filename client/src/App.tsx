import React from "react";
import { MonadValue } from "./components/MonadValue";
import { useClient } from "./hooks/useClient";

export function App() {
  const cwdResult = useClient("cwd");
  const lsResult = useClient("ls", []);

  return <div className="container">
    <h1>Hello, world</h1>
    <code>CWD: <MonadValue {...cwdResult}>{(cwd) => cwd}</MonadValue></code>
    <h2>LS</h2>
    <pre><MonadValue {...lsResult}>{(ls) => ls}</MonadValue></pre>
  </div>;
}
