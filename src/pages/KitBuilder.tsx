import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { basicKitProducts, enhancementProducts, calculateKitPrice } from "@/data/products";

export default function KitBuilder() {
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [twoPerson, setTwoPerson] = useState(false);

  const toggleExtra = (extra: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extra) ? prev.filter((e) => e !== extra) : [...prev, extra]
    );
  };

  const totalPrice = calculateKitPrice(selectedExtras, twoPerson);
  const basicKitPrice = calculateKitPrice([], false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Build Your Fasting Kit
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Customize your 7-day juice fasting supplement kit
          </p>
        </div>

        <Card className="p-8 mb-8 bg-background/50 backdrop-blur">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-primary">
              Basic Kit Includes
            </h2>
            <p className="text-2xl font-bold text-accent">
              ${basicKitPrice.toFixed(2)}
            </p>
          </div>
          <div className="space-y-3 text-foreground">
            {basicKitProducts.map((product) => (
              <div key={product.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.dosage}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground ml-4">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-8 mb-8 bg-background/50 backdrop-blur">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Enhance Your Experience
          </h2>
          <div className="space-y-4">
            {enhancementProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-start space-x-3 p-4 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={product.id}
                  checked={selectedExtras.includes(product.id)}
                  onCheckedChange={() => toggleExtra(product.id)}
                />
                <div className="flex-1">
                  <Label htmlFor={product.id} className="cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">{product.name}</span>
                        <p className="text-sm text-muted-foreground font-normal">
                          {product.description} - {product.dosage}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-foreground ml-4">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-8 mb-8 bg-background/50 backdrop-blur">
          <div className="flex items-start space-x-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
            <Checkbox
              id="twoperson"
              checked={twoPerson}
              onCheckedChange={(checked) => setTwoPerson(checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="twoperson" className="cursor-pointer">
                <span className="font-medium text-lg">2-Person Fast</span>
                <p className="text-sm text-muted-foreground font-normal">
                  Double the quantities for two people
                </p>
              </Label>
            </div>
          </div>
        </Card>

        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-lg text-muted-foreground">Total Kit Price</p>
            {twoPerson && (
              <p className="text-sm text-accent">Doubled for 2-person fast</p>
            )}
          </div>
          <p className="text-4xl font-bold text-primary">${totalPrice.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <Button size="lg" className="px-12 text-lg">
            Continue to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
