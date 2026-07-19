'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, Package, ShoppingCart, Users, Settings as SettingsIcon,
  RefreshCw, DollarSign, TrendingUp, Percent, ScrollText, CheckCircle2,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import Logo from '@/components/Logo';

type Tab = 'overview' | 'sync' | 'orders' | 'customers' | 'settings';

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'sync', label: 'Product Sync', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <div className="flex min-h-screen bg-obsidian">
      <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-charcoal/40 lg:block">
        <div className="border-b border-white/5 p-6">
          <Logo size={32} />
          <p className="mt-1 text-xs uppercase tracking-widest text-gold/70">Admin Console</p>
        </div>
        <nav className="space-y-1 p-4">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                tab === id ? 'bg-gold/10 text-gold' : 'text-ivory/70 hover:bg-white/5 hover:text-ivory'
              }`}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 px-6 py-8 sm:px-10">
        <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs ${
                tab === id ? 'border-gold text-gold' : 'border-white/10 text-slate'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {tab === 'overview' && <Overview />}
            {tab === 'sync' && <ProductSync />}
            {tab === 'orders' && <OrdersPanel />}
            {tab === 'customers' && <CustomersPanel />}
            {tab === 'settings' && <SettingsPanel />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-charcoal/50 p-6">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent ? 'bg-gold/10 text-gold' : 'bg-white/5 text-ivory'}`}>
        <Icon size={18} />
      </div>
      <p className="mt-4 text-2xl font-semibold text-ivory">{value}</p>
      <p className="text-xs text-slate">{label}</p>
    </div>
  );
}

function Overview() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => (await api.get('/admin/dashboard')).data,
  });

  const chartData = (data?.recentOrders ?? [])
    .slice()
    .reverse()
    .map((o: any) => ({ name: `#${o.orderNumber.slice(-4)}`, total: Number(o.grandTotal) }));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ivory">Dashboard Overview</h1>
      {isLoading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={DollarSign} label="Total Revenue" value={`$${Number(data?.totalRevenue ?? 0).toFixed(2)}`} accent />
            <StatCard icon={ShoppingCart} label="Total Orders" value={String(data?.totalOrders ?? 0)} />
            <StatCard icon={Users} label="Customers" value={String(data?.totalCustomers ?? 0)} />
            <StatCard icon={Package} label="Products" value={String(data?.totalProducts ?? 0)} />
          </div>

          <div className="mt-8 rounded-2xl border border-white/5 bg-charcoal/50 p-6">
            <h2 className="font-display text-lg text-ivory">Recent Order Value</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d4af37" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#8b8a92" fontSize={12} />
                  <YAxis stroke="#8b8a92" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#151417', border: '1px solid #d4af3733', borderRadius: 12 }} />
                  <Area type="monotone" dataKey="total" stroke="#d4af37" fill="url(#gold)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/5 bg-charcoal/50 p-6">
            <h2 className="font-display text-lg text-ivory">Recent Orders</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate">
                    <th className="pb-3">Order</th><th className="pb-3">Customer</th><th className="pb-3">Status</th><th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentOrders ?? []).map((o: any) => (
                    <tr key={o.id} className="border-t border-white/5">
                      <td className="py-3 text-ivory">#{o.orderNumber}</td>
                      <td className="py-3 text-slate">{o.user.firstName} {o.user.lastName}</td>
                      <td className="py-3 text-gold">{o.status}</td>
                      <td className="py-3 text-right text-ivory">${Number(o.grandTotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ProductSync() {
  const [keyword, setKeyword] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [lastSyncCount, setLastSyncCount] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => (await api.get('/products?pageSize=1000')).data.products,
  });

  const categories = ['all', ...new Set((products ?? []).map((p: any) => p.category?.name ?? p.category?.slug ?? 'Uncategorized'))];
  const filteredProducts = categoryFilter === 'all' ? (products ?? []) : (products ?? []).filter((p: any) => (p.category?.name ?? p.category?.slug ?? 'Uncategorized') === categoryFilter);

  async function runSync() {
    setSyncing(true);
    try {
      const res = await api.post('/products/admin/sync', { keyword });
      setLastSyncCount(Number(res.data.synced ?? 0));
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    } catch {
      toast.error('Sync failed. Check your AliExpress API key in .env.');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ivory">Product Synchronization</h1>
      <p className="mt-1 text-sm text-slate">
        Pull products from AliExpress. Without live API credentials configured on the server, this uses the
        bundled mock catalog so you can test the full pipeline end-to-end. Last sync: {lastSyncCount === null ? 'Not run yet' : lastSyncCount + ' products'}
      </p>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-gold/15 bg-charcoal/50 p-6 sm:flex-row">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Keyword to search on AliExpress (leave blank to sync catalog)"
          className="input-elite flex-1"
        />
        <button onClick={runSync} disabled={syncing} className="btn-gold shrink-0 disabled:opacity-60">
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Syncingâ€¦' : 'Run Sync'}
        </button>
      </div>

      <div className="mt-8 rounded-2xl border border-white/5 bg-charcoal/50 p-6">
        <h2 className="font-display text-lg text-ivory">Catalog ({filteredProducts.length})</h2>
        {isLoading ? (
          <div className="mt-4 space-y-2">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate">
                  <th className="pb-3">Product</th><th className="pb-3">Base Price</th><th className="pb-3">Markup</th><th className="pb-3">Selling Price</th><th className="pb-3">Stock</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p: any) => (
                  <tr key={p.id} className="border-t border-white/5">
                    <td className="flex items-center gap-3 py-3 text-ivory">
                      <img src={p.images?.[0]?.url} className="h-9 w-9 rounded-lg object-cover" alt="" />
                      <span className="line-clamp-1 max-w-[220px]">{p.title}</span>
                    </td>
                    <td className="py-3 text-slate">${Number(p.basePrice).toFixed(2)}</td>
                    <td className="py-3 text-slate">{Number(p.markupPercent)}%</td>
                    <td className="py-3 text-gold">${Number(p.sellingPrice).toFixed(2)}</td>
                    <td className="py-3 text-slate">{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function OrdersPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard-orders'],
    queryFn: async () => (await api.get('/admin/dashboard')).data.recentOrders,
  });

  async function updateStatus(id: string, status: string) {
    await api.patch(`/orders/${id}/status`, { status });
    toast.success(`Order updated to ${status}`);
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard-orders'] });
  }

  const statuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ivory">Order Management</h1>
      {isLoading ? (
        <div className="mt-6 space-y-2">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : (
        <div className="mt-6 space-y-3">
          {(data ?? []).map((o: any) => (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-charcoal/50 p-5">
              <div>
                <p className="font-display text-ivory">#{o.orderNumber}</p>
                <p className="text-xs text-slate">{o.user.firstName} {o.user.lastName} Â· ${Number(o.grandTotal).toFixed(2)}</p>
              </div>
              <select
                defaultValue={o.status}
                onChange={(e) => updateStatus(o.id, e.target.value)}
                className="input-elite w-auto !py-2 text-sm"
              >
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomersPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/admin/users')).data.users,
  });

  async function toggleRole(id: string, currentRole: string) {
    const role = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    await api.patch(`/admin/users/${id}/role`, { role });
    toast.success(`Role updated to ${role}`);
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ivory">Customers</h1>
      {isLoading ? (
        <div className="mt-6 space-y-2">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/5 bg-charcoal/50 p-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate">
                <th className="pb-3">Name</th><th className="pb-3">Email</th><th className="pb-3">Verified</th><th className="pb-3">Role</th><th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((u: any) => (
                <tr key={u.id} className="border-t border-white/5">
                  <td className="py-3 text-ivory">{u.firstName} {u.lastName}</td>
                  <td className="py-3 text-slate">{u.email}</td>
                  <td className="py-3">{u.isEmailVerified ? <CheckCircle2 size={16} className="text-emerald-300" /> : <span className="text-slate">â€”</span>}</td>
                  <td className="py-3 text-gold">{u.role}</td>
                  <td className="py-3">
                    <button onClick={() => toggleRole(u.id, u.role)} className="text-xs text-gold underline underline-offset-2">
                      Make {u.role === 'ADMIN' ? 'Customer' : 'Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SettingsPanel() {
  const [markup, setMarkup] = useState('10');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: logs } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => (await api.get('/admin/audit-logs')).data.logs,
  });

  async function saveMarkup() {
    setSaving(true);
    try {
      const res = await api.post('/admin/settings/markup', { markupPercent: parseFloat(markup) });
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    } catch {
      toast.error('Failed to update markup.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ivory">Settings</h1>

      <div className="mt-6 rounded-2xl border border-gold/15 bg-charcoal/50 p-6">
        <div className="flex items-center gap-2 text-gold"><Percent size={18} /><h2 className="font-display text-lg">Default Markup Percentage</h2></div>
        <p className="mt-2 text-sm text-slate">Applied automatically to every product synced from AliExpress. Existing products are recalculated immediately when you save.</p>
        <div className="mt-4 flex items-center gap-3">
          <input
            type="number" step="0.1" min="0" value={markup}
            onChange={(e) => setMarkup(e.target.value)}
            className="input-elite w-32"
          />
          <span className="text-slate">%</span>
          <button onClick={saveMarkup} disabled={saving} className="btn-gold disabled:opacity-60">
            {saving ? 'Savingâ€¦' : 'Save Markup'}
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-white/5 bg-charcoal/50 p-6">
        <div className="flex items-center gap-2 text-ivory"><ScrollText size={18} className="text-gold" /><h2 className="font-display text-lg">Audit Log</h2></div>
        <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
          {(logs ?? []).map((log: any) => (
            <div key={log.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-4 py-2.5 text-sm">
              <span className="text-ivory">{log.action}</span>
              <span className="text-xs text-slate">{log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'} Â· {new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-charcoal/50 p-6">
          <h3 className="font-display text-ivory">Payment Providers</h3>
          <p className="mt-1 text-xs text-slate">Configured via environment variables on the backend.</p>
          <ul className="mt-3 space-y-2 text-sm">
            {['Stripe', 'PayPal', 'Paystack', 'Flutterwave'].map((p) => (
              <li key={p} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                <span className="text-ivory">{p}</span>
                <span className="text-xs text-slate">Set in backend/.env</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/5 bg-charcoal/50 p-6">
          <h3 className="font-display text-ivory">AliExpress Connection</h3>
          <p className="mt-1 text-xs text-slate">Add your ALIEXPRESS_APP_KEY in backend/.env to go live.</p>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/[0.02] px-3 py-2 text-sm text-ivory">
            <TrendingUp size={14} className="text-gold" /> Using mock catalog fallback until configured
          </div>
        </div>
      </div>
    </div>
  );
}

