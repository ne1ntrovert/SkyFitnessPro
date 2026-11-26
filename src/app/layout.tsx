import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import AuthModal from '@/components/AuthModal/AuthModal';
import Header from '@/components/Header/Header';
import { AuthProvider } from '@/context/AuthContext/AuthContext';
import './globals.css';

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'SkyFitnessPro',
  description: 'Онлайн-тренировки для занятий дома',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ru" className={roboto.variable}>
      <body>
        <AuthProvider>
          <Header />
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
