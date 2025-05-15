// components/Navigation.tsx
"use client";

import React, { useEffect, useState } from "react";
// Keep other imports
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

// No props needed for Navigation
// const Navigation: React.FC = () => {
const Navigation: React.FC = () => {
  const { connected } = useWallet();

  // State to track if the component has mounted on the client
  const [isClient, setIsClient] = useState(false);

  // useEffect to set isClient to true after the component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="w-full py-4 px-6 flex items-center justify-between neo-blur fixed top-0 left-0 right-0 z-50 border-b border-white/10">
      {/* ... (Logo and Brand) ... */}
      <div className=" items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo-white.png"
            alt="Logo"
            className="h-[1.25rem] w-[1.25rem] rounded-full object-cover"
          />
          <span className="font-bold text-xl tracking-tight text-gradient">
            Blink Builder
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {isClient ? (
          // Render the actual WalletMultiButton on the client after mount
          <WalletMultiButton />
        ) : (
          // Render the spinner container with the spinner inside while waiting for client-side mount
          <div className="spinner-container">
            {" "}
            {/* Use the container class */}
            <div className="simple-spinner"></div> {/* Use the spinner class */}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
