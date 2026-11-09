import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@ui/styles.css";
import "./terminal.css";
import { Terminal } from "./views.tsx";

const container = document.getElementById("root");

if (container) {
  createRoot(container).render(
    <StrictMode>
      <Terminal />
    </StrictMode>,
  );
}
