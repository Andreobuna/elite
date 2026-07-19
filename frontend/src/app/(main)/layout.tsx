import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-obsidian">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
