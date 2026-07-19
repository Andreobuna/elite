import Image from 'next/image';
import Link from 'next/link';

export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-3 group" aria-label="Elite X Shop home">
      <div className="relative shrink-0 overflow-hidden rounded-2xl border border-gold/25 bg-charcoal/70 shadow-gold" style={{ width: size, height: size }}>
        <Image
          src="/elite-logo.jpg"
          alt="Elite X Shop logo"
          fill
          priority
          sizes="40px"
          className="object-contain p-1.5 transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <span className="font-display text-xl font-semibold tracking-wide text-ivory">
        Elite <span className="text-shimmer">X</span> Shop
      </span>
    </Link>
  );
}
