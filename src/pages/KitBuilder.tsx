import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { basicKitProducts, enhancementProducts, calculateKitPrice, getDiscountedPrice } from "@/data/products";
import { saveKitSelection } from "@/data/wooMap";
import magnesiumImg from "@/assets/magnesium.png?w=160;webp;as=src";
import fastingElixirImg from "@/assets/fasting-elixir.png?w=160;webp;as=src";
import serraxymImg from "@/assets/serraxym.png?w=160;webp;as=src";
import illumodineImg from "@/assets/illumodine.png?w=160;webp;as=src";
import ncdImg from "@/assets/ncd.png?w=160;webp;as=src";
import radneutImg from "@/assets/radneut.png?w=160;webp;as=src";

const productImages: Record<string, string> = {
  magnesium: magnesiumImg,
  "fasting-elixir": fastingElixirImg,
  serraxym: serraxymImg,
  iodine: illumodineImg,
  ncd: ncdImg,
  radneut: radneutImg,
};

export default function KitBuilder() {
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [twoPerson, setTwoPerson] = useState(false);
  const navigate = useNavigate();

  const toggleExtra = (extra: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extra) ? prev.filter((e) => e !== extra) : [...prev, extra]
    );
  };

  const pricing = calculateKitPrice(selectedExtras, twoPerson);
  const basicKitPricing = calculateKitPrice([], false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/10">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <Badge className="mb-4 px-4 py-2 text-lg bg-accent text-accent-foreground">
            10% OFF All Products
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Build Your Fasting Kit
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Customize your 7-day juice fasting supplement kit
          </p>
        </div>

        <Card className="p-8 mb-8 bg-background/80 backdrop-blur-lg border-2 border-primary/20 shadow-xl animate-scale-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-primary">
              Basic Kit Includes
            </h2>
            <div className="text-right">
              <div className="text-sm text-muted-foreground line-through">
                ${basicKitPricing.originalTotal.toFixed(2)}
              </div>
              <p className="text-2xl font-bold text-accent">
                ${basicKitPricing.total.toFixed(2)}
              </p>
              <Badge variant="secondary" className="mt-1 bg-green-600 text-white text-xs">
                Save ${basicKitPricing.savings.toFixed(2)}
              </Badge>
            </div>
          </div>
          <div className="space-y-4 text-foreground">
            {basicKitProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50">
                {product.image && (
                  <img
                    src={productImages[product.image]}
                    alt={product.name}
                    className="w-16 h-16 object-contain rounded-lg bg-white p-1"
                    width={64}
                    height={64}
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                  />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {product.dosage}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-muted-foreground line-through">
                        ${product.price.toFixed(2)}
                      </div>
                      <p className="text-sm font-semibold text-accent">
                        ${getDiscountedPrice(product.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-8 mb-8 bg-background/80 backdrop-blur-lg border-2 border-primary/20 shadow-xl">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Enhance Your Experience
          </h2>
          <div className="space-y-4">
            {enhancementProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center space-x-3 p-4 rounded-lg hover:bg-muted/50 transition-all border border-border/50 hover:border-primary/30"
              >
                <Checkbox
                  id={product.id}
                  checked={selectedExtras.includes(product.id)}
                  onCheckedChange={() => toggleExtra(product.id)}
                  className="mt-1"
                />
                {product.image && (
                  <img
                    src={productImages[product.image]}
                    alt={product.name}
                    className="w-16 h-16 object-contain rounded-lg bg-white p-1"
                    width={64}
                    height={64}
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                  />
                )}
                <div className="flex-1">
                  <Label htmlFor={product.id} className="cursor-pointer">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="font-medium text-foreground block mb-1">{product.name}</span>
                        <p className="text-sm text-muted-foreground font-normal">
                          {product.description}
                        </p>
                        <p className="text-xs text-muted-foreground font-normal italic mt-1">
                          {product.dosage}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-muted-foreground line-through">
                          ${product.price.toFixed(2)}
                        </div>
                        <p className="text-sm font-semibold text-accent">
                          ${getDiscountedPrice(product.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-8 mb-8 bg-background/80 backdrop-blur-lg border-2 border-accent/30 shadow-xl">
          <div className="flex items-start space-x-3 p-4 rounded-lg hover:bg-muted/50 transition-all">
            <Checkbox
              id="twoperson"
              checked={twoPerson}
              onCheckedChange={(checked) => setTwoPerson(checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="twoperson" className="cursor-pointer">
                <span className="font-medium text-lg text-foreground block mb-1">2-Person Fast</span>
                <p className="text-sm text-muted-foreground font-normal">
                  Double the quantities for two people - perfect for couples or fasting partners
                </p>
              </Label>
            </div>
          </div>
        </Card>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-xl mb-6 border-2 border-primary/20">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm text-muted-foreground">Original Price</p>
              <p className="text-xl text-muted-foreground line-through">
                ${pricing.originalTotal.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Your Price</p>
              <p className="text-4xl font-bold text-primary">${pricing.total.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Badge className="bg-green-600 text-white text-base px-4 py-1">
              You Save ${pricing.savings.toFixed(2)} (10% OFF)
            </Badge>
            {twoPerson && (
              <p className="text-sm text-accent font-medium">Doubled for 2-person fast</p>
            )}
          </div>
        </div>
        <div className="text-center">
          <Button
            size="lg"
            className="px-12 text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all"
            onClick={() => {
              saveKitSelection({ extras: selectedExtras, twoPerson });
              navigate("/checkout");
            }}
          >
            Continue to Checkout →
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Secure checkout with your preferred WooCommerce payment method
          </p>
        </div>
      </div>
    </div>
  );
}
