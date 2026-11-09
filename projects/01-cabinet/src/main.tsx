import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@ui/styles.css";
import "./app.css";
import { Root } from "./App.tsx";

const container = document.getElementById("root");

if (container) {
  createRoot(container).render(
    <StrictMode>
      <Root />
    </StrictMode>,
  );
}
