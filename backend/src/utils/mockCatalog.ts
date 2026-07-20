import type { RemoteProduct } from './cjdropshipping';

const images = [
  'https://images.unsplash.com/photo-1588596692308-1f2b7c4c8d89?w=800',
  'https://images.unsplash.com/photo-1583468982228-19d0c9c1f2f7?w=800',
  'https://images.unsplash.com/photo-1586402187878-34d6d8d5c10c?w=800',
  'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
  'https://images.unsplash.com/photo-1556228578-0d85b1a8f3f8?w=800',
  'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800',
];

type Seed = {
  name: string;
  category: string;
  type: string;
  detail: string;
  price: number;
  rating: number;
  ratingCount: number;
  stock: number;
  accent: string;
};

const sexSeeds: Seed[] = [
  { name: 'Pulse', category: 'Sexual Wellness', type: 'sex toy vibrator', detail: 'Quiet USB-C rechargeable design with multiple intensity levels.', price: 29.9, rating: 4.7, ratingCount: 812, stock: 180, accent: 'Midnight' },
  { name: 'Aura', category: 'Sexual Wellness', type: 'sex toy personal stimulator', detail: 'Water-resistant ergonomic body-safe silicone build.', price: 34.5, rating: 4.8, ratingCount: 1044, stock: 160, accent: 'Rose' },
  { name: 'Bond', category: 'Couples', type: 'sex toy couples toy', detail: 'Designed for shared use with flexible fit and remote control.', price: 42, rating: 4.6, ratingCount: 621, stock: 140, accent: 'Crimson' },
  { name: 'Lush', category: 'Accessories', type: 'sex toy storage case', detail: 'Discreet travel case with a soft-touch finish and locking zipper.', price: 18.75, rating: 4.5, ratingCount: 287, stock: 240, accent: 'Graphite' },
  { name: 'Silk', category: 'Lubricants', type: 'personal lubricant', detail: 'Long-lasting formula with a clean finish and easy rinse-off.', price: 14.2, rating: 4.4, ratingCount: 531, stock: 300, accent: 'Clear' },
  { name: 'Wave', category: 'Sexual Wellness', type: 'sex toy wand massager', detail: 'Broad-head wand with deep-vibration output and travel lock.', price: 49.99, rating: 4.9, ratingCount: 1165, stock: 120, accent: 'Ivory' },
  { name: 'Nova', category: 'Massagers', type: 'sex toy massage toy', detail: 'Flexible body-safe design tuned for precise pressure control.', price: 37.4, rating: 4.7, ratingCount: 742, stock: 155, accent: 'Plum' },
  { name: 'Halo', category: 'Accessories', type: 'sex toy cleaning kit', detail: 'Compact care kit with gentle cleanser, cloth, and case.', price: 12.6, rating: 4.3, ratingCount: 219, stock: 260, accent: 'Slate' },
];

const bagSeeds: Seed[] = [
  { name: 'Metro', category: 'Bags', type: 'tote bag', detail: 'Spacious everyday carry bag with reinforced handles and a clean structured shape.', price: 34.9, rating: 4.6, ratingCount: 642, stock: 220, accent: 'Sand' },
  { name: 'Harbor', category: 'Bags', type: 'handbag', detail: 'Polished handbag with a removable strap and secure top closure.', price: 39.5, rating: 4.7, ratingCount: 514, stock: 180, accent: 'Black' },
  { name: 'Drift', category: 'Backpacks', type: 'backpack', detail: 'Lightweight backpack with padded straps and laptop sleeve.', price: 46.2, rating: 4.8, ratingCount: 688, stock: 150, accent: 'Olive' },
  { name: 'Transit', category: 'Travel Bags', type: 'travel bag', detail: 'Weekend travel bag with structured sides and easy-access pockets.', price: 52.9, rating: 4.6, ratingCount: 433, stock: 130, accent: 'Navy' },
  { name: 'Cove', category: 'Purses', type: 'purse', detail: 'Compact purse with a crossbody strap and organized interior.', price: 31.25, rating: 4.5, ratingCount: 375, stock: 240, accent: 'Burgundy' },
  { name: 'Summit', category: 'Shoulder Bags', type: 'shoulder bag', detail: 'Soft shoulder bag with a roomy main compartment and gold-tone hardware.', price: 43.8, rating: 4.7, ratingCount: 562, stock: 170, accent: 'Taupe' },
  { name: 'Nomad', category: 'Duffel Bags', type: 'duffel bag', detail: 'Durable duffel bag sized for gym, work, or short trips.', price: 48.4, rating: 4.6, ratingCount: 491, stock: 145, accent: 'Charcoal' },
  { name: 'Arc', category: 'Crossbody Bags', type: 'crossbody bag', detail: 'Slim crossbody bag with an adjustable strap and secure zip pocket.', price: 28.6, rating: 4.4, ratingCount: 298, stock: 260, accent: 'Espresso' },
];

function buildFromSeeds(seeds: Seed[], startIndex: number): RemoteProduct[] {
  const catalog: RemoteProduct[] = [];
  let index = startIndex;

  for (const seed of seeds) {
    for (let variant = 1; variant <= 12; variant += 1) {
      const labels = ['Classic', 'Mini', 'Pro', 'Max', 'Prime', 'Lite', 'Ultra', 'Flex'];
      const shades = ['Onyx', 'Cherry', 'Violet', 'Pearl', 'Graphite', 'Blush', 'Jet', 'Copper'];
      const label = labels[variant % labels.length];
      const shade = shades[variant % shades.length];
      const title = seed.name + ' ' + seed.type + ' ' + label;

      catalog.push({
        aliexpressId: 'CJ-MOCK-' + index,
        title,
        description: seed.detail + ' ' + seed.accent + ' finish with a ' + shade.toLowerCase() + ' accent.',
        images: [images[index % images.length]],
        basePrice: Math.round((seed.price + variant * 1.75) * 100) / 100,
        currency: 'USD',
        stock: seed.stock + variant * 5,
        category: seed.category,
        ratingAverage: Math.min(5, Math.round((seed.rating - (variant % 3) * 0.03) * 10) / 10),
        ratingCount: seed.ratingCount + variant * 12,
        variants: [
          { sku: 'CJ-MOCK-' + index + '-A', name: 'Color: ' + seed.accent, priceDelta: 0, stock: seed.stock + variant * 5, attributes: { color: seed.accent.toLowerCase() } },
          { sku: 'CJ-MOCK-' + index + '-B', name: 'Color: ' + shade, priceDelta: 1.5, stock: seed.stock + variant * 3, attributes: { color: shade.toLowerCase() } },
        ],
      });
      index += 1;
    }
  }

  return catalog;
}

export function buildMockCatalog(): RemoteProduct[] {
  return [...buildFromSeeds(sexSeeds, 1001), ...buildFromSeeds(bagSeeds, 2001)];
}
