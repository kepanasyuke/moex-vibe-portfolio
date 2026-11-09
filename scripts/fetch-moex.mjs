import fs from "node:fs";
import path from "node:path";

const dir = "C:/Users/Admin/Downloads/moex-ref";
fs.mkdirSync(dir, { recursive: true });

const html = await fetch("https://www.moex.com/", {
  headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0 Safari/537.36" },
  signal: AbortSignal.timeout(30000),
}).then((response) => response.text());

fs.writeFileSync(path.join(dir, "index.html"), html);

const links = [
  ...new Set([...html.matchAll(/<link[^>]+href="([^"]+\.css[^"]*)"/g)].map((match) => match[1])),
];

console.log("html", html.length, "css", links.length);

for (const link of links.slice(0, 4)) {
  const url = link.startsWith("http") ? link : `https://www.moex.com${link}`;
  const css = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0 Chrome/131.0" },
    signal: AbortSignal.timeout(60000),
  }).then((response) => response.text());
  const name = link.split("/").pop();

  fs.writeFileSync(path.join(dir, name), css);
  console.log(name, css.length);
}
