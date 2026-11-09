import fs from "node:fs";
const css = fs.readFileSync("C:/Users/Admin/Downloads/moex-ref/3ced00ac7e33608c.css", "utf8");
const count = (re, n = 12) => {
  const map = new Map();
  for (const m of css.matchAll(re)) map.set(m[1], (map.get(m[1]) ?? 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
};
console.log("FONT FAMILY", count(/font-family:([^;}]+)/g, 8));
console.log("FONT SIZE", count(/font-size:\s*([^;}]+)/g, 20));
console.log("WEIGHT", count(/font-weight:\s*([^;}]+)/g, 8));
console.log("RADIUS", count(/border-radius:\s*([^;}]+)/g, 12));
console.log("SHADOW", count(/box-shadow:\s*([^;}]+)/g, 8));
console.log("HEIGHT", count(/height:\s*(\d+px)/g, 12));
console.log("LINE HEIGHT", count(/line-height:\s*([^;}]+)/g, 12));
