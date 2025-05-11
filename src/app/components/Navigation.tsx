// components/Navigation.tsx
"use client"; // Add the use client directive

import React from "react";
// Keep Button and Link imports if they are used elsewhere in the Navigation component
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

// Import the necessary hooks and components from wallet adapter UI
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

// Remove props
const Navigation: React.FC = () => {
  // Use the useWallet hook to get the connection status
  const { connected } = useWallet();

  return (
    <header className="w-full py-4 px-6 flex items-center justify-between neo-blur fixed top-0 left-0 right-0 z-50 border-b border-white/10">
      <div className=" items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo-white.png"
            alt="Logo"
            className="h-[1.25rem] w-[1.25rem] rounded-full object-cover"
          />
          <span className="font-bold text-xl tracking-tight text-gradient">
            BlockBuilder
          </span>
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        <Link
          href="/"
          className="text-sm font-medium hover:text-builder-accent transition-colors"
        >
          Home
        </Link>
        {/* Place the "Go to Builder" link/button here, conditional on connection */}
        {connected && (
          <Link
            href="/test"
            className="text-sm font-medium hover:text-builder-accent transition-colors"
          >
            Builder
          </Link>
          // Or as a button within the nav:
          // <Link href="/builder">
          //    <Button variant="ghost" size="sm">Go to Builder</Button>
          // </Link>
        )}
      </nav>

      <div className="flex items-center gap-4">
        {/* Render the WalletMultiButton here directly */}
        {/* It handles showing "Connect Wallet" or the address/disconnect button */}
        <WalletMultiButton />

        {/* Remove the old conditional logic that showed either a custom button or "Go to Builder" */}
        {/* The WalletMultiButton now occupies this spot and changes based on connection status */}
      </div>
    </header>
  );
};

export default Navigation;
