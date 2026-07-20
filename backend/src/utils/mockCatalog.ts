import type { RemoteProduct } from './aliexpress';

const TYPES = ['vibrator', 'dildo', 'pocket toy', 'wand massager', 'couples toy', 'bullet toy', 'stroker', 'massage wand', 'cleaning kit', 'storage case', 'lubricant set', 'silicone sleeve'];
const FINISHES = ['Classic', 'Mini', 'Pro', 'Max', 'Lite', 'Ultra', 'Pulse', 'Flex'];
const MATERIALS = ['soft-touch silicone', 'matte silicone', 'body-safe polymer', 'silky polymer', 'smooth finish', 'textured grip'];
const HIGHLIGHTS = ['amber', 'rose', 'emerald', 'indigo', 'crimson', 'plum', 'gold', 'smoke'];

const SEEDS = [
  { name: 'Pulse', category: 'Sexual Wellness', detail: 'Quiet rechargeable formats for discreet daily use.', price: 9800, rating: 4.8, ratingCount: 1220, stock: 180, accent: 'Midnight' },
  { name: 'Aura', category: 'Sexual Wellness', detail: 'Ergonomic silhouettes with body-safe finishes.', price: 11200, rating: 4.7, ratingCount: 980, stock: 165, accent: 'Blush' },
  { name: 'Nova', category: 'Sexual Wellness', detail: 'High-output designs tuned for controlled comfort.', price: 14500, rating: 4.9, ratingCount: 1430, stock: 140, accent: 'Plum' },
  { name: 'Wave', category: 'Sexual Wellness', detail: 'Wand-style performers with deeper vibration patterns.', price: 16800, rating: 4.9, ratingCount: 1495, stock: 120, accent: 'Ivory' },
  { name: 'Lush', category: 'Sexual Wellness', detail: 'Compact pocket toys made for travel and storage.', price: 8600, rating: 4.6, ratingCount: 760, stock: 210, accent: 'Graphite' },
  { name: 'Bond', category: 'Couples', detail: 'Shared-use toy designs with secure fit and remote control.', price: 17900, rating: 4.7, ratingCount: 870, stock: 135, accent: 'Crimson' },
  { name: 'Silk', category: 'Lubricants', detail: 'Clean-feeling lubricant sets and companion care products.', price: 5200, rating: 4.5, ratingCount: 430, stock: 320, accent: 'Clear' },
  { name: 'Halo', category: 'Accessories', detail: 'Discreet storage and cleaning accessories for private use.', price: 4100, rating: 4.4, ratingCount: 300, stock: 280, accent: 'Slate' },
  { name: 'Drift', category: 'Accessories', detail: 'Travel pouches, cases, and protective sleeves for essentials.', price: 5600, rating: 4.5, ratingCount: 390, stock: 260, accent: 'Olive' },
  { name: 'Vanta', category: 'Sexual Wellness', detail: 'Compact stimulation tools with refined, quiet operation.', price: 13100, rating: 4.8, ratingCount: 1120, stock: 155, accent: 'Onyx' },
  { name: 'Ember', category: 'Sexual Wellness', detail: 'Textured designs with a softer profile and balanced response.', price: 12400, rating: 4.7, ratingCount: 940, stock: 148, accent: 'Copper' },
  { name: 'Cove', category: 'Sexual Wellness', detail: 'Slim profile stimulators with easy-clean surfaces.', price: 10400, rating: 4.6, ratingCount: 720, stock: 190, accent: 'Navy' },
];

function hashText(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}

function pick<T>(items: T[], index: number) {
  return items[index % items.length];
}

function svgDataUri(title: string, category: string, accent: string, seedIndex: number, variantIndex: number, imageIndex: number) {
  const hash = hashText(`${title}-${seedIndex}-${variantIndex}-${imageIndex}`);
  const hueA = hash % 360;
  const hueB = (hash + 38 + imageIndex * 11) % 360;
  const hueC = (hash + 78 + variantIndex * 7) % 360;
  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeCategory = category.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900" fill="none"><defs><linearGradient id="g${hash}" x1="120" y1="100" x2="780" y2="820" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="hsl(${hueA} 75% 18%)"/><stop offset="55%" stop-color="hsl(${hueB} 72% 28%)"/><stop offset="100%" stop-color="hsl(${hueC} 60% 12%)"/></linearGradient><radialGradient id="r${hash}" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(450 260) rotate(90) scale(350 340)"><stop offset="0%" stop-color="rgba(255,255,255,0.32)"/><stop offset="70%" stop-color="rgba(255,255,255,0.08)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient></defs><rect width="900" height="900" rx="64" fill="url(#g${hash})"/><circle cx="166" cy="138" r="118" fill="rgba(255,255,255,0.08)"/><circle cx="740" cy="184" r="146" fill="rgba(255,255,255,0.06)"/><ellipse cx="450" cy="500" rx="285" ry="236" fill="url(#r${hash})"/><rect x="132" y="640" width="636" height="118" rx="54" fill="rgba(0,0,0,0.24)"/><path d="M338 306c0-55 46-100 102-100h20c56 0 102 45 102 100v168c0 78-64 142-142 142s-142-64-142-142V306Z" fill="rgba(255,255,255,0.22)"/><path d="M386 340c0-22 18-40 40-40h48c22 0 40 18 40 40v134c0 42-34 76-76 76s-76-34-76-76V340Z" fill="rgba(255,255,255,0.38)"/><circle cx="450" cy="304" r="35" fill="rgba(255,255,255,0.52)"/><text x="74" y="104" fill="rgba(255,255,255,0.84)" font-size="30" font-family="Arial, Helvetica, sans-serif" letter-spacing="4">ELITE X</text><text x="74" y="154" fill="rgba(255,255,255,0.72)" font-size="18" font-family="Arial, Helvetica, sans-serif" letter-spacing="2">${safeCategory}</text><text x="74" y="806" fill="rgba(255,255,255,0.92)" font-size="28" font-family="Arial, Helvetica, sans-serif">${safeTitle}</text><text x="74" y="842" fill="rgba(255,255,255,0.68)" font-size="17" font-family="Arial, Helvetica, sans-serif">Generated product artwork</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function buildImages(title: string, category: string, accent: string, seedIndex: number, variantIndex: number) {
  return [0, 1].map((imageIndex) => svgDataUri(title, category, accent, seedIndex, variantIndex, imageIndex));
}

export function buildMockCatalog(): RemoteProduct[] {
  const catalog: RemoteProduct[] = [];
  let index = 1001;

  for (let seedIndex = 0; seedIndex < SEEDS.length; seedIndex += 1) {
    const seed = SEEDS[seedIndex];
    for (let variantIndex = 0; variantIndex < 90; variantIndex += 1) {
      const type = pick(TYPES, seedIndex * 11 + variantIndex);
      const finish = pick(FINISHES, seedIndex * 5 + variantIndex);
      const material = pick(MATERIALS, seedIndex + variantIndex * 2);
      const highlight = pick(HIGHLIGHTS, seedIndex * 3 + variantIndex);
      const title = `${seed.name} ${type} ${finish}`;
      const identifier = `CJ-MOCK-${String(index).padStart(5, '0')}`;
      const stock = seed.stock + variantIndex * 4 + seedIndex * 3;
      const price = Math.round((seed.price + seedIndex * 160 + variantIndex * 175) * 100) / 100;
      const ratingAverage = Math.min(5, Math.max(4, Math.round((seed.rating - (variantIndex % 4) * 0.03 + (seedIndex % 3) * 0.01) * 10) / 10));
      const ratingCount = seed.ratingCount + variantIndex * 14 + seedIndex * 19;
      const description = `${seed.detail} ${material} build with a ${highlight} accent and a discreet, travel-friendly profile.`;

      catalog.push({
        aliexpressId: identifier,
        title,
        description,
        images: buildImages(title, seed.category, seed.accent, seedIndex, variantIndex),
        basePrice: price,
        currency: 'NGN',
        stock,
        category: seed.category,
        ratingAverage,
        ratingCount,
        variants: [
          { sku: `${identifier}-STD`, name: 'Standard', priceDelta: 0, stock, attributes: { size: 'standard', finish: finish.toLowerCase(), accent: seed.accent.toLowerCase() } },
          { sku: `${identifier}-DELUXE`, name: 'Deluxe', priceDelta: 1800, stock: Math.max(0, stock - 12), attributes: { size: 'deluxe', finish: 'premium', accent: seed.accent.toLowerCase() } },
        ],
      });
      index += 1;
    }
  }

  return catalog;
}
