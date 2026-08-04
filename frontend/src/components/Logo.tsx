import Link from "next/link";

export default function Logo({ size = 40 }: { size?: number }) {
  const maxWidth = Math.round(size * 3);
  const minWidth = Math.max(80, Math.round(size * 2.1));
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
