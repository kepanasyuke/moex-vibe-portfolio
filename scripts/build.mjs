import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const node = process.execPath;
const vite = path.join(root, "node_modules", "vite", "bin", "vite.js");

const PROJECTS = [
  "01-cabinet",
  "02-quotes",
  "03-payments",
  "04-admin",
  "05-landing",
  "06-graphql",
  "07-calculator",
  "08-design-system",
];

const build = (project, args) => {
  const cwd = path.join(root, "projects", project);
  const result = spawnSync(node, [vite, ...args], { cwd, stdio: "inherit", windowsHide: true });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

PROJECTS.forEach((project) => {
  console.info(`\n▶ ${project}`);
  build(project, ["build"]);

  if (project === "05-landing") {
    build(project, ["build", "--ssr", "src/entry-server.tsx", "--outDir", "dist/server"]);
  }
});

console.info("\nВсе проекты собраны.");
