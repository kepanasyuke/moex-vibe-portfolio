import { renderToString } from "react-dom/server";
import { App } from "./App.tsx";

export const render = (_url: string): string => renderToString(<App />);
