import Link from 'next/link'
import Image from 'next/image'

export default function Logo({ size = 86 }: { size?: number }) {
  const width = Math.max(72, size)
  const height = Math.max(28, Math.round(width * 0.34))

  return (
    <Link href='/' className='inline-flex shrink-0 items-center' aria-label='Elite X Shop home'>
      <span className='relative block' style={{ width: width + 'px', height: height + 'px' }}>
        <Image
          src='/dam.png'
          alt='Elite X Shop logo'
          fill
          priority
          sizes={width + 'px'}
          className='object-contain transition-transform duration-300 hover:scale-[1.01]'
        />
      </span>
    </Link>
  )
}
