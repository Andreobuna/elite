'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

const providers = [
  { id: 'STRIPE', label: 'Card (Stripe)' },
  { id: 'PAYPAL', label: 'PayPal' },
  { id: 'PAYSTACK', label: 'Paystack' },
  { id: 'FLUTTERWAVE', label: 'Flutterwave' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [provider, setProvider] = useState('STRIPE');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '', phone: '',
  });

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => (await api.get('/cart')).data.items as any[],
  });

  const subtotal = (cart ?? []).reduce(
    (sum, item) => sum + (Number(item.product.sellingPrice) + Number(item.variant?.priceDelta ?? 0)) * item.quantity,
    0
  );

  function updateAddress(field: string, value: string) {
    setAddress((a) => ({ ...a, [field]: value }));
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // In production you'd first POST /addresses to persist the address,
      // then reference its id here. Simplified for this scaffold.
      const addrRes = await api.post('/addresses', address).catch(() => null);
      const addressId = addrRes?.data?.address?.id;

      const { data } = await api.post('/orders', {
        addressId,
        paymentProvider: provider,
      });
      toast.success(`Order #${data.order.orderNumber} placed.`);
      router.push(`/orders/${data.order.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Could not place your order. Please check your details.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-ivory">Checkout</h1>

      <form onSubmit={placeOrder} className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/5 bg-charcoal/40 p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-ivory">Shipping Address</h2>
            <div className="grid grid-cols-2 gap-4">
              <input required placeholder="Full name" value={address.fullName} onChange={(e) => updateAddress('fullName', e.target.value)} className="input-elite col-span-2" />
              <input required placeholder="Address line 1" value={address.line1} onChange={(e) => updateAddress('line1', e.target.value)} className="input-elite col-span-2" />
              <input placeholder="Address line 2 (optional)" value={address.line2} onChange={(e) => updateAddress('line2', e.target.value)} className="input-elite col-span-2" />
              <input required placeholder="City" value={address.city} onChange={(e) => updateAddress('city', e.target.value)} className="input-elite" />
              <input placeholder="State/Province" value={address.state} onChange={(e) => updateAddress('state', e.target.value)} className="input-elite" />
              <input required placeholder="Postal code" value={address.postalCode} onChange={(e) => updateAddress('postalCode', e.target.value)} className="input-elite" />
              <input required placeholder="Country" value={address.country} onChange={(e) => updateAddress('country', e.target.value)} className="input-elite" />
              <input required placeholder="Phone" value={address.phone} onChange={(e) => updateAddress('phone', e.target.value)} className="input-elite col-span-2" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-white/5 bg-charcoal/40 p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-ivory">Payment Method</h2>
            <div className="grid grid-cols-2 gap-3">
              {providers.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors ${provider === p.id ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-ivory hover:border-gold/40'}`}
                >
                  <CreditCard size={16} /> {p.label}
                </button>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-slate">
              <ShieldCheck size={14} className="text-gold" /> Payments are processed securely — card details never touch our servers.
            </p>
          </motion.div>
        </div>

        <div className="h-fit rounded-2xl border border-gold/15 bg-charcoal/60 p-6">
          <h2 className="font-display text-lg font-semibold text-ivory">Order Total</h2>
          <div className="mt-4 flex justify-between text-sm text-slate">
            <span>Subtotal</span><span className="text-ivory">${subtotal.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-slate">
            <span>Shipping</span><span className="text-ivory">{subtotal > 50 ? 'Free' : '$5.99'}</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-white/10 pt-4 font-display text-lg text-ivory">
            <span>Total</span><span className="text-gold">${(subtotal + (subtotal > 50 ? 0 : 5.99)).toFixed(2)}</span>
          </div>
          <button type="submit" disabled={loading} className="btn-gold mt-6 w-full disabled:opacity-60">
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Place Order'}
          </button>
        </div>
      </form>
    </main>
  );
}
