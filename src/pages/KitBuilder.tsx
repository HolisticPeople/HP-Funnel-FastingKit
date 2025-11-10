import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function KitBuilder() {
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [twoPerson, setTwoPerson] = useState(false);

  const toggleExtra = (extra: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extra) ? prev.filter((e) => e !== extra) : [...prev, extra]
    );
  };

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
          <h2 className="text-2xl font-semibold text-primary mb-4">
            Basic Kit Includes
          </h2>
          <div className="space-y-3 text-foreground">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-accent mt-2" />
              <div>
                <p className="font-medium">Magnesium</p>
                <p className="text-sm text-muted-foreground">
                  1-2 droppers 4 times/day under tongue for 30 seconds
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-accent mt-2" />
              <div>
                <p className="font-medium">Serraxym (Proteolytic Enzymes)</p>
                <p className="text-sm text-muted-foreground">
                  2 capsules 3 times/day mixed in water
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-accent mt-2" />
              <div>
                <p className="font-medium">Tachyon Fasting Elixir</p>
                <p className="text-sm text-muted-foreground">
                  1 dropper 4 times/day mixed in water
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 mb-8 bg-background/50 backdrop-blur">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Enhance Your Experience
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                id="iodine"
                checked={selectedExtras.includes("iodine")}
                onCheckedChange={() => toggleExtra("iodine")}
              />
              <div className="flex-1">
                <Label htmlFor="iodine" className="cursor-pointer">
                  <span className="font-medium">Illumodine (Iodine)</span>
                  <p className="text-sm text-muted-foreground font-normal">
                    Potent lymphatic cleanser - 5 drops 3 times/day (start day 5)
                  </p>
                </Label>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                id="ncd"
                checked={selectedExtras.includes("ncd")}
                onCheckedChange={() => toggleExtra("ncd")}
              />
              <div className="flex-1">
                <Label htmlFor="ncd" className="cursor-pointer">
                  <span className="font-medium">NCD Zeolite</span>
                  <p className="text-sm text-muted-foreground font-normal">
                    Heavy metal removal - 15 drops 4 times/day
                  </p>
                </Label>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                id="radneut"
                checked={selectedExtras.includes("radneut")}
                onCheckedChange={() => toggleExtra("radneut")}
              />
              <div className="flex-1">
                <Label htmlFor="radneut" className="cursor-pointer">
                  <span className="font-medium">Rad Neutral</span>
                  <p className="text-sm text-muted-foreground font-normal">
                    12 drops once daily - hold under tongue for 30 seconds
                  </p>
                </Label>
              </div>
            </div>
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

        <div className="text-center">
          <Button size="lg" className="px-12 text-lg">
            Continue to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
