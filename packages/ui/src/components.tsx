import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useDialog } from "./hooks.ts";

export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(" ");

export const Logo = ({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) => (
  <span className={cx("logo", inverse && "logo--inverse")}>
    <span className={cx("logo__mark", compact && "logo__mark--compact")}>МОЕХ</span>
    {!compact && (
      <span className="logo__sub">
        <span>Московская</span>
        <span>биржа</span>
      </span>
    )}
  </span>
);

export const StepMark = ({ className }: { className?: string }) => (
  <svg className={cx("step-mark", className)} viewBox="0 0 96 56" role="img" aria-label="Фирменный знак Московской биржи">
    <rect x="0" y="0" width="40" height="16" fill="currentColor" />
    <rect x="24" y="16" width="40" height="16" fill="currentColor" />
    <rect x="48" y="32" width="48" height="24" fill="currentColor" />
  </svg>
);

type ButtonVariant = "primary" | "dark" | "ghost" | "quiet";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "lg";
  block?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = ({
  variant = "primary",
  size,
  block = false,
  loading = false,
  icon,
  children,
  className,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    className={cx("btn", `btn--${variant}`, size && `btn--${size}`, block && "btn--block", className)}
    disabled={disabled ?? loading}
    {...rest}
  >
    {loading && <span className="btn__spinner" aria-hidden="true" />}
    {icon}
    {children}
  </button>
);

export const Card = ({
  title,
  action,
  flush = false,
  className,
  children,
}: {
  title?: ReactNode;
  action?: ReactNode;
  flush?: boolean;
  className?: string;
  children: ReactNode;
}) => (
  <section className={cx("card", className)}>
    {(title || action) && (
      <header className="card__head">
        <div className="card__title">{title}</div>
        {action}
      </header>
    )}
    <div className={cx("card__body", flush && "card__body--flush")}>{children}</div>
  </section>
);

export const Stat = ({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "up" | "down" | "flat";
}) => (
  <div className="stat">
    <span className="stat__label">{label}</span>
    <span className={cx("stat__value", tone === "up" && "text-up", tone === "down" && "text-down")}>{value}</span>
    {hint && <span className="stat__hint">{hint}</span>}
  </div>
);

export const Badge = ({
  tone = "gray",
  children,
}: {
  tone?: "red" | "green" | "gray" | "black" | "warn" | "down";
  children: ReactNode;
}) => <span className={cx("badge", `badge--${tone}`)}>{children}</span>;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  hint?: string;
}

export const Input = ({ label, error, hint, id, className, ...rest }: InputProps) => (
  <label className="field" htmlFor={id}>
    {label && <span className="field__label">{label}</span>}
    <input id={id} className={cx("input", error && "input--invalid", className)} aria-invalid={Boolean(error)} {...rest} />
    {error && <span className="field__error">{error}</span>}
    {!error && hint && <span className="field__hint">{hint}</span>}
  </label>
);

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string | null;
  options: Array<{ value: string; label: string }>;
}

export const Select = ({ label, error, options, id, className, ...rest }: SelectProps) => (
  <label className="field" htmlFor={id}>
    {label && <span className="field__label">{label}</span>}
    <select id={id} className={cx("select", error && "input--invalid", className)} {...rest}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <span className="field__error">{error}</span>}
  </label>
);

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | null;
}

export const Textarea = ({ label, error, id, className, ...rest }: TextareaProps) => (
  <label className="field" htmlFor={id}>
    {label && <span className="field__label">{label}</span>}
    <textarea id={id} className={cx("textarea", error && "input--invalid", className)} rows={4} {...rest} />
    {error && <span className="field__error">{error}</span>}
  </label>
);

export const Checkbox = ({
  label,
  checked,
  onChange,
  name,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  name?: string;
}) => (
  <label className="checkbox">
    <input type="checkbox" name={name} checked={checked} onChange={(event) => onChange(event.target.checked)} />
    {label}
  </label>
);

export interface Column<T> {
  key: string;
  title: string;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
}

export const Table = <T,>({
  columns,
  rows,
  rowKey,
  empty,
}: {
  columns: Array<Column<T>>;
  rows: T[];
  rowKey: (row: T) => string;
  empty?: ReactNode;
}) =>
  rows.length === 0 ? (
    <>{empty ?? <EmptyState title="Пока пусто" text="Данные появятся здесь после первых операций." />}</>
  ) : (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.align === "right" ? "num" : undefined}>
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.key} className={column.align === "right" ? "num" : undefined}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

export const Tabs = ({
  items,
  value,
  onChange,
}: {
  items: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="tabs" role="tablist">
    {items.map((item) => (
      <button
        key={item.value}
        type="button"
        role="tab"
        aria-selected={item.value === value}
        className={cx("tabs__item", item.value === value && "tabs__item--active")}
        onClick={() => onChange(item.value)}
      >
        {item.label}
      </button>
    ))}
  </div>
);

export const Segmented = <T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) => (
  <div className="segmented">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        className={cx("segmented__item", option.value === value && "segmented__item--active")}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export const Spinner = () => <span className="spinner" role="status" aria-label="Загрузка" />;

export const Skeleton = ({ height = 16, width = "100%" }: { height?: number; width?: number | string }) => (
  <span className="skeleton" style={{ display: "block", height, width }} />
);

export const EmptyState = ({ title, text, action }: { title: string; text?: string; action?: ReactNode }) => (
  <div className="empty">
    <div className="empty__title">{title}</div>
    {text && <p className="empty__text">{text}</p>}
    {action}
  </div>
);

export const PageHeader = ({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) => (
  <header className="page-head">
    <div>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1 className="page-head__title">{title}</h1>
      {subtitle && <p className="page-head__sub">{subtitle}</p>}
    </div>
    {actions}
  </header>
);

export const Alert = ({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "success" | "warn";
  title: string;
  children?: ReactNode;
}) => (
  <div className={cx("alert", tone === "success" && "alert--success", tone === "warn" && "alert--warn")} role="status">
    <div className="alert__title">{title}</div>
    {children && <div className="alert__text">{children}</div>}
  </div>
);

export const Modal = ({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) => {
  const dialog = useDialog(open, onClose);

  return open ? (
    <div className="modal-backdrop" onMouseDown={dialog.onBackdrop}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal__head">
          <span className="modal__title">{title}</span>
          <Button variant="quiet" onClick={onClose} aria-label="Закрыть">
            ✕
          </Button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__foot">{footer}</footer>}
      </div>
    </div>
  ) : null;
};

export const KV = ({ k, v }: { k: string; v: ReactNode }) => (
  <div className="kv">
    <span className="kv__k">{k}</span>
    <span className="kv__v">{v}</span>
  </div>
);

export const ProgressBar = ({
  label,
  value,
  max = 100,
  suffix,
  alternate = false,
}: {
  label: string;
  value: number;
  max?: number;
  suffix?: string;
  alternate?: boolean;
}) => (
  <div className="bar">
    <div className="bar__head">
      <span>{label}</span>
      <span className="numeric">{suffix ?? `${value.toFixed(1)} %`}</span>
    </div>
    <div className="bar__track">
      <div className={cx("bar__fill", alternate && "bar__fill--alt")} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  </div>
);
