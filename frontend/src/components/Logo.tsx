import Link from "next/link";

export default function Logo({ size = 40 }: { size?: number }) {
  const minWidth = Math.max(48, Math.round(size * 1.6));
  const maxWidth = Math.max(minWidth + 8, Math.round(size * 2.6));
  const width = "clamp(" + minWidth + "px, 18vw, " + maxWidth + "px)";

  return (
    <Link href="/" className="inline-flex items-center shrink-0" aria-label="Elite X Shop home">
      <picture>
        <source srcSet="/elite-logo.svg" type="image/svg+xml" />
        <img
          src="/elite-logo.jpg"
          alt="Elite X Shop logo"
          width={1200}
          height={320}
          loading="eager"
          decoding="async"
          style={{ width, height: "auto" }}
          className="block max-w-full transition-transform duration-500 hover:scale-[1.01]"
        />
      </picture>
    </Link>
  );
}
