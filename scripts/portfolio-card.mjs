import fs from "node:fs";
import path from "node:path";

const site = "C:/Users/Admin/AppData/Local/Temp/gigatool/portfolio-site";
const shots = "C:/Users/Admin/Documents/MultiTool/HomeChats/Chat-115/docs/screenshots";
const media = path.join(site, "assets/media/moex-portfolio");

fs.mkdirSync(media, { recursive: true });
fs.copyFileSync(path.join(shots, "02-overview.png"), path.join(media, "overview.png"));
fs.copyFileSync(path.join(shots, "03-trading.png"), path.join(media, "trading.png"));
fs.copyFileSync(path.join(shots, "09-profile.png"), path.join(media, "profile.png"));

const indexPath = path.join(site, "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const card = `
      <article class="card" data-cat="backend">
        <div class="top"><h3>moex-vibe-portfolio</h3><span class="lang">TypeScript</span></div>
        <div class="shots"><img src="assets/media/moex-portfolio/overview.png" class="wide" loading="lazy" decoding="async" alt="Обзор портфеля"><img src="assets/media/moex-portfolio/trading.png" class="half" loading="lazy" decoding="async" alt="Заявка на покупку"><img src="assets/media/moex-portfolio/profile.png" class="half" loading="lazy" decoding="async" alt="Профиль"></div>
        <p>Портфолио под вакансию «Вайбкод-разработчик» Московской биржи: восемь full-stack проектов на React 19 и Fastify — кабинет с реальными сделками и пополнением, WebSocket-терминал котировок, платежи с идемпотентностью, админка с RBAC, SSR-лендинг, GraphQL-витрина, калькулятор доходности и дизайн-система в стиле MOEX. Своё правило ESLint «один выход из функции», общий UI-кит, 15 тестов и сборка всех восьми приложений.</p>
        <div class="tag">React 19 · TypeScript · Fastify · GraphQL · WebSocket · SSR · ESLint single-exit</div>
        <div class="links"><a href="https://github.com/kepanasyuke/moex-vibe-portfolio" target="_blank" rel="noopener">Код</a></div>
      </article>
`;

const anchor = '<div class="grid" id="grid">';
if (!html.includes(anchor)) {
  throw new Error("grid anchor not found");
}
html = html.replace(anchor, `${anchor}\n${card}`);

html = html.replace('<button class="chip" aria-pressed="true" data-cat="all">Все 22</button>', '<button class="chip" aria-pressed="true" data-cat="all">Все 23</button>');
html = html.replace("<b>22</b><span>репозитория на GitHub</span>", "<b>23</b><span>репозитория на GitHub</span>");
html = html.replace("Двадцать два проекта с", "Двадцать три проекта с");

fs.writeFileSync(indexPath, html);

const manifestPath = path.join(site, "assets/media-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest["moex-portfolio"] = ["overview.png", "trading.png", "profile.png"];
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log("card added, media copied, counts updated");
console.log("cards:", (html.match(/<article class="card"/g) ?? []).length);
