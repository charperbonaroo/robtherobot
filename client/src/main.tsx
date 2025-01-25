import { createRoot } from "react-dom/client";
import React from "react";
import { App } from "./App";

window.addEventListener("DOMContentLoaded", () => {
  const root = createRoot(document.getElementById("app")!);
  root.render(<App />);
});
