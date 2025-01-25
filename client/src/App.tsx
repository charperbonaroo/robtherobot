import React, { useEffect, useState } from "react";
import { SocketClient } from "./service/SocketClient";

export function App() {
  const [cwd, setCwd] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      const socketClient = new SocketClient();
      setCwd(await socketClient.query(["cwd"]));
    })();
  }, []);

  return <div className="container">
    <h1>Hello, world</h1>
    <code>CWD: {cwd}</code>
  </div>;
}
