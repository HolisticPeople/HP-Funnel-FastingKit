export const WP_BASE =
  (import.meta as any).env?.VITE_WP_BASE ||
  "https://env-holisticpeoplecom-hpdevplus.kinsta.cloud";

export const FUNNEL_API_BASE =
  (import.meta as any).env?.VITE_FUNNEL_API_BASE ||
  `${WP_BASE.replace(/\/$/, "")}/wp-json/hp-funnel/v1`;

export const APP_ORIGIN =
  (import.meta as any).env?.VITE_APP_ORIGIN || "http://localhost:5174";


