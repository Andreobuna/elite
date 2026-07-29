'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ShieldCheck, Truck, RefreshCcw, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import AmbientBackground from '@/components/AmbientBackground';
import ProductCard, { ProductCardData } from '@/components/ProductCard';

function makeCategoryArt(title: string, accent: string, subtitle: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f0c0a"/>
          <stop offset="55%" stop-color="${accent}"/>
          <stop offset="100%" stop-color="#241911"/>
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.2" r="0.8">
          <stop offset="0%" stop-color="#f7e198" stop-opacity="0.75"/>
          <stop offset="100%" stop-color="#f7e198" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="600" height="750" rx="40" fill="url(#bg)"/>
      <circle cx="160" cy="120" r="130" fill="url(#glow)"/>
      <circle cx="470" cy="590" r="170" fill="#f7e198" fill-opacity="0.08"/>
      <path d="M70 540C150 470 238 448 332 470C410 487 477 522 530 575" stroke="#f7e198" stroke-opacity="0.45" stroke-width="14" stroke-linecap="round"/>
      <path d="M110 180C205 130 320 128 430 174" stroke="#ffffff" stroke-opacity="0.16" stroke-width="10" stroke-linecap="round"/>
      <g transform="translate(54 478)">
        <rect x="0" y="0" width="492" height="136" rx="28" fill="#ffffff" fill-opacity="0.08" stroke="#f7e198" stroke-opacity="0.22"/>
        <text x="34" y="48" fill="#f7f1e8" font-family="Georgia, 'Times New Roman', serif" font-size="28" font-weight="700">${title}</text>
        <text x="34" y="86" fill="#f7f1e8" fill-opacity="0.78" font-family="Inter, Arial, sans-serif" font-size="18">${subtitle}</text>
      </g>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const categoryShowcase = [
  {
    name: 'Sexual Wellness',
    slug: 'sexual-wellness',
    image: makeCategoryArt('Sexual Wellness', '#2a1f18', 'Premium essentials, curated with care'),
  },
  {
    name: 'Vibrators',
    slug: 'vibrators',
    image: makeCategoryArt('Vibrators', '#47311f', 'Modern designs for personal pleasure'),
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    image: makeCategoryArt('Accessories', '#604222', 'Finishing touches that elevate the mood'),
  },
  {
    name: 'Lubricants',
    slug: 'lubricants',
    image: makeCategoryArt('Lubricants', '#3f2d22', 'Comfort-first formulas for every moment'),
  },
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
  const trendingToys = useProducts({ category: 'sexual-wellness', sort: 'newest', pageSize: '8' });
  const featuredWellness = useProducts({ category: 'sexual-wellness', sort: 'rating', pageSize: '4' });

  return (
    <main>
      <section className='relative overflow-hidden px-6 pb-24 pt-20 sm:min-h-[88vh] sm:pt-28'>
        <div className='absolute inset-0'>
          <img
            src='/shop.png'
            alt=''
            className='h-full w-full object-cover object-center object-[center_28%]'
          />
        </div>
        <div className='absolute inset-0 bg-gradient-to-b from-obsidian/20 via-obsidian/55 to-obsidian/90 dark:from-obsidian/35 dark:via-obsidian/65 dark:to-obsidian/92' />
        <AmbientBackground density={22} />
        <div className='relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center'>
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className='section-label mb-6'>
            <span>Shop With Class · Verified · Delivered</span>
          </motion.span>
          <div className='glass-panel w-full max-w-4xl rounded-[2rem] border-white/10 px-6 py-10 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.7)] sm:px-10 sm:py-14'>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} className='font-display text-5xl font-bold leading-[1.05] text-ivory drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)] sm:text-6xl lg:text-7xl dark:text-ivory'>
              Shop with class
              <br />
              for <span className='text-shimmer'>premium essentials</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25 }} className='mx-auto mt-6 max-w-2xl text-base text-ivory/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)] sm:text-lg dark:text-slate-light'>
              Explore a refined collection of premium sex toys, clothing, shoes, accessories, and intimate essentials, all with discreet delivery and affordable prices.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className='mt-10 flex flex-col justify-center gap-4 sm:flex-row'>
              <Link href='/shop' className='btn-gold'>
                Start Shopping <ArrowRight size={16} />
              </Link>
              <Link href='/adult-wellness' className='btn-ghost'>
                View Catalog Guide
              </Link>
            </motion.div>
          </div>
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
            <h2 className='font-display text-3xl font-semibold text-ivory sm:text-4xl'>Elite picks worth discovering</h2>
          </div>
          <Link href='/adult-wellness' className='hidden items-center gap-1 text-sm text-gold hover:text-gold-light sm:flex'>
            Open guide <ArrowRight size={14} />
          </Link>
        </div>
        <ProductGrid query={trendingToys} emptyHint='Create a manual elite product in the admin dashboard to surface it first.' />
      </section>

      <section className='mx-auto max-w-7xl px-6 py-10 pb-24'>
        <div className='mb-10 flex items-end justify-between'>
          <div>
            <p className='section-label mb-3'>Curated Essentials</p>
            <h2 className='font-display text-3xl font-semibold text-ivory sm:text-4xl'>Premium finds for every side of your style</h2>
          </div>
        </div>
        <ProductGrid query={featuredWellness} columns={4} emptyHint='The collection is loaded with curated premium products across toys, fashion, shoes, and more.' />
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
