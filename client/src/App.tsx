import React from "react";
import { useQuery } from "./hooks/useQuery";
import { Monad } from "./components/Monad";

export function App() {
  const cwdResult = useQuery<string>(["cwd"]);

  return <div className="container">
    <h1>Hello, world</h1>
    <code>CWD: <Monad {...cwdResult}>{(cwd) => cwd}</Monad></code>
  </div>;
}
