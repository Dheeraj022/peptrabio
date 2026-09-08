import type { Metadata } from 'next';
import { Orbitron, Inter } from 'next/font/google';
import './globals.css';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { AgeVerificationModal } from '@/components/layout/AgeVerificationModal';
import { CartProvider } from '@/context/CartContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { AuthProvider } from '@/context/AuthContext';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-orbitron',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PEPTRA BIO — Advanced Research Peptide Materials',
  description:
    'Precision synthesized research-grade peptides, neuropeptides, and cellular research materials with certified HPLC purity documentation for laboratory investigation.',
  keywords: [
    'research peptides',
    'analytical chemistry',
    'laboratory research',
    'Selank research',
    'Semax research',
    'BPC-157 research',
    'HPLC verified peptides',
  ],
  openGraph: {
    title: 'PEPTRA BIO — Research Peptide Materials',
    description: 'Precision synthesized research peptides with verified analytical batch documentation.',
    type: 'website',
  },
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-tech-grid">
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <AnnouncementBar />
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
              <AgeVerificationModal />
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
