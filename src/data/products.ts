export interface Product {
  id: string;
  name: string;
  description: string;
  dosage: string;
  price: number;
}

export const basicKitProducts: Product[] = [
  {
    id: "magnesium",
    name: "Magnesium (Angstrom)",
    description: "Essential mineral support",
    dosage: "1-2 droppers 4 times/day under tongue for 30 seconds",
    price: 28.00, // 8 fl oz Mother Earth Minerals
  },
  {
    id: "serraxym",
    name: "Serraxym",
    description: "Proteolytic enzymes",
    dosage: "2 capsules 3 times/day mixed in water",
    price: 62.00, // 93 capsules
  },
  {
    id: "fasting-elixir",
    name: "Tachyon Fasting Elixir",
    description: "Tachyon energy support",
    dosage: "1 dropper 4 times/day mixed in water",
    price: 36.00, // 1 oz Tachyon product
  },
];

export const enhancementProducts: Product[] = [
  {
    id: "iodine",
    name: "Illumodine (Iodine)",
    description: "Potent lymphatic cleanser",
    dosage: "5 drops 3 times/day (start day 5)",
    price: 29.00, // 0.5 fl oz
  },
  {
    id: "ncd",
    name: "NCD Zeolite",
    description: "Heavy metal removal",
    dosage: "15 drops 4 times/day",
    price: 42.00, // 15ml Waiora
  },
  {
    id: "radneut",
    name: "Rad Neutral",
    description: "Anti-radiation support",
    dosage: "12 drops once daily - hold under tongue for 30 seconds",
    price: 62.00, // 1 fl oz
  },
];

export const postPurchaseProducts: Product[] = [
  {
    id: "digestxym",
    name: "Digestxym",
    description: "Digestive enzyme support",
    dosage: "Take with meals to support digestion",
    price: 62.00, // 93 capsules
  },
  {
    id: "triphala",
    name: "Organic Triphala",
    description: "Ayurvedic bowel support",
    dosage: "1 teaspoon or 2 caps 3 times/day until first bowel movement",
    price: 21.99, // 90 capsules
  },
];

export const calculateKitPrice = (
  includeEnhancements: string[] = [],
  twoPerson: boolean = false
): number => {
  let total = basicKitProducts.reduce((sum, product) => sum + product.price, 0);
  
  enhancementProducts.forEach((product) => {
    if (includeEnhancements.includes(product.id)) {
      total += product.price;
    }
  });
  
  if (twoPerson) {
    total *= 2;
  }
  
  return total;
};

export const calculateOffFastKitPrice = (): number => {
  return postPurchaseProducts.reduce((sum, product) => sum + product.price, 0);
};
