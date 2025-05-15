import type { Metadata } from 'next';
import { Aldrich } from 'next/font/google';
import { WalletContextProvider } from './components/providers/WalletProviderContext';
import './globals.css';
import { SupabaseProvider } from './providers';
import { Toaster } from './components/ui/toaster';

const aldrich = Aldrich({ subsets: ['latin'], weight: '400' });

export const metadata: Metadata = {
  title: 'Blink Builder',
  description: 'Your application description',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={aldrich.className}>
        <WalletContextProvider>
          <SupabaseProvider>{children}</SupabaseProvider>
        </WalletContextProvider>
        <Toaster />
      </body>
    </html>
  );
}
