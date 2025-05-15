// app/providers/WalletContextProvider.tsx
"use client"; // This provider needs to be a client component

import React, { FC, useMemo, ReactNode } from "react"; // Import ReactNode
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  UnsafeBurnerWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";
import { clusterApiUrl } from "@solana/web3.js";

interface WalletContextProviderProps {
  children: ReactNode;
}

// Renamed the component to clearly indicate its role as a provider wrapper
export const WalletContextProvider: FC<WalletContextProviderProps> = ({
  children,
}) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet; // Or your desired network

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      /**
       * Wallets that implement either of these standards will be available automatically.
       *
       * - Solana Mobile Stack Mobile Wallet Adapter Protocol
       * (https://github.com/solana-mobile/mobile-wallet-adapter)
       * - Solana Wallet Standard
       * (https://github.com/anza-xyz/wallet-standard)
       *
       * If you wish to support a wallet that supports neither of those standards,
       * instantiate its legacy wallet adapter here. Common legacy adapters can be found
       * in the npm package `@solana/wallet-adapter-wallets`.
       */
      // new UnsafeBurnerWalletAdapter(), // Keep for example, but add more like PhantomWalletAdapter
      // Add other wallet adapters you want to support here, e.g.:
      new PhantomWalletAdapter(),
      // If applicable
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
