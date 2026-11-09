import fs from "node:fs";
import path from "node:path";

const dir = "packages/ui/src/fonts/onest";
const cssPath = "packages/ui/src/fonts.css";
const base = "https://cdn.jsdelivr.net/npm/@fontsource/onest@5.2.5";
const timeout = 30000;

const subsetOf = (slug) => {
  if (slug.includes("-ext")) {
    return null;
  }

  if (slug.includes("-cyrillic-")) {
    return "cyrillic";
  }

  return slug.includes("-latin-") ? "latin" : null;
};

const parseFace = (slug, body) => {
  const subset = subsetOf(slug);
  const file = /url\(\.\/files\/([^)]+\.woff2)\)/.exec(body)?.[1];
  const range = /unicode-range:\s*([^;]+);/.exec(body)?.[1];

  return subset && file && range ? { subset, file, range: range.trim() } : null;
};

const download = (url) => fetch(url, { signal: AbortSignal.timeout(timeout) });

const saveFace = async (weight, face) => {
  const local = `onest-${weight}-${face.subset}.woff2`;
  const data = Buffer.from(await download(`${base}/files/${face.file}`).then((r) => r.arrayBuffer()));

  fs.writeFileSync(path.join(dir, local), data);

  return `@font-face{font-family:'Onest';font-style:normal;font-weight:${weight};font-display:swap;src:url(./fonts/onest/${local}) format('woff2');unicode-range:${face.range};}`;
};

const collectWeight = async (weight) => {
  const css = await download(`${base}/${weight}.css`).then((r) => r.text());
  const parsed = [...css.matchAll(/\/\* ([a-z0-9-]+) \*\/\s*@font-face\s*\{([^}]+)\}/g)]
    .map(([, slug, body]) => parseFace(slug, body))
    .filter(Boolean);

  return Promise.all(parsed.map((face) => saveFace(weight, face)));
};

fs.mkdirSync(dir, { recursive: true });

const faces = (await Promise.all([400, 500, 600].map(collectWeight))).flat();

fs.writeFileSync(cssPath, `${faces.join("\n")}\n`);
console.log("faces", faces.length, "bytes", fs.statSync(cssPath).size, "files", fs.readdirSync(dir).length);
