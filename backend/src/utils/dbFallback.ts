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
