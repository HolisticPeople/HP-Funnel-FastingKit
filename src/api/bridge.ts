import { APP_ORIGIN, FUNNEL_API_BASE, WP_BASE } from "@/config";

export type BridgeAddress = {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  phone?: string;
  email?: string;
};

export type BridgeItem = {
  product_id?: number;
  sku?: string;
  variation_id?: number;
  qty: number;
};

function parsePossiblyPrefixedJson<T>(raw: string): T {
  // Some environments echo PHP warnings before valid JSON. Try to recover.
  try {
    return JSON.parse(raw) as T;
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1)) as T;
      } catch {
        // fallthrough
      }
    }
    throw new Error("Invalid JSON response");
  }
}

async function post<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${FUNNEL_API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    credentials: "omit",
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Bridge ${path} failed: ${res.status} ${err}`);
  }
  const txt = await res.text();
  return parsePossiblyPrefixedJson<T>(txt);
}

async function get<T>(pathWithQuery: string): Promise<T> {
  const res = await fetch(`${FUNNEL_API_BASE}${pathWithQuery}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    credentials: "omit",
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Bridge ${pathWithQuery} failed: ${res.status} ${err}`);
  }
  const txt = await res.text();
  return parsePossiblyPrefixedJson<T>(txt);
}

export async function lookupCustomer(email: string): Promise<{
  user_id: number;
  default_billing: BridgeAddress;
  default_shipping: BridgeAddress;
  points_balance: number;
}> {
  return post("/customer", { email });
}

export async function getRates(params: {
  funnel_id: string;
  address: BridgeAddress;
  items: BridgeItem[];
}): Promise<{ rates: any[] }> {
  return post("/shipstation/rates", params);
}

export async function getTotals(params: {
  funnel_id: string;
  items: BridgeItem[];
  address: BridgeAddress;
  coupon_codes?: string[];
  selected_rate?: { serviceName: string; amount: number };
  customer_email?: string;
  points_to_redeem?: number;
}): Promise<{
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  fees_total: number;
  points_discount: number;
  grand_total: number;
}> {
  return post("/totals", params);
}

export async function createIntent(params: {
  funnel_id: string;
  funnel_name: string;
  customer: { email: string; first_name?: string; last_name?: string };
  shipping_address: BridgeAddress;
  items: BridgeItem[];
  coupon_codes?: string[];
  selected_rate?: { serviceName: string; amount: number };
  points_to_redeem?: number;
}): Promise<{
  client_secret: string;
  publishable: string;
  order_draft_id: string;
  amount_cents: number;
}> {
  return post("/checkout/intent", params);
}

export function buildHostedConfirmUrl(clientSecret: string, publishable?: string, successUrl?: string): string {
  const base = WP_BASE.replace(/\/$/, "");
  // Use query-param endpoint to avoid rewrite-rule dependency:
  // https://site/?hp_fb_confirm=1&cs=CLIENT_SECRET
  const u = new URL(`${base}/`);
  u.searchParams.set("hp_fb_confirm", "1");
  u.searchParams.set("cs", clientSecret);
  if (publishable) {
    // pass publishable so hosted page can choose the right Stripe environment
    u.searchParams.set("pk", publishable);
  }
  if (successUrl) {
    // Host page expects succ as a single query value; encode to avoid breaking query string
    u.searchParams.set("succ", encodeURIComponent(successUrl));
  }
  return u.toString();
}

export async function getStatus(params: {
  funnel_id: string;
}): Promise<{ ok: boolean; environment: string; mode: string; redirect_url?: string }> {
  const url = new URL(`${FUNNEL_API_BASE}/status`);
  if (params.funnel_id) {
    url.searchParams.set("funnel_id", params.funnel_id);
  }
  return get(`${url.pathname}${url.search}`);
}

export async function chargeUpsell(params: {
  parent_order_id: number;
  items?: BridgeItem[];
  amount_override?: number;
  funnel_name?: string;
  fee_label?: string;
}): Promise<{ ok: boolean; order_id: number }> {
  return post("/upsell/charge", params);
}


