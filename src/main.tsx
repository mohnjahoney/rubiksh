import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./style.css";

const container = document.querySelector<HTMLDivElement>("#app");

if (!container) {
  throw new Error("App container not found");
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
