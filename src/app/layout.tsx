import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "./providers";
import { WalletContextProvider } from "./components/providers/WalletProviderContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Blink Builder",
  description: "Your application description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletContextProvider>
          <SupabaseProvider>{children}</SupabaseProvider>
        </WalletContextProvider>
      </body>
    </html>
  );
}
