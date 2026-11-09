import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@ui/styles.css";
import "./ds.css";
import { DesignSystemApp } from "./views.tsx";

const container = document.getElementById("root");

if (container) {
  createRoot(container).render(
    <StrictMode>
      <DesignSystemApp />
    </StrictMode>,
  );
}
