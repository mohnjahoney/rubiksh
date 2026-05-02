import "./style.css";
import { AppController } from "./app/AppController";

const container = document.querySelector<HTMLDivElement>("#app");

if (!container) {
  throw new Error("App container not found");
}

void AppController.mount(container);
