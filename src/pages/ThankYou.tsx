import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Mail, User } from "lucide-react";
import { loadKitSelection } from "@/data/wooMap";
import { basicKitProducts, enhancementProducts, calculateKitPrice } from "@/data/products";

export default function ThankYou() {
  const [params] = useSearchParams();
  const orderId = params.get("order_id") || "pending";
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any>(null);

  useEffect(() => {
    const sel = loadKitSelection();
    const { extras = [], twoPerson = false } = sel;
    const qty = twoPerson ? 2 : 1;
    
    const items = [
      ...basicKitProducts.map(p => ({
        name: p.name,
        qty,
        price: p.price,
        discountedPrice: p.price * 0.9,
      })),
      ...extras.map(id => {
        const product = enhancementProducts.find(p => p.id === id);
        return product ? {
          name: product.name,
          qty,
          price: product.price,
          discountedPrice: product.price * 0.9,
        } : null;
      }).filter(Boolean),
    ];
    
    setOrderItems(items);
    setPricing(calculateKitPrice(extras, twoPerson));
  }, []);

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
            Order #{orderId}
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
              {orderItems.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-center">{item.qty}</TableCell>
                  <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-green-600">
                    -${((item.price - item.discountedPrice) * item.qty).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${(item.discountedPrice * item.qty).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2">
                <TableCell colSpan={4} className="text-right font-semibold">Subtotal:</TableCell>
                <TableCell className="text-right font-bold">${pricing?.total.toFixed(2) || '0.00'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} className="text-right text-green-600 font-semibold">Total Savings:</TableCell>
                <TableCell className="text-right text-green-600 font-bold">
                  -${pricing?.savings.toFixed(2) || '0.00'}
                </TableCell>
              </TableRow>
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


