import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { COUNTRIES, countryCodeSet, countryNameFor } from "@/data/countries";
import { WOO_IDS, KIT_BASE, ENHANCEMENTS, loadKitSelection } from "@/data/wooMap";
import {
  lookupCustomer,
  getRates,
  getTotals,
  createIntent,
  buildHostedConfirmUrl,
  type BridgeAddress,
} from "@/api/bridge";

export default function Checkout() {
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<BridgeAddress>({ country: "US" });
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [countryError, setCountryError] = useState<string | null>(null);
  const [postcodeError, setPostcodeError] = useState<string | null>(null);
  const [cityError, setCityError] = useState<string | null>(null);
  const [addr1Error, setAddr1Error] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [rates, setRates] = useState<any[]>([]);
  const [selectedRate, setSelectedRate] = useState<{ serviceName: string; amount: number }>();
  const [rateValue, setRateValue] = useState<string | undefined>(undefined);
  const [totals, setTotals] = useState<any>();
  const [pointsAvailable, setPointsAvailable] = useState<number>(0);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [recalcPending, setRecalcPending] = useState(false);
  const [ratesSig, setRatesSig] = useState<string | null>(null);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const calcSeqRef = useRef(0);
  const allowedMax = useMemo(() => {
    const subtotal = Number(totals?.subtotal || 0);
    const discount = Number(totals?.discount_total || 0);
    const netProducts = Math.max(0, subtotal - discount);
    const bySubtotal = Math.max(0, Math.floor(netProducts * 10)); // 10 pts == $1
    return Math.max(0, Math.min(pointsAvailable, bySubtotal));
  }, [pointsAvailable, totals?.subtotal, totals?.discount_total]);

  // Helper to quickly derive a new grand total without waiting for server
  const deriveGrand = (base: any, nextShipping?: number, nextPointsDiscount?: number) => {
    if (!base) return 0;
    const subtotal = Number(base.subtotal || 0);
    const shipping = typeof nextShipping === "number" ? nextShipping : Number(base.shipping_total || 0);
    const pts = typeof nextPointsDiscount === "number" ? nextPointsDiscount : Number(base.points_discount || 0);
    const g = subtotal + shipping - pts;
    return Math.max(0, Number.isFinite(g) ? g : 0);
  };

  const signatureForAddress = (a: BridgeAddress) => {
    const c = String(a.country || "").trim().toUpperCase();
    const p = String(a.postcode || "").trim().toUpperCase();
    return `${c}|${p}`;
  };
  const currentRatesSig = useMemo(() => signatureForAddress(address), [address.country, address.postcode]);
  const ratesFetched = useMemo(() => ratesSig !== null, [ratesSig]);
  const ratesStale = useMemo(() => ratesFetched && ratesSig !== currentRatesSig, [ratesFetched, ratesSig, currentRatesSig]);

  const items = useMemo(() => {
    const sel = loadKitSelection();
    const baseQty = sel.twoPerson ? 2 : 1;
    const out: { product_id?: number; sku?: string; qty: number }[] = [];
    // Base kit components
    KIT_BASE.forEach((p) => {
      if (p.product_id) out.push({ product_id: p.product_id, qty: baseQty });
      else if (p.sku) out.push({ sku: p.sku, qty: baseQty });
    });
    // Enhancements
    sel.extras.forEach((key) => {
      const def = ENHANCEMENTS[key];
      if (!def) return;
      if (def.product_id) out.push({ product_id: def.product_id, qty: baseQty });
      else if (def.sku) out.push({ sku: def.sku, qty: baseQty });
    });
    // Fallback to the legacy single product if nothing was built
    if (out.length === 0) {
      out.push({ product_id: WOO_IDS.fastingKit, qty: 1 });
    }
    return out;
  }, []);

  const prefill = async () => {
    if (!email) {
      setEmailError("Fill in your email address you used for your HolisticPeople account");
      return;
    }
    setEmailError(null);
    try {
      setLoadingLookup(true);
      const res = await lookupCustomer(email);
      const ship = res.default_shipping && res.default_shipping.country ? res.default_shipping : res.default_billing;
      const addr: BridgeAddress = {
        ...ship,
        email,
        phone: ship?.phone || res?.default_billing?.phone || address.phone,
      };
      setAddress(addr);
      setCountryError(null);
      setPostcodeError(null);
      setCityError(null);
      setAddr1Error(null);
      setPhoneError(null);
      setPointsAvailable(Number(res.points_balance || 0));
      // Auto-fetch shipping rates immediately on successful lookup
      await loadRates(addr);
    } catch (e: any) {
      toast({ title: "Lookup failed", description: e.message, variant: "destructive" });
    } finally {
      setLoadingLookup(false);
    }
  };

  const validateRequired = (addrOverride?: BridgeAddress): boolean => {
    let ok = true;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) { setEmailError("Valid email is required"); ok = false; } else { setEmailError(null); }
    const addrRef = addrOverride ?? address;
    if (!addrRef.country || !countryCodeSet.has(String(addrRef.country).toUpperCase())) {
      setCountryError("Select a valid country");
      ok = false;
    } else {
      setCountryError(null);
    }
    if (!addrRef.postcode) { setPostcodeError("Postcode is required"); ok = false; } else { setPostcodeError(null); }
    if (!addrRef.city) { setCityError("City is required"); ok = false; } else { setCityError(null); }
    if (!addrRef.address_1) { setAddr1Error("Address is required"); ok = false; } else { setAddr1Error(null); }
    if (!addrRef.phone) { setPhoneError("Phone number is required"); ok = false; } else { setPhoneError(null); }
    return ok;
  };

  const loadRates = async (addrOverride?: BridgeAddress): Promise<{ serviceName: string; amount: number } | undefined> => {
    if (!validateRequired(addrOverride || address)) { return; }
    try {
      setLoadingRates(true);
      const payload = {
        funnel_id: "fastingkit",
        address: addrOverride || address,
        items,
      };
      const res = await getRates(payload);
      const list = res.rates || [];
      setRates(list);
      setRatesSig(signatureForAddress(addrOverride || address));
      setRatesError(null);
      // Pre-select the cheapest rate and compute totals automatically
      if (list.length > 0) {
        const cheapest = [...list].sort((a, b) => {
          const av = Number(a.shipping_amount_raw ?? a.amount ?? 0);
          const bv = Number(b.shipping_amount_raw ?? b.amount ?? 0);
          return av - bv;
        })[0];
        const selected = {
          serviceName: String(cheapest.service_name ?? cheapest.serviceName ?? "Shipping"),
          amount: Number(cheapest.shipping_amount_raw ?? cheapest.amount ?? 0),
        };
        setSelectedRate(selected);
        setRateValue(`${selected.serviceName}::${selected.amount}`);
        // Begin revalidation (sequenced)
        setRecalcPending(true);
        calcSeqRef.current += 1;
        const seq = calcSeqRef.current;
        getTotals({
          funnel_id: "fastingkit",
          items,
          address: addrOverride || address,
          coupon_codes: [],
          selected_rate: selected,
          customer_email: email,
          points_to_redeem: pointsToRedeem,
        }).then((tot) => {
          if (seq === calcSeqRef.current) {
            const fixed = { ...tot, grand_total: deriveGrand(tot) };
            setTotals(fixed);
            setRecalcPending(false);
          }
        }).catch(() => setRecalcPending(false));
        return selected;
      } else {
        setSelectedRate(undefined);
        setRateValue(undefined);
      }
    } catch (e: any) {
      const friendly = "We couldn't find shipping options for this address. Please verify your country and postcode and try again.";
      setRates([]);
      setSelectedRate(undefined);
      setRateValue(undefined);
      setRatesError(friendly);
    } finally {
      setLoadingRates(false);
    }
  };

  // Removed manual Refresh Totals button; totals revalidate automatically

  const pay = async () => {
    if (!validateRequired(address)) { return; }
    try {
      setLoading(true);
      let useRate = selectedRate;
      if (!useRate || ratesStale) {
        const sel = await loadRates();
        if (!sel) { setLoading(false); return; }
        useRate = sel;
      }
      const res = await createIntent({
        funnel_id: "fastingkit",
        funnel_name: "Fasting Kit",
        customer: { email },
        shipping_address: address,
        items,
        coupon_codes: [],
        selected_rate: useRate,
        points_to_redeem: pointsToRedeem,
      });
      const base = ((import.meta as any).env?.VITE_APP_BASEPATH || "/").toString();
      const normalizedBase = base.endsWith("/") ? base : `${base}/`;
      const succ = `${APP_ORIGIN.replace(/\/$/,"")}${normalizedBase}upsell`;
      const url = buildHostedConfirmUrl(res.client_secret, res.publishable, succ);
      window.location.href = url;
    } catch (e: any) {
      toast({ title: "Payment init failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-4xl grid gap-6">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <Card className="p-6 grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex gap-2">
                <Input id="email" value={email} onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(null); }} placeholder="you@example.com" className={emailError ? "border-red-500" : ""} />
                <Button type="button" onClick={prefill} disabled={loadingLookup} className={loadingLookup ? "animate-pulse" : ""}>
                  {loadingLookup ? (<><span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />Looking up…</>) : "I have an account with HolisticPeople!"}
                </Button>
              </div>
              {emailError && <p className="text-sm text-red-600">{emailError}</p>}
            </div>
            {loadingLookup && (
              <div className="md:col-span-2 text-sm text-emerald-700 flex items-center">
                <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Looking up your account…
              </div>
            )}
            <div className="grid gap-2">
              <Label>Country</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded="false"
                    className={cn("justify-between", countryError ? "border-red-500" : "")}
                  >
                    {countryNameFor(address.country) || "Select country"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[320px]">
                  <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {COUNTRIES.map((c) => (
                        <CommandItem
                          key={c.code}
                          value={`${c.name} ${c.code}`}
                          onSelect={() => {
                            setAddress({ ...address, country: c.code });
                            if (countryError) setCountryError(null);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", address.country === c.code ? "opacity-100" : "opacity-0")} />
                          {c.name} ({c.code})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {countryError && <p className="text-sm text-red-600">{countryError}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="postcode">Postcode</Label>
              <Input id="postcode" value={address.postcode || ""} onChange={(e) => { setAddress({ ...address, postcode: e.target.value }); if (postcodeError) setPostcodeError(null); }} className={postcodeError ? "border-red-500" : ""} />
              {postcodeError && <p className="text-sm text-red-600">{postcodeError}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={address.city || ""} onChange={(e) => { setAddress({ ...address, city: e.target.value }); if (cityError) setCityError(null); }} className={cityError ? "border-red-500" : ""} />
              {cityError && <p className="text-sm text-red-600">{cityError}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={address.phone || ""}
                onChange={(e) => { setAddress({ ...address, phone: e.target.value }); if (phoneError) setPhoneError(null); }}
                placeholder="(555) 555‑5555"
                className={phoneError ? "border-red-500" : ""}
              />
              {phoneError && <p className="text-sm text-red-600">{phoneError}</p>}
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="address1">Address</Label>
              <Input id="address1" value={address.address_1 || ""} onChange={(e) => { setAddress({ ...address, address_1: e.target.value }); if (addr1Error) setAddr1Error(null); }} className={addr1Error ? "border-red-500" : ""} />
              {addr1Error && <p className="text-sm text-red-600">{addr1Error}</p>}
            </div>
          </div>
          {/* Rates button moved to Shipping Options section */}
        </Card>

        <Card className="p-6 grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Shipping Options</h2>
            <div className="flex items-center gap-3">
              {ratesStale && <span className="text-amber-700 text-sm">Address changed — update rates</span>}
              <Button variant="secondary" onClick={() => loadRates()} disabled={loadingRates} className={loadingRates ? "animate-pulse" : ""}>
                {loadingRates ? (<><span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />Getting rates…</>) : (rates.length > 0 ? "Update Shipping Rates" : "Get Shipping Rates")}
              </Button>
            </div>
          </div>
          {loadingRates && (
            <div className="text-sm text-emerald-700 flex items-center">
              <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Fetching shipping rates…
            </div>
          )}
          {ratesError && (
            <div className="text-sm text-red-600">{ratesError}</div>
          )}
          {rates.length > 0 && !ratesError && (
            <RadioGroup value={rateValue} onValueChange={async (v) => {
              const [serviceName, amount] = v.split("::");
              const amt = parseFloat(amount);
              setSelectedRate({ serviceName, amount: amt });
              setRateValue(v);
              // Optimistic local update
              if (totals) {
                const updated = { ...totals, shipping_total: amt };
                updated.grand_total = deriveGrand(totals, amt, undefined);
                setTotals(updated);
              }
              // Server revalidation (no blocking UI)
              setRecalcPending(true);
              calcSeqRef.current += 1;
              const seq = calcSeqRef.current;
              getTotals({
                funnel_id: "fastingkit",
                items,
                address,
                coupon_codes: [],
                selected_rate: { serviceName, amount: amt },
                customer_email: email,
                points_to_redeem: pointsToRedeem,
              }).then((tot) => {
                if (seq === calcSeqRef.current) {
                  const fixed = { ...tot, grand_total: deriveGrand(tot) };
                  setTotals(fixed);
                  setRecalcPending(false);
                }
              }).catch(() => setRecalcPending(false));
            }}>
              {rates.map((r, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <RadioGroupItem id={`rate-${i}`} value={`${r.service_name || r.serviceName}::${r.shipping_amount_raw || r.amount || 0}`} />
                  <Label htmlFor={`rate-${i}`}>{r.service_name || r.serviceName} — ${Number(r.shipping_amount_raw || r.amount || 0).toFixed(2)}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </Card>

        {pointsAvailable > 0 && (
          <Card className="p-6 grid gap-4">
            <h2 className="text-xl font-semibold">Use Your Points</h2>
            <p className="text-sm text-muted-foreground">
              Available: {pointsAvailable} points (${(pointsAvailable / 10).toFixed(2)}). You can use up to {allowedMax} points (${(allowedMax / 10).toFixed(2)}) on products (not shipping).
            </p>
            <div className="grid gap-2">
              <Slider
                value={[pointsToRedeem]}
                onValueChange={(val) => {
                  const pts = Math.min(Math.max(val[0] || 0, 0), allowedMax);
                  setPointsToRedeem(pts);
                }}
                onValueCommit={async (val) => {
                  const pts = Math.min(Math.max(val[0] || 0, 0), allowedMax);
                  setPointsToRedeem(pts);
                  // Optimistic local update
                  if (totals) {
                    const dollars = (pts / 10);
                    const updated = { ...totals, points_discount: dollars };
                    updated.grand_total = deriveGrand(totals, undefined, dollars);
                    setTotals(updated);
                  }
                  // Server revalidation
                  setRecalcPending(true);
                  calcSeqRef.current += 1;
                  const seq = calcSeqRef.current;
                  getTotals({
                    funnel_id: "fastingkit",
                    items,
                    address,
                    coupon_codes: [],
                    selected_rate: selectedRate,
                    customer_email: email,
                    points_to_redeem: pts,
                  }).then((tot) => {
                    if (seq === calcSeqRef.current) {
                      const fixed = { ...tot, grand_total: deriveGrand(tot) };
                      setTotals(fixed);
                      setRecalcPending(false);
                    }
                  }).catch(() => setRecalcPending(false));
                }}
                min={0}
                max={allowedMax}
                step={10}
              />
              <div className="flex justify-between text-sm">
                <span>Using: {pointsToRedeem} pts (${(pointsToRedeem / 10).toFixed(2)})</span>
                <span>Remaining: {Math.max(pointsAvailable - pointsToRedeem, 0)} pts</span>
              </div>
            </div>
          </Card>
        )}

        {totals && (
          <Card className="p-6 grid gap-2">
            <h2 className="text-xl font-semibold">Summary</h2>
            <div className="flex justify-between"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>${totals.shipping_total.toFixed(2)}</span></div>
            {totals.points_discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Points Discount</span>
                <span>- ${Number(totals.points_discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold"><span>Total</span><span>${totals.grand_total.toFixed(2)}</span></div>
          </Card>
        )}

        <div className="flex justify-end">
          <Button size="lg" onClick={pay} disabled={loading || loadingRates || loadingLookup || recalcPending || ratesStale || !selectedRate}>
            {totals ? `Pay $${Number(totals.grand_total || 0).toFixed(2)}` : "Pay"}
          </Button>
        </div>
      </div>
    </div>
  );
}


