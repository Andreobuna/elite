import type { Metadata } from 'next';
import { Playfair_Display, Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['500', '600', '700', '800', '900'],
  display: 'swap',
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space', display: 'swap' });

export const metadata: Metadata = {
  title: 'Elite X Shop - Adult Wellness, Curated in One Place',
  description:
    'Elite X Shop brings sexual wellness essentials, couples products, massagers, and lubricants into a discreet shopping experience with transparent pricing.',
};

const themeScript = `
(function () {
  try {
    var root = document.documentElement;
    var stored = localStorage.getItem('elite-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
    root.classList.toggle('light', theme === 'light');
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  } catch (err) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${inter.variable} ${spaceGrotesk.variable} dark`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-obsidian font-body antialiased text-ivory">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

