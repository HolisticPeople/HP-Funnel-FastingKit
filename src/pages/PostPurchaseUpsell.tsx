import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { postPurchaseProducts, calculateOffFastKitPrice } from "@/data/products";
import { chargeUpsell } from "@/api/bridge";
import { FUNNEL_API_BASE } from "@/config";

export default function PostPurchaseUpsell() {
  const [params] = useSearchParams();
  const [orderId, setOrderId] = useState<number>(Number(params.get("order_id") || 0));
  const piId = params.get("pi_id") || "";
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const totals = useMemo(() => calculateOffFastKitPrice(), []);

  useEffect(() => {
    // If order_id is missing but we have pi_id, try resolving on the client.
    let stopped = false;
    async function resolveOrder() {
      if (orderId || !piId) return;
      for (let i = 0; i < 30 && !stopped; i++) {
        try {
          const res = await fetch(`${FUNNEL_API_BASE}/orders/resolve?pi_id=${encodeURIComponent(piId)}`, {
            headers: { Accept: "application/json" },
          });
          if (res.ok) {
            const j = await res.json();
            if (j && j.order_id) {
              setOrderId(Number(j.order_id));
              return;
            }
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    resolveOrder();
    return () => {
      stopped = true;
    };
  }, [orderId, piId]);

  const accept = async () => {
    if (!orderId) return;
    try {
      setProcessing(true);
      await chargeUpsell({
        parent_order_id: orderId,
        amount_override: totals.total,
        funnel_name: "Fasting Kit",
        fee_label: "Off The Fast Kit",
      });
      navigate("/thank-you", { replace: true });
    } catch (e: any) {
      alert(e?.message || "Upsell charge failed");
      setProcessing(false);
    }
  };

  const decline = () => navigate("/thank-you", { replace: true });

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            One‑time Offer: Off‑The‑Fast Kit
          </h1>
          <p className="text-muted-foreground">
            Smooth transition back to meals with targeted digestive support
          </p>
        </div>

        <Card className="p-6 mb-8 bg-background/60 backdrop-blur">
          <div className="grid gap-3">
            {postPurchaseProducts.map((p) => (
              <div key={p.id} className="flex justify-between">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{p.dosage}</div>
                </div>
                <div className="text-sm text-muted-foreground">${p.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground line-through">
                ${totals.originalTotal.toFixed(2)}
              </div>
              <div className="text-2xl font-bold text-accent">
                ${totals.total.toFixed(2)} <span className="text-sm text-muted-foreground">(Save ${totals.savings.toFixed(2)})</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button className="flex-1" size="lg" onClick={accept} disabled={processing || !orderId}>
            {processing ? "Processing..." : "Yes, add to my order"}
          </Button>
          <Button className="flex-1" size="lg" variant="ghost" onClick={decline} disabled={processing}>
            No thanks
          </Button>
        </div>
      </div>
    </div>
  );
}


