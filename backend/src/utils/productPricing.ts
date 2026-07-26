import { env } from '../config/env';

export const MANUAL_PRODUCT_PREFIX = 'MANUAL-';
const DEFAULT_CJ_USD_TO_NGN_RATE = 1600;

function toNumber(value: unknown) {
  const n = typeof value === 'string' ? Number.parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function isManualProductId(aliexpressId?: string | null) {
  return Boolean(aliexpressId && aliexpressId.startsWith(MANUAL_PRODUCT_PREFIX));
}

export function getCjUsdToNgnRate() {
  const rate = Number(env.cj.usdToNgnRate ?? DEFAULT_CJ_USD_TO_NGN_RATE);
  return Number.isFinite(rate) && rate > 0 ? rate : DEFAULT_CJ_USD_TO_NGN_RATE;
}

export function convertCjUsdToNgn(value: unknown) {
  return roundCurrency(toNumber(value) * getCjUsdToNgnRate());
}

export function getDisplayedCjPrice(basePrice: unknown, aliexpressId?: string | null, sellingPrice?: unknown) {
  if (isManualProductId(aliexpressId)) {
    return toNumber(sellingPrice ?? basePrice);
  }

  return convertCjUsdToNgn(sellingPrice ?? basePrice);
}

export function normalizeVisibleCjProduct(product: any) {
  if (!product || isManualProductId(product.aliexpressId) || String(product.currency ?? '').toUpperCase() === 'NGN') {
    return product;
  }

  const variants = Array.isArray(product.variants)
    ? product.variants.map((variant: any) => ({
        ...variant,
        priceDelta: convertCjUsdToNgn(variant.priceDelta ?? 0),
      }))
    : product.variants;

  return {
    ...product,
    basePrice: convertCjUsdToNgn(product.basePrice),
    sellingPrice: convertCjUsdToNgn(product.sellingPrice ?? product.basePrice),
    currency: 'NGN',
    variants,
  };
}
