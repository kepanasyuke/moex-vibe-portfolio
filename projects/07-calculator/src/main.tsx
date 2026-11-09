import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@ui/styles.css";
import "./calc.css";
import { CalcApp } from "./views.tsx";

const container = document.getElementById("root");

if (container) {
  createRoot(container).render(
    <StrictMode>
      <CalcApp />
    </StrictMode>,
  );
}
