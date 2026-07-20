import crypto from 'crypto';
import axios from 'axios';
import { env } from '../config/env';
import { logger } from './logger';
import { buildMockCatalog } from './mockCatalog';

export interface RemoteProduct {
  aliexpressId: string;
  title: string;
  description: string;
  images: string[];
  basePrice: number;
  currency: string;
  stock: number;
  category: string;
  ratingAverage: number;
  ratingCount: number;
  variants: { sku: string; name: string; priceDelta: number; stock: number; attributes: Record<string, string> }[];
}

const MOCK_CATALOG: RemoteProduct[] = buildMockCatalog();
const configured = () => Boolean(env.aliexpress.appKey && env.aliexpress.appSecret);
const PAGE_SIZE = 50;

function ts() {
  return new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai', hour12: false }).replace('T', ' ');
}

function sign(params: Record<string, string | number | boolean | undefined | null>) {
  const secret = env.aliexpress.appSecret;
  const method = env.aliexpress.signMethod === 'hmac' ? 'hmac' : 'md5';
  const base = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => key + String(value))
    .join('');

  if (method === 'hmac') {
    return crypto.createHmac('md5', secret).update(base, 'utf8').digest('hex').toUpperCase();
  }

  return crypto.createHash('md5').update(secret + base + secret, 'utf8').digest('hex').toUpperCase();
}

async function callTopApi(method: string, params: Record<string, string | number | boolean | undefined | null> = {}) {
  if (!configured()) throw new Error('ALIEXPRESS_NOT_CONFIGURED');

  const payload: Record<string, string | number | boolean> = {
    method,
    app_key: env.aliexpress.appKey,
    sign_method: env.aliexpress.signMethod === 'hmac' ? 'hmac' : 'md5',
    timestamp: ts(),
    format: 'json',
    v: '2.0',
    simplify: true,
  };

  if (env.aliexpress.session) payload.session = env.aliexpress.session;
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') payload[key] = value as any;
  }

  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(payload)) body.append(key, String(value));
  body.append('sign', sign(payload));

  const { data } = await axios.post(env.aliexpress.baseUrl, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    timeout: 20000,
  });

  if (data?.error_response) {
    throw new Error(data.error_response.msg || data.error_response.sub_msg || data.error_response.message || 'AliExpress API request failed');
  }

  return data;
}

function arrayFrom(...sources: any[]) {
  for (const source of sources) {
    if (!source) continue;
    if (Array.isArray(source)) return source;
    if (Array.isArray(source.items)) return source.items;
    if (Array.isArray(source.item)) return source.item;
    if (Array.isArray(source.list)) return source.list;
    if (Array.isArray(source.product)) return source.product;
    if (typeof source === 'object') {
      const nested = Object.values(source).find((value) => Array.isArray(value));
      if (Array.isArray(nested)) return nested;
    }
  }
  return [];
}

function imagesFrom(item: any): string[] {
  return [item.image_urls, item.image_u_r_ls, item.productImageSet, item.productImage, item.productImages, item.images, item.image]
    .flatMap((source) => {
      if (!source) return [];
      if (Array.isArray(source)) return source;
      if (typeof source === 'string') return source.split(',').map((url) => url.trim());
      return [];
    })
    .map((entry: any) => (typeof entry === 'string' ? entry : entry?.url ?? entry?.imageUrl))
    .filter(Boolean);
}

function parsePrice(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    if (/^\d+$/.test(value) && value.length > 4) return Number((Number(value) / 100).toFixed(2));
    const n = Number.parseFloat((value.split('-')[0] || '0').replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function variantAttrs(name: string) {
  return name.split('/').map((part) => part.trim()).filter(Boolean).reduce<Record<string, string>>((attrs, part, index) => {
    const pair = part.includes(':') ? part.split(':') : ['option' + (index + 1), part];
    attrs[pair[0].trim().toLowerCase()] = pair[1].trim();
    return attrs;
  }, {});
}

function mapVariants(item: any, productId: string, fallback: RemoteProduct['variants'][number]) {
  const variants = arrayFrom(item.variants, item.variantList, item.skuList);
  if (!variants.length) return [fallback];

  return variants.map((variant: any) => {
    const rawSku = String(variant.variantSku ?? variant.sku ?? variant.vid ?? variant.id ?? productId + '-variant');
    const sku = rawSku.indexOf(productId) === 0 ? rawSku : productId + '-' + rawSku;
    const name = String(variant.variantNameEn ?? variant.variantName ?? variant.variantKey ?? variant.name ?? rawSku);
    return { sku, name, priceDelta: parsePrice(variant.priceDelta ?? variant.price ?? 0), stock: Number(variant.inventoryNum ?? variant.stock ?? item.inventoryNum ?? 0) || 0, attributes: variantAttrs(name) };
  });
}

function mapProduct(item: any): RemoteProduct | null {
  if (!item) return null;
  const id = String(item.product_id ?? item.productId ?? item.id ?? item.productSku ?? item.product_code ?? '');
  if (!id) return null;

  const title = String(item.english_subject ?? item.subject ?? item.productNameEn ?? item.productName ?? item.title ?? 'AliExpress Product');
  const defaultVariant = { sku: id + '-default', name: 'Default', priceDelta: 0, stock: Number(item.quantity ?? item.inventoryNum ?? item.totalInventoryNum ?? item.stock ?? 0) || 0, attributes: {} };

  return {
    aliexpressId: id,
    title,
    description: String(item.description_url ?? item.description ?? item.productDescription ?? title),
    images: imagesFrom(item).length ? imagesFrom(item) : ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'],
    basePrice: parsePrice(item.item_offer_site_sale_price ?? item.product_min_price ?? item.product_price ?? item.discount_price_cents ?? item.original_price_cents),
    currency: String(item.currency_code ?? item.base_currency_code ?? item.currency ?? 'NGN'),
    stock: Number(item.quantity ?? item.inventoryNum ?? item.totalInventoryNum ?? item.stock ?? 0) || 0,
    category: String(item.categories ?? item.category_name ?? item.category ?? item.categoryName ?? 'AliExpress'),
    ratingAverage: Number(item.avg_evaluation_rating ?? item.average_star ?? item.ratingAverage ?? 0) || 0,
    ratingCount: Number(item.evaluation_count ?? item.ratingCount ?? item.order_count ?? 0) || 0,
    variants: mapVariants(item, id, defaultVariant),
  };
}

function filterMockCatalog(keyword: string) {
  if (!keyword) return MOCK_CATALOG;
  const needle = keyword.toLowerCase();
  return MOCK_CATALOG.filter(
    (p) =>
      p.title.toLowerCase().includes(needle) ||
      p.description.toLowerCase().includes(needle) ||
      p.category.toLowerCase().includes(needle)
  );
}

function mapListResponse(raw: any): RemoteProduct[] {
  const result = raw?.aliexpress_solution_product_list_get_response?.result ?? raw?.aliexpress_solution_product_list_get_response?.data ?? raw?.result ?? raw?.data ?? raw;
  const items = arrayFrom(result?.aeop_a_e_product_display_d_t_o_list, result?.aeop_a_e_product_display_d_t_o_list?.aeop_a_e_product_display_d_t_o, result?.aeop_a_e_product_display_d_t_o, result?.product_list, result?.list, result);
  return items.map(mapProduct).filter(Boolean) as RemoteProduct[];
}

function mapDetailResponse(raw: any): RemoteProduct | null {
  const result = raw?.aliexpress_offer_productdisplay_query_response?.result ?? raw?.aliexpress_solution_product_info_get_response?.result ?? raw?.result ?? raw?.data ?? raw;
  return mapProduct(result?.data ?? result);
}

export async function searchProducts(keyword = '', page = 1): Promise<RemoteProduct[]> {
  if (!configured()) {
    logger.warn('[aliexpress] credentials not set - serving mock catalog for searchProducts()');
    return filterMockCatalog(keyword);
  }

  try {
    const products: RemoteProduct[] = [];
    for (let currentPage = Math.max(page, 1); ; currentPage += 1) {
      const data = await callTopApi('aliexpress.solution.product.list.get', {
        aeop_a_e_product_list_query: JSON.stringify({
          current_page: currentPage,
          page_size: PAGE_SIZE,
          product_status_type: 'onSelling',
          subject: keyword || undefined,
        }),
      });
      const pageProducts = mapListResponse(data);
      if (!pageProducts.length) break;
      products.push(...pageProducts);
      if (pageProducts.length < PAGE_SIZE) break;
    }
    return products;
  } catch (err) {
    logger.warn('[aliexpress] searchProducts failed, falling back to mock catalog', err);
    return filterMockCatalog(keyword);
  }
}

export async function getProductDetail(productId: string): Promise<RemoteProduct | null> {
  if (!configured()) return MOCK_CATALOG.find((p) => p.aliexpressId === productId) ?? null;

  try {
    const data = await callTopApi('aliexpress.offer.productdisplay.query', { product_id: productId, local_country: env.aliexpress.country, local_language: env.aliexpress.language });
    return mapDetailResponse(data);
  } catch (err) {
    logger.error('[aliexpress] getProductDetail(' + productId + ' ) failed', err);
    return null;
  }
}

export function applyMarkup(basePrice: number, markupPercent: number): number {
  return Math.round(basePrice * (1 + markupPercent / 100) * 100) / 100;
}

export { MOCK_CATALOG };


