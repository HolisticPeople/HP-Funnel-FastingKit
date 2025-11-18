import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Mail, User } from "lucide-react";
import { getOrderSummary, resolveOrderByPi, type OrderSummary } from "@/api/bridge";
import { KIT_DISCOUNT, UPSELL_DISCOUNT, basicKitProducts, enhancementProducts, postPurchaseProducts } from "@/data/products";
import { KIT_BASE, ENHANCEMENTS, UPSELL_PRODUCTS } from "@/data/wooMap";

export default function ThankYou() {
  const [params] = useSearchParams();
  const orderIdParam = params.get("order_id");
  const piIdParam = params.get("pi_id");
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [orderNumber, setOrderNumber] = useState<string>("pending");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      // Determine order id (direct param or resolve by pi)
      let oid = orderIdParam ? parseInt(orderIdParam, 10) : 0;
      if (!oid && piIdParam) {
        for (let i = 0; i < 30 && !cancelled; i++) {
          try {
            const r = await resolveOrderByPi(piIdParam);
            if (r && r.ok && r.order_id) { oid = r.order_id; break; }
          } catch {}
          await new Promise(res => setTimeout(res, 1000));
        }
      }
      if (!oid || cancelled) return;
      try {
        const s = await getOrderSummary(oid);
        if (!cancelled && s && s.ok) {
          setSummary(s);
          setOrderNumber(s.order_number || String(s.order_id));
        }
      } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, [orderIdParam, piIdParam]);

  // Build SKU->original price map from product catalogs
  const skuPriceMap: Record<string, number> = (() => {
    const map: Record<string, number> = {};
    // base kit
    KIT_BASE.forEach((k) => {
      const prod = basicKitProducts.find(p => p.id === k.key);
      if (prod && k.sku) map[k.sku] = prod.price;
    });
    // enhancements (10% group)
    Object.entries(ENHANCEMENTS).forEach(([key, def]) => {
      const prod = enhancementProducts.find(p => p.id === key);
      if (prod && def.sku) map[def.sku] = prod.price;
    });
    // upsell (15% group)
    Object.entries(UPSELL_PRODUCTS).forEach(([key, def]) => {
      const prod = postPurchaseProducts.find(p => p.id === key);
      if (prod && def.sku) map[def.sku] = prod.price;
    });
    return map;
  })();

  const isUpsellSku = (sku?: string) => {
    if (!sku) return false;
    return !!Object.values(UPSELL_PRODUCTS).find((v) => v.sku === sku);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/10 p-8">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-20 h-20 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Order Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Thank you for your purchase
          </p>
          <Badge variant="secondary" className="text-base px-4 py-2">
            Order #{orderNumber}
          </Badge>
        </div>

        <Card className="p-8 mb-6 bg-background/80 backdrop-blur-lg border-2 border-primary/20 shadow-xl animate-scale-in">
          <h2 className="text-2xl font-semibold text-primary mb-6">Order Summary</h2>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary?.items?.map((item, idx) => {
                // Determine original and discounted unit prices
                const msrp = (item.sku && skuPriceMap[item.sku]) ? skuPriceMap[item.sku] : item.price;
                const discountRate = isUpsellSku(item.sku) ? UPSELL_DISCOUNT : KIT_DISCOUNT;
                const unitAfter = +(msrp * (1 - discountRate));
                return (
                <TableRow key={idx}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt={item.name} width={40} height={40} className="rounded bg-white" />}
                      <span>{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{item.qty}</TableCell>
                  <TableCell className="text-right">
                    <span className="line-through opacity-70 mr-2">${msrp.toFixed(2)}</span>
                    <span>${unitAfter.toFixed(2)}</span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${(unitAfter * item.qty).toFixed(2)}
                  </TableCell>
                </TableRow>
              )})}
              <TableRow className="border-t-2">
                <TableCell colSpan={4} className="text-right font-semibold">Subtotal:</TableCell>
                <TableCell className="text-right font-bold">${summary?.subtotal.toFixed(2) || '0.00'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} className="text-right text-green-600 font-semibold">Total Savings:</TableCell>
                <TableCell className="text-right text-green-600 font-bold">
                  -${summary?.items_discount.toFixed(2) || '0.00'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} className="text-right font-semibold">Shipping:</TableCell>
                <TableCell className="text-right font-bold">${summary?.shipping_total.toFixed(2) || '0.00'}</TableCell>
              </TableRow>
              {typeof summary?.points_redeemed === 'number' && summary.points_redeemed > 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-right text-emerald-700 font-semibold">Points Redeemed:</TableCell>
                  <TableCell className="text-right text-emerald-700 font-bold">{summary.points_redeemed} pts</TableCell>
                </TableRow>
              )}
              {summary && Math.abs(summary.fees_total) > 0.001 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-semibold">Fees / Adjustments:</TableCell>
                  <TableCell className="text-right font-bold">${summary.fees_total.toFixed(2)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6 mb-6 bg-background/80 backdrop-blur-lg border border-primary/20">
          <div className="flex items-start gap-3 mb-4">
            <Mail className="w-5 h-5 text-primary mt-1" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Shipping Confirmation</h3>
              <p className="text-sm text-muted-foreground">
                You will receive an email with tracking information once your order is shipped.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-primary mt-1" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Track Your Order</h3>
              <p className="text-sm text-muted-foreground">
                View your order details and track shipping in your{" "}
                <a 
                  href="https://holisticpeople.com/my-account" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  HolisticPeople account
                </a>
              </p>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <a
            href="https://holisticpeople.com"
            className="inline-block px-8 py-4 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Continue Shopping at HolisticPeople
          </a>
        </div>
      </div>
    </div>
  );
}


