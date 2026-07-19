'use client';

import { useState } from 'react';
import { Mail, MessageSquare, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Wire this up to a real endpoint (e.g. POST /api/support) once one exists.
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 900);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-24">
      <div className="section-label mx-auto w-fit">Get in touch</div>
      <h1 className="mt-4 text-center font-display text-4xl font-semibold text-ivory">Contact Us</h1>
      <p className="mx-auto mt-3 max-w-lg text-center text-slate">
        Questions about an order, a product, or your account? Send us a message and a real person will get back to you.
      </p>

      <div className="mt-14 grid gap-10 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          {[
            { icon: Mail, title: 'Email', body: 'support@elitexshop.com' },
            { icon: MessageSquare, title: 'Live Chat', body: 'Available 9am–6pm, Mon–Fri' },
            { icon: MapPin, title: 'Headquarters', body: 'Remote-first, shipping worldwide' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-4 rounded-2xl border border-white/5 bg-charcoal/50 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <Icon size={18} />
              </div>
              <div>
                <p className="font-display text-ivory">{title}</p>
                <p className="text-sm text-slate">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-3">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-full flex-col items-center justify-center rounded-2xl border border-gold/20 bg-charcoal/50 p-12 text-center"
            >
              <CheckCircle2 size={40} className="text-gold" />
              <p className="mt-4 font-display text-xl text-ivory">Message sent</p>
              <p className="mt-1 text-sm text-slate">We'll reply within one business day.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-panel space-y-4 rounded-2xl p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <input required placeholder="Your name" className="input-elite" />
                <input required type="email" placeholder="Your email" className="input-elite" />
              </div>
              <input placeholder="Order number (optional)" className="input-elite" />
              <textarea required placeholder="How can we help?" rows={5} className="input-elite resize-none" />
              <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
                {loading ? 'Sending…' : (<>Send Message <Send size={16} /></>)}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
