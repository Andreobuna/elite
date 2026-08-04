import Image from 'next/image';
import Link from 'next/link';

export default function Logo({ size = 40 }: { size?: number }) {
  const width = Math.round(size * 4.1);

  return (
    <Link href="/" className="inline-flex items-center" aria-label="Elite X Shop home">
      <Image
        src="/elite-logo.svg"
        alt="Elite X Shop logo"
        width={width}
        height={size}
        priority
        sizes={width + 'px'}
        className="h-auto w-auto max-w-full transition-transform duration-500 hover:scale-[1.01]"
      />
    </Link>
  );
}

