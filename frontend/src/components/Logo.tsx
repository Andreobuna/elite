import Link from 'next/link'
import Image from 'next/image'
import damLogo from '../../dam.png'

export default function Logo({ size = 40 }: { size?: number }) {
  const minWidth = Math.max(36, Math.round(size * 1.2))
  const maxWidth = Math.max(minWidth + 6, Math.round(size * 1.7))
  const width = 'clamp(' + minWidth + 'px, 12vw, ' + maxWidth + 'px)'

  return (
    <Link href='/' className='inline-flex items-center shrink-0' aria-label='Elite X Shop home'>
      <Image
        src={damLogo}
        alt='Elite X Shop logo'
        priority
        style={{ width, height: 'auto' }}
        className='block max-w-full transition-transform duration-500 hover:scale-[1.01]'
      />
    </Link>
  )
}
