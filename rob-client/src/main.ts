import { Bootstrap } from "rob-gui";
import "./RobApp";
import { SocketClient } from "./service/SocketClient";

SocketClient.url = "http://localhost:1815/ws";
Bootstrap.url = "/static/bootstrap.css";

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("app")!.innerHTML = "<rob-app />";
});
