import type { RemoteProduct } from './cjdropshipping';

const images=['https://images.unsplash.com/photo-1588596692308-1f2b7c4c8d89?w=800','https://images.unsplash.com/photo-1583468982228-19d0c9c1f2f7?w=800','https://images.unsplash.com/photo-1586402187878-34d6d8d5c10c?w=800','https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800','https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800','https://images.unsplash.com/photo-1556228578-0d85b1a8f3f8?w=800','https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800'];
const names=['Pulse','Aura','Bond','Lush','Silk','Wave','Nova','Halo'];
const cats=['Sexual Wellness','Sexual Wellness','Couples','Accessories','Lubricants','Sexual Wellness','Massagers','Accessories'];
const types=['vibrating massager','personal stimulator','couples toy','storage case','lubricant','wand massager','massage toy','cleaning kit'];
const details=['Quiet USB-C rechargeable design with multiple intensity levels.','Water-resistant ergonomic body-safe silicone build.','Designed for shared use with flexible fit and remote control.','Discreet travel case with a soft-touch finish and locking zipper.','Long-lasting formula with a clean finish and easy rinse-off.','Broad-head wand with deep-vibration output and travel lock.','Flexible body-safe design tuned for precise pressure control.','Compact care kit with gentle cleanser, cloth, and case.'];
const prices=[29.9,34.5,42,18.75,14.2,49.99,37.4,12.6];
const ratings=[4.7,4.8,4.6,4.5,4.4,4.9,4.7,4.3];
const ratingCounts=[812,1044,621,287,531,1165,742,219];
const stocks=[180,160,140,240,300,120,155,260];
const colors=['Midnight','Rose','Crimson','Graphite','Clear','Ivory','Plum','Slate'];

export function buildMockCatalog(): RemoteProduct[] {
  const catalog: RemoteProduct[] = [];
  let index = 1001;
  for (let seed = 0; seed < names.length; seed += 1) {
    for (let variant = 1; variant <= 16; variant += 1) {
      const labels = ['Classic','Mini','Pro','Max','Prime','Lite','Ultra','Flex'];
      const shades = ['Onyx','Cherry','Violet','Pearl','Graphite','Blush','Jet','Copper'];
      const label = labels[variant % labels.length];
      const shade = shades[variant % shades.length];
      const title = cats[seed] === 'Lubricants' ? names[seed] + ' Glide ' + label : names[seed] + ' ' + types[seed] + ' ' + label;
      catalog.push({ aliexpressId: 'CJ-MOCK-' + index, title, description: details[seed] + ' ' + colors[seed] + ' finish with a ' + shade.toLowerCase() + ' accent.', images: [images[index % images.length]], basePrice: Math.round((prices[seed] + variant * 1.75) * 100) / 100, currency: 'USD', stock: stocks[seed] + variant * 5, category: cats[seed], ratingAverage: Math.min(5, Math.round((ratings[seed] - (variant % 3) * 0.03) * 10) / 10), ratingCount: ratingCounts[seed] + variant * 12, variants: [{ sku: 'CJ-MOCK-' + index + '-A', name: 'Color: ' + colors[seed], priceDelta: 0, stock: stocks[seed] + variant * 5, attributes: { color: colors[seed].toLowerCase() } }, { sku: 'CJ-MOCK-' + index + '-B', name: 'Color: ' + shade, priceDelta: 1.5, stock: stocks[seed] + variant * 3, attributes: { color: shade.toLowerCase() } }] });
      index += 1;
    }
  }
  return catalog;
}
