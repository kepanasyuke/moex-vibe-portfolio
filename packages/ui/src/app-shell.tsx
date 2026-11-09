import type { ReactNode } from "react";
import { Button, Logo, cx } from "./components.tsx";
import { Icon } from "./icons.tsx";
import type { IconName } from "./icons.tsx";

export interface NavItem {
  key: string;
  label: string;
  hint?: string;
  icon?: IconName;
}

const initialsOf = (name: string): string =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const AppShell = ({
  product,
  nav,
  active,
  onSelect,
  user,
  onLogout,
  children,
}: {
  product: string;
  nav: NavItem[];
  active: string;
  onSelect: (key: string) => void;
  user: { name: string; role: "investor" | "admin" };
  onLogout: () => void;
  children: ReactNode;
}) => (
  <div className="shell">
    <header className="shell__top">
      <a className="shell__brand" href="/" aria-label="Московская биржа">
        <Logo compact />
      </a>
      <span className="shell__divider" />
      <span className="shell__product">{product}</span>
      <span className="grow" />
      <span className="shell__demo">демо-стенд</span>
      <div className="shell__user">
        <span className="avatar">{initialsOf(user.name)}</span>
        <span className="shell__user-text">
          <span className="shell__user-name">{user.name}</span>
          <span className="shell__user-role">{user.role === "admin" ? "Администратор" : "Инвестор"}</span>
        </span>
      </div>
      <Button variant="ghost" size="sm" onClick={onLogout} icon={<Icon name="logout" size={16} />}>
        Выйти
      </Button>
    </header>
    <div className="shell__body">
      <aside className="shell__nav" aria-label="Разделы">
        <div className="shell__nav-label">Разделы</div>
        {nav.map((item) => (
          <button
            key={item.key}
            type="button"
            className={cx("shell__nav-item", item.key === active && "shell__nav-item--active")}
            onClick={() => onSelect(item.key)}
          >
            <span className="shell__nav-main">
              {item.icon && <Icon name={item.icon} size={17} />}
              <span>{item.label}</span>
            </span>
            {item.hint && <span className="shell__nav-hint">{item.hint}</span>}
          </button>
        ))}
        <div className="shell__nav-foot">MOEX · учебный стенд</div>
      </aside>
      <main className="shell__main">{children}</main>
    </div>
  </div>
);

export const MarketingHeader = ({ onCta }: { onCta: () => void }) => (
  <header className="marketing__header">
    <div className="container marketing__header-inner">
      <a href="/" aria-label="Московская биржа">
        <Logo inverse />
      </a>
      <nav className="marketing__nav" aria-label="Основная навигация">
        <a href="#markets">Рынки</a>
        <a href="#products">Продукты</a>
        <a href="#numbers">Биржа в цифрах</a>
        <a href="#career">Карьера</a>
      </nav>
      <Button onClick={onCta}>Открыть счёт</Button>
    </div>
  </header>
);

export const MarketingFooter = () => (
  <footer className="marketing__footer">
    <div className="container">
      <div className="marketing__footer-grid">
        <div>
          <Logo inverse />
          <p className="marketing__footer-text">
            ПАО Московская биржа — крупнейший организатор торгов в России. Инвестиции начинаются здесь.
          </p>
        </div>
        <div>
          <div className="marketing__footer-title">Рынки</div>
          <a href="#markets">Фондовый</a>
          <a href="#markets">Срочный</a>
          <a href="#markets">Валютный</a>
          <a href="#markets">Денежный</a>
        </div>
        <div>
          <div className="marketing__footer-title">Компания</div>
          <a href="#numbers">О бирже</a>
          <a href="#career">Карьера</a>
          <a href="https://www.moex.com" target="_blank" rel="noreferrer">
            moex.com
          </a>
        </div>
        <div>
          <div className="marketing__footer-title">Демо</div>
          <span className="marketing__footer-note">Учебный проект. Не является офертой или инвестиционной рекомендацией.</span>
        </div>
      </div>
      <div className="marketing__footer-bottom">© 2026 Московская биржа · демонстрационный интерфейс</div>
    </div>
  </footer>
);
