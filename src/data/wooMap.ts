// WooCommerce identifiers used by the funnel to build Bridge items.
// Prefer SKUs so we can change product IDs without touching the funnel.
// TODO: Replace placeholder SKUs with your real store SKUs or set product_id.
export const WOO_IDS = {
  // Fallback old single-kit product (kept for backward compatibility)
  fastingKit: 123764,
};

export const KIT_BASE = [
  // Basic Kit Includes
  { key: "magnesium",   sku: "ME-Mgn-8", product_id: undefined },
  { key: "serraxym",    sku: "USE-264", product_id: undefined },
  { key: "fastingElixir", sku: "ATT-OS-36", product_id: undefined },
] as const;

export const ENHANCEMENTS: Record<string, { sku?: string; product_id?: number }> = {
  iodine:  { sku: "HG-Illum05", product_id: undefined },
  ncd:     { sku: "WA-6000", product_id: undefined },
  radneut: { sku: "HG-RadNeut1", product_id: undefined },
};

// Optional: Map upsell kit products if you want individual line items on the parent order.
// Leave sku/product_id undefined to fall back to a single fee on the order.
export const UPSELL_PRODUCTS: Record<string, { sku?: string; product_id?: number }> = {
  digestxym: { sku: "USE-260", product_id: undefined },
  triphala:  { sku: "OI-trip90", product_id: undefined },
};

export type KitSelection = { extras: string[]; twoPerson: boolean };

export function loadKitSelection(): KitSelection {
  try {
    const raw = localStorage.getItem("hp_kit_config");
    if (!raw) return { extras: [], twoPerson: false };
    const d = JSON.parse(raw);
    return {
      extras: Array.isArray(d?.extras) ? d.extras : [],
      twoPerson: !!d?.twoPerson,
    };
  } catch {
    return { extras: [], twoPerson: false };
  }
}

export function saveKitSelection(sel: KitSelection) {
  try { localStorage.setItem("hp_kit_config", JSON.stringify(sel)); } catch {}
}

