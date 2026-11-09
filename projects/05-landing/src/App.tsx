import { Alert, Button, Input, MarketingFooter, MarketingHeader, StepMark } from "@ui";
import { useLeadForm } from "./hooks.ts";

const STATS = [
  { value: "34", label: "года бирже" },
  { value: "3 000+", label: "человек в #moexteam" },
  { value: "12", label: "инструментов в демо" },
  { value: "99,99 %", label: "доступность торгов" },
];

const MARKETS = [
  {
    title: "Фондовый рынок",
    text: "Акции, облигации и паи. Ликвидность, прозрачные цены и расчёты в режиме T+1.",
    meta: "MOEX · T+1",
  },
  {
    title: "Срочный рынок",
    text: "Фьючерсы и опционы на индексы, валюту и товары. Хеджирование и спекуляции.",
    meta: "FORTS",
  },
  {
    title: "Валютный рынок",
    text: "Спот и свопы, биржевой курс как ориентир для всей экономики.",
    meta: "USD/CNY",
  },
  {
    title: "Денежный рынок",
    text: "РЕПО и депозиты: короткие деньги для банков и корпораций.",
    meta: "REPO",
  },
];

const scrollToLead = () => {
  document.getElementById("lead")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const LeadForm = () => {
  const lead = useLeadForm();

  return (
    <form className="landing__form" onSubmit={lead.submit}>
      <Input
        id="name"
        label="Как вас зовут"
        value={lead.form.name}
        onChange={(event) => lead.patch({ name: event.target.value })}
        required
      />
      <Input
        id="contact"
        label="Телефон или e-mail"
        value={lead.form.contact}
        onChange={(event) => lead.patch({ contact: event.target.value })}
        required
      />
      <Input
        id="company"
        label="Компания"
        value={lead.form.company}
        onChange={(event) => lead.patch({ company: event.target.value })}
      />
      <Button type="submit" size="lg">
        Обсудить подключение
      </Button>
      {lead.status === "sent" && <Alert tone="success" title="Заявка отправлена">Мы свяжемся с вами в течение рабочего дня.</Alert>}
      {lead.status === "error" && <Alert tone="warn" title="Не удалось отправить">{lead.error}</Alert>}
      <p className="landing__form-note">
        Демонстрационная форма: данные хранятся в памяти сервера и не передаются третьим лицам.
      </p>
    </form>
  );
};

export const App = () => (
  <div className="landing">
    <MarketingHeader onCta={scrollToLead} />
    <section className="landing__hero">
      <div className="container landing__hero-inner">
        <div className="landing__hero-text">
          <span className="landing__eyebrow">ПАО Московская биржа</span>
          <h1 className="display display-xl">Инвестиции начинаются здесь</h1>
          <p className="landing__lead">
            Торговые платформы, депозитарий и сервисы, которым доверяют миллионы инвесторов и тысячи компаний.
            Миллионы транзакций в минуту — без задержек и перебоев.
          </p>
          <div className="landing__hero-actions">
            <Button size="lg" onClick={scrollToLead}>Открыть счёт</Button>
            <Button size="lg" variant="ghost" onClick={scrollToLead}>Стать партнёром</Button>
          </div>
        </div>
        <div className="landing__hero-mark" aria-hidden="true">
          <StepMark />
          <span className="landing__hero-year">1992</span>
          <span className="landing__hero-caption">с нуля создали рынок инвестиций</span>
        </div>
      </div>
      <div className="container">
        <dl className="landing__stats">
          {STATS.map((stat) => (
            <div key={stat.label} className="landing__stat">
              <dt className="landing__stat-value">{stat.value}</dt>
              <dd className="landing__stat-label">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>

    <section className="landing__section" id="markets">
      <div className="container">
        <div className="landing__section-head">
          <span className="eyebrow">Рынки</span>
          <h2 className="display display-lg">Одна инфраструктура — четыре рынка</h2>
        </div>
        <div className="landing__markets">
          {MARKETS.map((market) => (
            <article key={market.title} className="landing__market">
              <span className="landing__market-meta">{market.meta}</span>
              <h3 className="landing__market-title">{market.title}</h3>
              <p>{market.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="landing__section landing__section--dark" id="numbers">
      <div className="container landing__numbers">
        <div>
          <span className="eyebrow">Биржа в цифрах</span>
          <h2 className="display display-lg">Инфраструктура, которая держит рынок</h2>
          <p className="landing__numbers-text">
            Мы храним в депозитарии цифровые записи о каждом активе, следим за соответствием сделок правилам торгов
            и развиваем внебиржевые сервисы для инвесторов, банков и корпораций.
          </p>
        </div>
        <ul className="landing__numbers-list">
          <li><strong>Миллионы</strong> транзакций в минуту</li>
          <li><strong>Ежедневно</strong> расчёты по всем рынкам</li>
          <li><strong>24/7</strong> мониторинг инфраструктуры</li>
          <li><strong>#moexteam</strong> более 3 000 человек</li>
        </ul>
      </div>
    </section>

    <section className="landing__section" id="career">
      <div className="container landing__career">
        <div>
          <span className="eyebrow">Карьера</span>
          <h2 className="display display-md">Инженерная культура, а не buzzwords</h2>
          <p>
            Код-ревью, тесты, безопасность и осознанная работа с легаси. AI-инструменты — ускорители, а не замена
            инженерному мышлению.
          </p>
        </div>
        <ul className="landing__career-list">
          <li>React, TypeScript, SPA и SSR</li>
          <li>REST, GraphQL, WebSocket и авторизация</li>
          <li>Дизайн-система и доступность</li>
        </ul>
      </div>
    </section>

    <section className="landing__section landing__section--lead" id="lead">
      <div className="container landing__lead">
        <div>
          <span className="eyebrow">Подключение</span>
          <h2 className="display display-lg">Станьте частью рынка</h2>
          <p>
            Оставьте контакты — расскажем о подключении к торговой инфраструктуре, тарифах и сервисах для
            брокеров и корпораций.
          </p>
        </div>
        <LeadForm />
      </div>
    </section>

    <MarketingFooter />
  </div>
);
