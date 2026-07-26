import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';

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

const usersByEmail = new Map<string, FallbackUser>();
const usersById = new Map<string, FallbackUser>();
const sessions = new Map<string, string>();
const demoAdminPasswordHash = bcrypt.hashSync('AdminPass123', 12);

function addUser(user: FallbackUser) {
  usersByEmail.set(user.email.toLowerCase(), user);
  usersById.set(user.id, user);
  return user;
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
  return [
    { key: 'MARKUP_PERCENT_DEFAULT', value: String(fallbackMarkupPercent()) },
    { key: 'CJ_USD_TO_NGN_RATE', value: String(env.cj.usdToNgnRate) },
  ];
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
  return [];
}

export function fallbackCatalogProducts() {
  return [];
}

export function fallbackCatalogProductBySlug(_slug: string) {
  return null;
}

export function fallbackCatalogProductCount() {
  return 0;
}

export function fallbackUpsertCatalogCategory(name: string, imageUrl?: string | null) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';

  return {
    id: 'fallback-category-' + slug,
    name,
    slug,
    imageUrl: imageUrl ?? null,
    parentId: null,
  };
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
  return {
    id: 'fallback-product-' + input.cjProductId,
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
    categoryId: null,
    category: fallbackUpsertCatalogCategory(input.categoryName),
    images: input.images.map((image, index) => ({
      id: 'fallback-product-' + input.cjProductId + '-image-' + index,
      productId: 'fallback-product-' + input.cjProductId,
      url: image.url,
      altText: image.altText ?? null,
      position: image.position,
    })),
    variants: input.variants.map((variant, index) => ({
      id: 'fallback-product-' + input.cjProductId + '-variant-' + index,
      productId: 'fallback-product-' + input.cjProductId,
      sku: variant.sku,
      name: variant.name,
      priceDelta: variant.priceDelta,
      stock: variant.stock,
      attributes: { ...variant.attributes },
    })),
    reviews: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}



