import "./main.css";
import { Bootstrap } from "rob-gui";
import "./RobApp";

Bootstrap.url = "/static/bootstrap.css";

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("app")!.innerHTML = "<rob-app />";
});
