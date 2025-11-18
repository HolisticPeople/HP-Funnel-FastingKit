import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { postPurchaseProducts, calculateOffFastKitPrice } from "@/data/products";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles } from "lucide-react";
function assetUrl(file: string): string {
  return new URL(`/img/thumbs/${file}`, (import.meta as any).env.BASE_URL || "/").toString();
}
const magnesiumImg = assetUrl("magnesium.webp");
const fastingElixirImg = assetUrl("fasting-elixir.webp");
const serraxymImg = assetUrl("serraxym.webp");
const illumodineImg = assetUrl("illumodine.webp");
const ncdImg = assetUrl("ncd.webp");
const radneutImg = assetUrl("radneut.webp");
const digestxymImg = assetUrl("digestxym.webp");
const triphalaImg = assetUrl("triphala.webp");
import { chargeUpsell, type BridgeItem } from "@/api/bridge";
import { UPSELL_PRODUCTS } from "@/data/wooMap";
import { FUNNEL_API_BASE } from "@/config";

const productImages: Record<string, string> = {
  magnesium: magnesiumImg,
  "fasting-elixir": fastingElixirImg,
  serraxym: serraxymImg,
  iodine: illumodineImg,
  ncd: ncdImg,
  radneut: radneutImg,
  digestxym: digestxymImg,
  triphala: triphalaImg,
};

export default function PostPurchaseUpsell() {
  const [params] = useSearchParams();
  const [orderId, setOrderId] = useState<number>(Number(params.get("order_id") || 0));
  const piId = params.get("pi_id") || "";
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { total, originalTotal, savings } = calculateOffFastKitPrice();

  // Fallback: resolve order_id by payment intent id if needed (in case webhook is slightly delayed)
  useEffect(() => {
    let stopped = false;
    async function resolveOrder() {
      if (orderId || !piId) return;
      for (let i = 0; i < 30 && !stopped; i++) {
        try {
          const res = await fetch(
            `${FUNNEL_API_BASE}/orders/resolve?pi_id=${encodeURIComponent(piId)}`,
            { headers: { Accept: "application/json" } }
          );
          if (res.ok) {
            const j = await res.json();
            if (j && j.order_id) { setOrderId(Number(j.order_id)); return; }
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    resolveOrder();
    return () => { stopped = true; };
  }, [orderId, piId]);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      if (!orderId) throw new Error("Order not ready yet");
      // Build items from upsell map if configured; otherwise rely on fee fallback server-side
      const items: BridgeItem[] = Object.keys(UPSELL_PRODUCTS).map((key) => {
        const m = (UPSELL_PRODUCTS as any)[key] || {};
        const it: any = { qty: 1 };
        if (m.product_id) it.product_id = m.product_id;
        if (m.sku) it.sku = m.sku;
        return it;
      }).filter((it) => it.product_id || it.sku);

      await chargeUpsell({
        parent_order_id: orderId,
        items: items.length ? items : undefined,
        amount_override: total,
        funnel_name: "Fasting Kit",
        fee_label: "Off The Fast Kit",
      });
      navigate("/thank-you", { replace: true });
    } catch (e: any) {
      alert(e?.message || "Upsell charge failed");
      setIsProcessing(false);
    }
  };

  const handleDecline = () => {
    navigate("/thank-you", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/10">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-8 animate-fade-in">
          <Badge className="mb-4 px-4 py-2 text-lg bg-accent text-accent-foreground">
            <Sparkles className="w-5 h-5 mr-2" />
            Special One-Time Offer
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Wait! Complete Your Journey
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Support your transition back to normal eating with our exclusive "Off The Fast Kit"
          </p>
        </div>

        <Card className="p-8 mb-8 bg-background/80 backdrop-blur-lg border-2 border-primary/20 shadow-2xl animate-scale-in">
          <div className="flex items-center justify-center gap-2 mb-6">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <p className="text-lg font-semibold text-foreground">
              Your fasting kit order is confirmed!
            </p>
          </div>

          <div className="bg-gradient-to-r from-accent/20 to-primary/20 p-6 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-2xl font-bold text-primary">Limited Time Offer</span>
              <div className="text-right">
                <div className="text-sm text-muted-foreground line-through">
                  ${originalTotal.toFixed(2)}
                </div>
                <div className="text-3xl font-bold text-accent">
                  ${total.toFixed(2)}
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-600 text-white">
              Save ${savings.toFixed(2)} (15% OFF)
            </Badge>
          </div>

        <h2 className="text-2xl font-semibold text-primary mb-4">
            Off The Fast Kit Includes:
          </h2>

          <div className="space-y-4 mb-8">
            {postPurchaseProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-all"
              >
                {product.image && (
                  <img
                    src={productImages[product.image]}
                    alt={product.name}
                    className="w-20 h-20 object-contain rounded-lg bg-white p-2"
                    width={80}
                    height={80}
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {product.description}
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    {product.dosage}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground line-through">
                    ${product.price.toFixed(2)}
                  </div>
                  <div className="font-semibold text-accent">
                    ${(product.price * 0.85).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-foreground/90 mb-2">
              <strong>Why you need this:</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              After your 7-day juice fast, your digestive system needs gentle support to transition back to solid foods. 
              These supplements help restore digestive function and ensure a smooth, comfortable transition.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="flex-1 text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
              onClick={handleAccept}
              disabled={isProcessing || !orderId}
            >
              {isProcessing ? "Processing..." : "Yes! Add To My Order"}
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="flex-1 text-lg py-6"
              onClick={handleDecline}
              disabled={isProcessing}
            >
              No Thanks, Continue
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4">
            This offer is only available on this page. Your card will be charged ${total.toFixed(2)} if you accept.
          </p>
        </Card>
      </div>
    </div>
  );
}


