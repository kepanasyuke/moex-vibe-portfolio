const ICONS = {
  gauge: (
    <>
      <path d="M4 18a8 8 0 1 1 16 0" />
      <path d="M12 18l3.6-4.8" />
      <circle cx="12" cy="18" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  exchange: (
    <>
      <path d="M4 9h13M13.5 5.5L17.5 9l-4 3.5" />
      <path d="M20 15H7M10.5 11.5L6.5 15l4 3.5" />
    </>
  ),
  pie: (
    <>
      <path d="M20.5 12a8.5 8.5 0 1 1-8.5-8.5V12z" />
      <path d="M12 3.5V12h8.5" opacity="0.45" />
    </>
  ),
  history: (
    <>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.9-6.4" />
      <path d="M3 4.8v4.2h4.2" />
      <path d="M12 8.5v4l3 1.8" />
    </>
  ),
  bell: (
    <>
      <path d="M6 10a6 6 0 0 1 12 0c0 3.5 1.4 5.2 1.4 5.2H4.6S6 13.5 6 10z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.4" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9.2" cy="8.5" r="3.2" />
      <path d="M3 19.2a6.2 6.2 0 0 1 12.4 0" />
      <path d="M16.2 5.9a3.2 3.2 0 0 1 0 6" />
      <path d="M17.6 13.6a6.2 6.2 0 0 1 3.9 5.6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7.5 3v6.2c0 4.6-3.2 7.6-7.5 9-4.3-1.4-7.5-4.4-7.5-9V6z" />
      <path d="M9 12l2.2 2.2L15.4 10" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h4" />
    </>
  ),
  wallet: (
    <>
      <path d="M3.5 8.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
      <path d="M3.5 10.5h17" />
      <path d="M16.2 14.4h1.3" />
    </>
  ),
  activity: (
    <>
      <path d="M3 17l4.5-5 3.2 3.2 4-5.4L20.5 14" />
      <path d="M3 20.5h18" opacity="0.45" />
    </>
  ),
  branch: (
    <>
      <circle cx="6.5" cy="5.8" r="2.2" />
      <circle cx="6.5" cy="18.2" r="2.2" />
      <circle cx="17.8" cy="12" r="2.2" />
      <path d="M8.4 7l7.2 3.8M8.4 17l7.2-3.8M6.5 8v8" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19.5V13M9.5 19.5V8.5M15 19.5v-4.5M20 19.5V6" />
      <path d="M2.5 20.5h19" opacity="0.45" />
    </>
  ),
  layout: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M9.5 9v11" />
    </>
  ),
  percent: (
    <>
      <path d="M8.5 15.5l7-7" />
      <circle cx="7.8" cy="7.8" r="1.7" />
      <circle cx="16.2" cy="16.2" r="1.7" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3.6s6.4 6.2 6.4 10.1a6.4 6.4 0 0 1-12.8 0C5.6 9.8 12 3.6 12 3.6z" />
      <path d="M9.4 14.6a2.6 2.6 0 0 0 2.6 2.6" opacity="0.45" />
    </>
  ),
  doc: (
    <>
      <path d="M6.5 3.5h7L19 9v11.5H6.5z" />
      <path d="M13.4 3.5V9H19" />
      <path d="M9.5 13h6M9.5 16.4h4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.2" />
      <path d="M20 20l-4.4-4.4" />
    </>
  ),
  filter: (
    <>
      <path d="M4 5h16l-6.2 7.4V19l-3.6-2v-4.6z" />
    </>
  ),
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  minus: <path d="M5.5 12h13" />,
  check: <path d="M4.5 12.5l4.8 4.8L19.5 7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  chevronDown: <path d="M6.5 9.5L12 15l5.5-5.5" />,
  chevronUp: <path d="M6.5 14.5L12 9l5.5 5.5" />,
  chevronRight: <path d="M9.5 6.5L15 12l-5.5 5.5" />,
  chevronLeft: <path d="M14.5 6.5L9 12l5.5 5.5" />,
  arrowRight: <path d="M4 12h15M13.5 6.5L19 12l-5.5 5.5" />,
  arrowUp: <path d="M12 19.5V5M6.5 10.5L12 5l5.5 5.5" />,
  arrowDown: <path d="M12 4.5V19M6.5 13.5L12 19l5.5-5.5" />,
  refresh: (
    <>
      <path d="M19.6 12a7.6 7.6 0 1 1-2.3-5.4" />
      <path d="M19.6 4v4.6H15" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v10.4M8 10.6l4 4 4-4" />
      <path d="M4.5 19.5h15" />
    </>
  ),
  external: (
    <>
      <path d="M14.5 4.5H20V10" />
      <path d="M19.6 4.4L11 13" />
      <path d="M18 14.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M8 3v4M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  ruble: (
    <>
      <path d="M9 20.5V4.5h4.4a4.5 4.5 0 0 1 0 9H6.8" />
      <path d="M7 17.6h9" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  dots: (
    <>
      <circle cx="5.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.8" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4.4l8.6 15.1H3.4z" />
      <path d="M12 9.6v4.6" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4.5h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-4" />
      <path d="M4 12h10M10.6 8.4L14.2 12l-3.6 3.6" />
    </>
  ),
  settings: (
    <>
      <path d="M4 8h8.6M17.4 8H20M4 16h2.6M11.4 16H20" />
      <circle cx="15" cy="8" r="2.2" />
      <circle cx="9" cy="16" r="2.2" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3.6 7.2l8.4 5.9 8.4-5.9" />
    </>
  ),
  eye: (
    <>
      <path d="M2.6 12S6.1 5.6 12 5.6 21.4 12 21.4 12 17.9 18.4 12 18.4 2.6 12 2.6 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  star: (
    <path d="M12 3.6l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 10l6.1-.9z" />
  ),
  bolt: <path d="M13.2 3L5.4 14h4.9l-1.3 7 8.2-11.2h-5z" />,
} as const;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export const Icon = ({
  name,
  size = 18,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) => (
  <svg
    className={className ? `icon ${className}` : "icon"}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {ICONS[name]}
  </svg>
);
