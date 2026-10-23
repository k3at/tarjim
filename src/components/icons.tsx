import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "arrow-left"
  | "arrow-right"
  | "arrow-up"
  | "swap"
  | "copy"
  | "check"
  | "download"
  | "upload"
  | "file"
  | "file-text"
  | "x"
  | "globe"
  | "sparkles"
  | "shield"
  | "zap"
  | "languages"
  | "lock"
  | "chevron-down"
  | "search"
  | "menu"
  | "close"
  | "sun"
  | "moon"
  | "speaker"
  | "trash"
  | "external"
  | "info"
  | "alert"
  | "loader"
  | "wand"
  | "clock"
  | "layers"
  | "cloud-off"
  | "check-circle"
  | "text"
  | "document"
  | "presentation"
  | "table"
  | "pdf"
  | "scan"
  | "mail"
  | "keyboard"
  | "refresh"
  | "play"
  | "star"
  | "plus"
  | "book"
  | "feather"
  | "code"
  | "settings"
  | "subtitles"
  | "server"
  | "mouse-pointer";

const icons: Record<IconName, ReactNode> = {
  "arrow-left": <path d="M19 12H5m0 0 6-6m-6 6 6 6" />,
  "arrow-right": <path d="M5 12h14m0 0-6-6m6 6-6 6" />,
  "arrow-up": <path d="M12 19V5m0 0-6 6m6-6 6 6" />,
  swap: (
    <>
      <path d="M7 7h11l-3-3m3 3-3 3" />
      <path d="M17 17H6l3 3m-3-3 3-3" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </>
  ),
  check: <path d="m5 12 4.5 4.5L19 6.5" />,
  download: <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" />,
  upload: <path d="M12 15V4m0 0 4 4m-4-4L8 8M5 20h14" />,
  file: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
    </>
  ),
  "file-text": (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
      <path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5c0 4.4 2.9 8.4 7 10 4.1-1.6 7-5.6 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  zap: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
  languages: (
    <>
      <path d="M4 5h9M8.5 5v2c0 3.5-1.6 6.3-4.5 8" />
      <path d="M6 10c1.8 2.3 4 3.8 6.5 4.6M13 21l4-11 4 11M14.5 17h5" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />,
  speaker: (
    <>
      <path d="M4 10v4h3l5 4V6L7 10H4Z" />
      <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 13h10l1-13M10 11v5M14 11v5" />
    </>
  ),
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3 2.8 19a1.5 1.5 0 0 0 1.3 2h15.8a1.5 1.5 0 0 0 1.3-2L12 3Z" />
      <path d="M12 9v5M12 18h.01" />
    </>
  ),
  loader: <path d="M12 3a9 9 0 1 0 9 9" />,
  wand: (
    <>
      <path d="m4 20 11-11M13 5l1-2 1 2 2 1-2 1-1 2-1-2-2-1 2-1ZM19 11l.7-1.4L21 9l-1.3-.6L19 7l-.7 1.4L17 9l1.3.6L19 11Z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5M3 17.5l9 5 9-5" />
    </>
  ),
  "cloud-off": (
    <>
      <path d="M6.5 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 17 8.3a4 4 0 0 1 1.8 7.3M3 3l18 18" />
    </>
  ),
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </>
  ),
  text: <path d="M4 6h16M4 12h10M4 18h13" />,
  document: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5M8 13h8M8 17h6" />
    </>
  ),
  presentation: (
    <>
      <path d="M3 4h18v12H3zM12 16v4M8 22l4-2 4 2" />
      <path d="M7 8h6M7 11h4" />
    </>
  ),
  table: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M9 10v10M15 10v10" />
    </>
  ),
  pdf: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
      <path d="M8 17v-3h1.2a1.4 1.4 0 0 1 0 2.8H8M13 17v-3h1a1.5 1.5 0 0 1 0 3h-1Z" />
    </>
  ),
  scan: (
    <>
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
      <path d="M7 12h10" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  keyboard: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01M9 14h6" />
    </>
  ),
  refresh: <path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" />,
  play: <path d="m8 5 11 7-11 7V5Z" />,
  star: <path d="m12 3 2.7 5.6 6.2.9-4.5 4.4 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.5-4.4 6.2-.9L12 3Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  book: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2V5Z" />
      <path d="M4 17h15M8 7h7" />
    </>
  ),
  feather: (
    <>
      <path d="M20 4c-2-2-6-1-8 1L5 12v5h5l7-7c2-2 3-6 3-6Z" />
      <path d="M5 19 3 21M13 7l4 4" />
    </>
  ),
  code: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.7a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 2.7h4l.4-2.7a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" />
    </>
  ),
  subtitles: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M6 12h4M14 12h4M6 15.5h7M16 15.5h2" />
    </>
  ),
  server: (
    <>
      <rect x="3" y="3" width="18" height="7" rx="2" />
      <rect x="3" y="14" width="18" height="7" rx="2" />
      <path d="M7 6.5h.01M7 17.5h.01" />
    </>
  ),
  "mouse-pointer": <path d="m5 3 5.5 15 2.3-5.7 5.7-2.3L5 3Z" />,
};

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

export function Icon({ name, className = "size-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {icons[name]}
    </svg>
  );
}
