import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import type { RemoteProduct } from './cjdropshipping';

export type FallbackRole = 'CUSTOMER' | 'ADMIN';

export interface FallbackUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: FallbackRole;
  isEmailVerified: boolean;
  avatarUrl?: string | null;
  createdAt: Date;
}

export interface FallbackCatalogCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  parentId?: string | null;
}

export interface FallbackCatalogImage {
  id: string;
  productId: string;
  url: string;
  altText?: string | null;
  position: number;
}

export interface FallbackCatalogVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  priceDelta: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface FallbackCatalogProduct {
  id: string;
  cjProductId: string | null;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  markupPercent: number;
  sellingPrice: number;
  currency: string;
  stock: number;
  ratingAverage: number;
  ratingCount: number;
  isActive: boolean;
  categoryId: string | null;
  category: FallbackCatalogCategory | null;
  images: FallbackCatalogImage[];
  variants: FallbackCatalogVariant[];
  reviews: [];
  createdAt: Date;
  updatedAt: Date;
}

const usersByEmail = new Map<string, FallbackUser>();
const usersById = new Map<string, FallbackUser>();
const sessions = new Map<string, string>();
const categoriesBySlug = new Map<string, FallbackCatalogCategory>();
const productsBySlug = new Map<string, FallbackCatalogProduct>();
const productsByAlias = new Map<string, FallbackCatalogProduct>();
const demoAdminPasswordHash = bcrypt.hashSync('AdminPass123', 12);

function addUser(user: FallbackUser) {
  usersByEmail.set(user.email.toLowerCase(), user);
  usersById.set(user.id, user);
  return user;
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function cloneCategory(category: FallbackCatalogCategory) {
  return { ...category };
}

function cloneProduct(product: FallbackCatalogProduct) {
  return {
    ...product,
    category: product.category ? cloneCategory(product.category) : null,
    images: product.images.map((image) => ({ ...image })),
    variants: product.variants.map((variant) => ({ ...variant, attributes: { ...variant.attributes } })),
  };
}

addUser({
  id: 'demo-admin',
  firstName: 'Elite',
  lastName: 'Admin',
  email: 'admin@elitexshop.com',
  passwordHash: demoAdminPasswordHash,
  role: 'ADMIN',
  isEmailVerified: true,
  avatarUrl: null,
  createdAt: new Date(),
});

export function isDatabaseUnavailable(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("Can't reach database server") || message.includes('P1001') || message.includes('PrismaClientInitializationError');
}

export function fallbackMarkupPercent() {
  return env.defaultMarkupPercent;
}

export function fallbackUsers() {
  return Array.from(usersByEmail.values()).map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  }));
}

export function fallbackSettings() {
  return [{ key: 'MARKUP_PERCENT_DEFAULT', value: String(fallbackMarkupPercent()) }];
}

export function fallbackCoupons() {
  return [];
}

export function fallbackDashboardStats(productCount: number) {
  return {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: usersByEmail.size,
    totalProducts: productCount,
    recentOrders: [],
  };
}

export function fallbackCreateUser(data: { firstName: string; lastName: string; email: string; password: string; role?: FallbackRole }) {
  const existing = usersByEmail.get(data.email.toLowerCase());
  if (existing) return null;

  const user: FallbackUser = {
    id: uuidv4(),
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    passwordHash: bcrypt.hashSync(data.password, 12),
    role: data.role ?? 'CUSTOMER',
    isEmailVerified: true,
    avatarUrl: null,
    createdAt: new Date(),
  };
  addUser(user);
  return user;
}

export async function fallbackLogin(email: string, password: string) {
  const user = usersByEmail.get(email.toLowerCase());
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  const refreshToken = fallbackCreateSession(user.id);
  return { user, refreshToken };
}

export function fallbackCreateSession(userId: string) {
  const refreshToken = uuidv4();
  sessions.set(refreshToken, userId);
  return refreshToken;
}

export function fallbackRefresh(refreshToken: string) {
  const userId = sessions.get(refreshToken);
  if (!userId) return null;
  const user = usersById.get(userId);
  if (!user) return null;
  return user;
}

export function fallbackLogout(refreshToken?: string) {
  if (refreshToken) sessions.delete(refreshToken);
}

export function fallbackUserById(id: string) {
  return usersById.get(id) ?? null;
}

export function fallbackStoreUser(user: FallbackUser) {
  addUser(user);
}

export function fallbackCatalogCategories() {
  return Array.from(categoriesBySlug.values()).map((category) => cloneCategory(category));
}

export function fallbackCatalogProducts() {
  return Array.from(productsBySlug.values()).map((product) => cloneProduct(product));
}

export function fallbackCatalogProductBySlug(slug: string) {
  const product = productsBySlug.get(slug);
  return product ? cloneProduct(product) : null;
}

export function fallbackCatalogProductCount() {
  return productsBySlug.size;
}

export function fallbackUpsertCatalogCategory(name: string, imageUrl?: string | null) {
  const slug = toSlug(name);
  const existing = categoriesBySlug.get(slug);
  if (existing) {
    if (existing.name !== name || existing.imageUrl !== imageUrl) {
      existing.name = name;
      existing.imageUrl = imageUrl ?? null;
    }
    return cloneCategory(existing);
  }

  const category: FallbackCatalogCategory = {
    id: 'fallback-category-' + slug,
    name,
    slug,
    imageUrl: imageUrl ?? null,
    parentId: null,
  };
  categoriesBySlug.set(slug, category);
  return cloneCategory(category);
}

export function fallbackUpsertCatalogProduct(input: {
  cjProductId: string;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  markupPercent: number;
  sellingPrice: number;
  currency: string;
  stock: number;
  ratingAverage: number;
  ratingCount: number;
  isActive?: boolean;
  categoryName: string;
  images: Array<{ url: string; position: number; altText?: string | null }>;
  variants: Array<{ sku: string; name: string; priceDelta: number; stock: number; attributes: Record<string, string> }>;
}) {
  const category = fallbackUpsertCatalogCategory(input.categoryName);
  const id = 'fallback-product-' + input.cjProductId;
  const existing = productsByAlias.get(input.cjProductId) ?? productsBySlug.get(input.slug) ?? null;
  const createdAt = existing?.createdAt ?? new Date();
  const product: FallbackCatalogProduct = {
    id: existing?.id ?? id,
    cjProductId: input.cjProductId,
    title: input.title,
    slug: input.slug,
    description: input.description,
    basePrice: input.basePrice,
    markupPercent: input.markupPercent,
    sellingPrice: input.sellingPrice,
    currency: input.currency,
    stock: input.stock,
    ratingAverage: input.ratingAverage,
    ratingCount: input.ratingCount,
    isActive: input.isActive ?? true,
    categoryId: category.id,
    category,
    images: input.images.map((image, index) => ({
      id: id + '-image-' + index,
      productId: id,
      url: image.url,
      altText: image.altText ?? null,
      position: image.position,
    })),
    variants: input.variants.map((variant, index) => ({
      id: id + '-variant-' + index,
      productId: id,
      sku: variant.sku,
      name: variant.name,
      priceDelta: variant.priceDelta,
      stock: variant.stock,
      attributes: { ...variant.attributes },
    })),
    reviews: [],
    createdAt,
    updatedAt: new Date(),
  };

  if (existing) {
    productsBySlug.delete(existing.slug);
    if (existing.cjProductId) {
      productsByAlias.delete(existing.cjProductId);
    }
  }

  productsBySlug.set(product.slug, product);
  if (product.cjProductId) {
    productsByAlias.set(product.cjProductId, product);
  }
  return cloneProduct(product);
}

export function fallbackStoreCatalog(products: RemoteProduct[], markupPercent: number) {
  return products.map((product) =>
    fallbackUpsertCatalogProduct({
      cjProductId: product.cjProductId,
      title: product.title,
      slug: toSlug(product.title) + '-' + product.cjProductId.slice(-4),
      description: product.description,
      basePrice: product.basePrice,
      markupPercent,
      sellingPrice: Math.round(product.basePrice * (1 + markupPercent / 100) * 100) / 100,
      currency: 'NGN',
      stock: product.stock,
      ratingAverage: product.ratingAverage,
      ratingCount: product.ratingCount,
      categoryName: product.category,
      images: product.images.map((url, position) => ({ url, position })),
      variants: product.variants.map((variant) => ({
        sku: variant.sku,
        name: variant.name,
        priceDelta: variant.priceDelta,
        stock: variant.stock,
        attributes: { ...variant.attributes },
      })),
    })
  );
}


