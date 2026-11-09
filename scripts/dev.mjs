import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const PROJECTS = [
  { id: "01-cabinet", label: "Кабинет инвестора", api: 4101, web: 5101 },
  { id: "02-quotes", label: "Терминал котировок", api: 4102, web: 5102 },
  { id: "03-payments", label: "Платежи", api: 4103, web: 5103 },
  { id: "04-admin", label: "Администрирование", api: 4104, web: 5104 },
  { id: "05-landing", label: "SSR-лендинг", api: 5105, web: 5105, ssr: true },
  { id: "06-graphql", label: "GraphQL-витрина", api: 4106, web: 5106 },
  { id: "07-calculator", label: "Калькулятор", api: 4107, web: 5107 },
  { id: "08-design-system", label: "Дизайн-система", api: 4108, web: 5108 },
];

const node = process.execPath;
const tsx = path.join(root, "node_modules", "tsx", "dist", "cli.mjs");
const vite = path.join(root, "node_modules", "vite", "bin", "vite.js");

const children = [];

const run = (args, cwd, label) => {
  const child = spawn(node, args, { cwd, stdio: "inherit", windowsHide: true });

  children.push(child);
  child.on("exit", (code) => code !== 0 && console.error(`[${label}] process exited with ${code}`));

  return child;
};

const stopAll = () => {
  children.forEach((child) => child.kill());
  process.exit(0);
};

PROJECTS.forEach((project) => {
  const cwd = path.join(root, "projects", project.id);

  if (project.ssr) {
    run([tsx, "server/index.ts"], cwd, `${project.label} · SSR`);
  } else {
    run([tsx, "server/index.ts"], cwd, `${project.label} · API`);
    run([vite, "--port", String(project.web)], cwd, `${project.label} · web`);
  }
});

process.on("SIGINT", stopAll);
process.on("SIGTERM", stopAll);

console.info("MultiTool MOEX portfolio — dev servers");
PROJECTS.forEach((project) => console.info(`  ${project.label}: http://127.0.0.1:${project.web}`));
