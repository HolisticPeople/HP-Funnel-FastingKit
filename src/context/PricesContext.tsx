import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getPricesForSkus } from "@/api/bridge";
import { KIT_BASE, ENHANCEMENTS, UPSELL_PRODUCTS } from "@/data/wooMap";

type PricesContextType = {
  prices: Record<string, number>;
  isLoaded: boolean;
};

const PricesContext = createContext<PricesContextType>({ prices: {}, isLoaded: false });

export const usePrices = () => useContext(PricesContext);

export const PricesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  // Gather all potential SKUs once
  const allSkus = useMemo(() => {
    const set = new Set<string>();
    KIT_BASE.forEach(k => { if (k.sku) set.add(k.sku); });
    Object.values(ENHANCEMENTS).forEach(v => { if (v.sku) set.add(v.sku); });
    Object.values(UPSELL_PRODUCTS).forEach(v => { if (v.sku) set.add(v.sku); });
    return Array.from(set);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (allSkus.length) {
          const map = await getPricesForSkus(allSkus);
          if (!cancelled && map) setPrices(map);
        }
      } catch {
        // swallow
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [allSkus]);

  return (
    <PricesContext.Provider value={{ prices, isLoaded: loaded }}>
      {children}
    </PricesContext.Provider>
  );
};


