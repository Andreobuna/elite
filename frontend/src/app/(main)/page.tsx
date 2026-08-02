'use client';

import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, RefreshCcw, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { api } from '@/lib/api';
import AmbientBackground from '@/components/AmbientBackground';
import ProductCard, { ProductCardData } from '@/components/ProductCard';
import tenImage from '../../../ten.png';
import accessoriesImage from '../../../accessories.jpg';
import downloadImage from '../../../download.webp';
import viberatorImage from '../../../viberator.jpg';

const showcaseImages: StaticImageData[] = [tenImage, viberatorImage, accessoriesImage, downloadImage];
const categoryShowcase = [
  { name: 'Sexual Wellness', slug: 'sexual-wellness', image: viberatorImage },
  { name: 'Gift Ideas', slug: 'gift-ideas', image: accessoriesImage },
  { name: 'Premium Collection', slug: 'premium-collection', image: downloadImage },
];
const trustBadges = [
  { icon: ShieldCheck, label: 'Verified Listings', detail: 'Every item is reviewed before it goes live' },
  { icon: Truck, label: 'Discreet Shipping', detail: 'Tracked delivery with plain packaging' },
  { icon: RefreshCcw, label: 'Easy Returns', detail: 'Simple return flow on eligible items' },
  { icon: Sparkles, label: 'Transparent Pricing', detail: 'Prices are shown in naira' },
];
const heroMetrics = [
  { label: 'Curation', value: 'Hand-picked', detail: 'A tighter selection, not a noisy catalog.' },
  { label: 'Delivery', value: 'Discreet', detail: 'Clean packaging with a premium-first presentation.' },
  { label: 'Pricing', value: 'Clear', detail: 'No surprise markup and no cluttered price tags.' },
];
const marqueeItems = [
  'Verified products',
  'Discreet delivery',
  'Luxury visuals',
  'Transparent pricing',
  'Curated essentials',
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

function CategoryCard({ category, index }: { category: (typeof categoryShowcase)[number]; index: number }) {
  const query = useProducts({ category: category.slug, sort: 'newest', pageSize: '1' });
  const image = query.data?.[0]?.images?.[0]?.url || category.image.src;
  const title = query.data?.[0]?.title ? category.name + ' - ' + query.data[0].title : category.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link href={'/shop?category=' + category.slug} className='group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-white/5 bg-graphite/60'>
        <img src={image} alt={title} className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-110' />
        <div className='absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent' />
        <div className='absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-obsidian/80 to-transparent opacity-80' />
        <span className='absolute bottom-4 left-4 font-display text-lg font-semibold text-ivory'>{category.name}</span>
      </Link>
    </motion.div>
  );
}

function HeroMedia() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className='relative mx-auto w-full max-w-[560px]'
    >
      <div className='orbital-glow absolute -left-8 top-12 h-40 w-40 rounded-full bg-gold/20 blur-3xl' />
      <div className='floating-chip absolute -right-4 bottom-14 h-24 w-24 rounded-full border border-white/10 bg-white/[0.08] blur-xl' />
      <div className='hero-frame rounded-[2rem] border border-white/10 bg-charcoal/70 p-3 shadow-gold-lg'>
        <div className='relative aspect-[4/5] overflow-hidden rounded-[1.65rem] bg-graphite'>
          <Image
            src={tenImage}
            alt='Curated lifestyle products'
            fill
            priority
            quality={100}
            sizes='(max-width: 1024px) 100vw, 44vw'
            className='object-cover object-[center_22%] scale-[1.02]'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-obsidian/72 via-obsidian/12 to-transparent' />
          <div className='absolute inset-0 scanline-overlay opacity-25 mix-blend-screen' />
          <div
            className='absolute inset-0 animate-sheen opacity-70'
            style={{
              backgroundImage: 'linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
            }}
          />
          <div className='absolute left-4 top-4 rounded-full border border-gold/25 bg-obsidian/70 px-3 py-2 text-[11px] uppercase tracking-[0.3em] text-ivory/80 backdrop-blur-md'>
            Elite collection
          </div>
          <div className='absolute right-4 top-4 rounded-full border border-white/10 bg-charcoal/75 px-3 py-2 text-[11px] font-medium text-ivory/80 backdrop-blur-md'>
            Clean crop
          </div>
          <div className='absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-charcoal/[0.78] p-4 backdrop-blur-md'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='text-[11px] uppercase tracking-[0.28em] text-gold'>Fresh drop</p>
                <p className='mt-1 text-sm text-ivory/85'>Crisp imagery, discreet service, and premium categories in one place.</p>
              </div>
              <div className='floating-chip flex h-11 w-11 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-gold'>
                <Sparkles size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='floating-chip absolute -bottom-4 left-6 rounded-2xl border border-gold/20 bg-obsidian/[0.85] px-4 py-3 shadow-gold backdrop-blur-md'>
        <p className='text-[11px] uppercase tracking-[0.28em] text-gold'>Curated arrival</p>
        <p className='mt-1 text-sm text-ivory/85'>Balanced lighting, sharper edges, cleaner framing.</p>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const trendingToys = useProducts({ category: 'sexual-wellness', sort: 'newest', pageSize: '8' });
  const featuredWellness = useProducts({ category: 'sexual-wellness', sort: 'rating', pageSize: '4' });

  return (
    <main className='overflow-hidden'>
      <section className='relative overflow-hidden px-6 pb-24 pt-14 sm:pt-20 lg:pb-28'>
        <div className='absolute inset-0 bg-gradient-to-b from-charcoal/50 via-obsidian/10 to-obsidian' />
        <div
          className='absolute inset-0 animate-gradient-pan opacity-25'
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 0%, rgba(212,175,55,0.16), transparent 30%), radial-gradient(circle at 88% 10%, rgba(255,255,255,0.08), transparent 26%), linear-gradient(180deg, rgba(27,20,14,0.55), transparent 34%, rgba(12,9,7,0.96))',
            backgroundSize: '100% 100%, 100% 100%, 100% 100%',
          }}
        />
        <div
          className='absolute inset-0 animate-gradient-pan opacity-30'
          style={{
            backgroundImage:
              'linear-gradient(110deg, transparent 0%, transparent 42%, rgba(255,255,255,0.04) 50%, transparent 58%, transparent 100%)',
            backgroundSize: '200% 100%',
          }}
        />
        <AmbientBackground density={18} />
        <div className='relative z-10 mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]'>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className='relative z-10 max-w-2xl'
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='section-label mb-6'
            >
              <span>Shop With Class - Verified - Delivered</span>
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className='font-display text-5xl font-bold leading-[1.05] text-ivory drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)] sm:text-6xl lg:text-7xl'
            >
              Shop with class
              <br />for <span className='text-shimmer'>premium essentials</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className='mx-auto mt-6 max-w-2xl text-base text-ivory/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)] sm:text-lg dark:text-slate-light'
            >
              Explore a refined collection of premium sex toys, clothing, shoes, accessories, and intimate essentials, all with discreet delivery and affordable prices.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className='mt-10 flex flex-col justify-center gap-4 sm:flex-row'
            >
              <Link href='/shop' className='btn-gold'>
                Start Shopping <ArrowRight size={16} />
              </Link>
              <Link href='/adult-wellness' className='btn-ghost'>
                View Catalog Guide
              </Link>
            </motion.div>
            <div className='mt-10 grid max-w-2xl gap-3 sm:grid-cols-3'>
              {heroMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.08 }}
                  className='glass-panel rounded-2xl p-4'
                >
                  <p className='text-[11px] uppercase tracking-[0.32em] text-gold/80'>{metric.label}</p>
                  <p className='mt-2 font-display text-lg font-semibold text-ivory'>{metric.value}</p>
                  <p className='mt-1 text-sm leading-relaxed text-slate'>{metric.detail}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <HeroMedia />
        </div>
      </section>

      <section className='border-y border-white/5 bg-charcoal/30 px-6 py-10'>
        <div className='mx-auto grid max-w-6xl grid-cols-2 gap-8 sm:grid-cols-4'>
          {trustBadges.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className='glass-panel flex flex-col items-center gap-3 rounded-2xl px-4 py-4 text-center sm:flex-row sm:text-left'
            >
              <b.icon size={22} className='shrink-0 text-gold' />
              <div>
                <p className='text-sm font-semibold text-ivory'>{b.label}</p>
                <p className='text-xs text-slate'>{b.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className='border-b border-white/5 bg-gradient-to-b from-charcoal/20 to-transparent px-6 py-4'>
        <div className='moving-banner mx-auto max-w-7xl overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.04] py-3 backdrop-blur-md'>
          <div className='moving-banner__track flex w-[200%] items-center gap-8 px-4 text-xs uppercase tracking-[0.35em] text-ivory/75 sm:text-sm'>
            {marqueeItems.concat(marqueeItems).map((item, index) => (
              <span key={item + index}>{item}</span>
            ))}
          </div>
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
            <CategoryCard key={cat.slug} category={cat} index={i} />
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

function ProductGrid({
  query,
  columns = 4,
  emptyHint,
}: {
  query: ReturnType<typeof useProducts>;
  columns?: number;
  emptyHint?: string;
}) {
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
        <ProductCard key={p.id} product={p} index={i} fallbackImage={showcaseImages[i % showcaseImages.length]} />
      ))}
    </div>
  );
}

