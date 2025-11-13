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

async function post<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${FUNNEL_API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: APP_ORIGIN,
    },
    body: JSON.stringify(body),
    credentials: "omit",
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Bridge ${path} failed: ${res.status} ${err}`);
  }
  return res.json() as Promise<T>;
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

export function buildHostedConfirmUrl(clientSecret: string): string {
  const base = WP_BASE.replace(/\/$/, "");
  // Use query-param endpoint to avoid rewrite-rule dependency:
  // https://site/?hp_fb_confirm=1&cs=CLIENT_SECRET
  const u = new URL(`${base}/`);
  u.searchParams.set("hp_fb_confirm", "1");
  u.searchParams.set("cs", clientSecret);
  return u.toString();
}


