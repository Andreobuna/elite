'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ShieldCheck, Truck, RefreshCcw, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import AmbientBackground from '@/components/AmbientBackground';
import ProductCard, { ProductCardData } from '@/components/ProductCard';

const categoryShowcase = [
  { name: 'Sexual Wellness', slug: 'sexual-wellness', image: 'https://images.unsplash.com/photo-1588596692308-1f2b7c4c8d89?w=600' },
  { name: 'Vibrators', slug: 'vibrators', image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=600' },
  { name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a8f3f8?w=600' },
  { name: 'Lubricants', slug: 'lubricants', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600' },
];

const trustBadges = [
  { icon: ShieldCheck, label: 'Verified Listings', detail: 'Every item is reviewed before it goes live' },
  { icon: Truck, label: 'Discreet Shipping', detail: 'Tracked delivery with plain packaging' },
  { icon: RefreshCcw, label: 'Easy Returns', detail: 'Simple return flow on eligible items' },
  { icon: Sparkles, label: 'Transparent Pricing', detail: 'Prices are shown in naira' },
];

function useProducts(params: Record<string, string> = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const { data } = await api.get('/products', { params });
      return data.products as ProductCardData[];
    },
  });
}

export default function HomePage() {
  const trendingToys = useProducts({ category: 'sexual-wellness', search: 'toy', sort: 'newest', pageSize: '8' });
  const featuredWellness = useProducts({ category: 'sexual-wellness', sort: 'rating', pageSize: '4' });

  return (
    <main>
      <section className='relative overflow-hidden px-6 pb-24 pt-20 sm:min-h-[88vh] sm:pt-28'>
        <div className='absolute inset-0'>
          <Image
            src='/shop.png'
            alt=''
            fill
            priority
            sizes='100vw'
            className='object-cover object-center opacity-25 blur-[1px] scale-105'
          />
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(17,17,17,0.25),rgba(7,10,12,0.86)_65%)]' />
          <div className='absolute inset-0 bg-gradient-to-b from-obsidian/50 via-obsidian/55 to-obsidian' />
        </div>
        <AmbientBackground density={22} />
        <div className='relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center'>
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className='section-label mb-6'>
            <span>Adult Wellness · Verified · Delivered</span>
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} className='font-display text-5xl font-bold leading-[1.05] text-ivory sm:text-6xl lg:text-7xl'>
            Discreet shopping
            <br />
            for <span className='text-shimmer'>adult wellness</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25 }} className='mt-6 max-w-xl text-base text-slate-light sm:text-lg'>
            Browse a curated adult wellness catalog with sex toys, accessories, lubricants, and discreet delivery in naira.
            
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className='mt-10 flex flex-col gap-4 sm:flex-row'>
            <Link href='/shop' className='btn-gold'>
              Start Shopping <ArrowRight size={16} />
            </Link>
            <Link href='/adult-wellness' className='btn-ghost'>
              View Catalog Guide
            </Link>
          </motion.div>
        </div>
      </section>

      <section className='border-y border-white/5 bg-charcoal/30 px-6 py-10'>
        <div className='mx-auto grid max-w-6xl grid-cols-2 gap-8 sm:grid-cols-4'>
          {trustBadges.map((b, i) => (
            <motion.div key={b.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} className='flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left'>
              <b.icon size={22} className='shrink-0 text-gold' />
              <div>
                <p className='text-sm font-semibold text-ivory'>{b.label}</p>
                <p className='text-xs text-slate'>{b.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className='mx-auto max-w-7xl px-6 py-20'>
        <div className='mb-10 flex items-end justify-between'>
          <div>
            <p className='section-label mb-3'>Browse</p>
            <h2 className='font-display text-3xl font-semibold text-ivory sm:text-4xl'>Shop by Category</h2>
          </div>
        </div>
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
          {categoryShowcase.map((cat, i) => (
            <motion.div key={cat.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
              <Link href={'/shop?category=' + cat.slug} className='group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-white/5'>
                <img src={cat.image} alt={cat.name} className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-110' />
                <div className='absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent' />
                <span className='absolute bottom-4 left-4 font-display text-lg font-semibold text-ivory'>{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className='mx-auto max-w-7xl px-6 py-10'>
        <div className='mb-10 flex items-end justify-between'>
          <div>
            <p className='section-label mb-3'>Trending New Arrivals</p>
            <h2 className='font-display text-3xl font-semibold text-ivory sm:text-4xl'>Toy-oriented products from the curated catalog</h2>
          </div>
          <Link href='/adult-wellness' className='hidden items-center gap-1 text-sm text-gold hover:text-gold-light sm:flex'>
            Open guide <ArrowRight size={14} />
          </Link>
        </div>
        <ProductGrid query={trendingToys} emptyHint='The catalog has toy-oriented sexual wellness products, but no exact pocket-pussy label was found.' />
      </section>

      <section className='mx-auto max-w-7xl px-6 py-10 pb-24'>
        <div className='mb-10 flex items-end justify-between'>
          <div>
            <p className='section-label mb-3'>Sexual Wellness Essentials</p>
            <h2 className='font-display text-3xl font-semibold text-ivory sm:text-4xl'>Top rated items for the full store experience</h2>
          </div>
        </div>
        <ProductGrid query={featuredWellness} columns={4} emptyHint='The catalog is loaded with curated adult wellness products.' />
      </section>
    </main>
  );
}

function ProductGrid({ query, columns = 4, emptyHint }: { query: ReturnType<typeof useProducts>; columns?: number; emptyHint?: string; }) {
  if (query.isLoading) {
    return (
      <div className={columns === 3 ? 'grid grid-cols-2 gap-5 sm:grid-cols-3' : 'grid grid-cols-2 gap-5 sm:grid-cols-4'}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className='skeleton aspect-square rounded-2xl' />
        ))}
      </div>
    );
  }

  if (!query.data || query.data.length === 0) {
    return (
      <div className='rounded-2xl border border-dashed border-white/10 py-16 text-center'>
        <p className='text-slate'>No products yet.</p>
        {emptyHint && <p className='mt-2 text-sm text-slate/70'>{emptyHint}</p>}
      </div>
    );
  }

  return (
    <div className={columns === 3 ? 'grid grid-cols-2 gap-5 sm:grid-cols-3' : 'grid grid-cols-2 gap-5 sm:grid-cols-4'}>
      {query.data.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}


