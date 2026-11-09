import fs from "node:fs";
const css = fs.readFileSync("C:/Users/Admin/Downloads/moex-ref/3ced00ac7e33608c.css", "utf8");
const count = (re, n = 12) => {
  const map = new Map();
  for (const m of css.matchAll(re)) map.set(m[1], (map.get(m[1]) ?? 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
};
console.log("RADIUS", count(/border-radius:\s*([^;}]+)/g, 10));
console.log("SHADOW", count(/box-shadow:\s*([^;}]+)/g, 6));
console.log("HEIGHT", count(/height:\s*(\d+px)/g, 14));
console.log("LINE HEIGHT", count(/line-height:\s*([^;}]+)/g, 10));
console.log("SPACE VARS", [...new Set([...css.matchAll(/--space-(\d{4})/g)].map((m) => m[1]))].slice(0, 20));
console.log("FONT VARS", [...new Set([...css.matchAll(/--font-([a-z0-9-]+)/g)].map((m) => m[1]))].slice(0, 40));
const colors = new Map();
for (const m of css.matchAll(/#[0-9a-fA-F]{6}\b/g)) colors.set(m[0].toLowerCase(), (colors.get(m[0].toLowerCase()) ?? 0) + 1);
console.log("COLORS", [...colors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15));
