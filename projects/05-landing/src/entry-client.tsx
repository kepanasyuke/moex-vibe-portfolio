import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import "@ui/styles.css";
import "./landing.css";
import { App } from "./App.tsx";

const container = document.getElementById("root");

if (container) {
  hydrateRoot(
    container,
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
