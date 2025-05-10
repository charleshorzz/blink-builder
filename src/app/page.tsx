"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LandingPage from "./components/LandingPage";
import { WalletConnectModal } from "./components/WalletConnectModal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const connectWallet = () => {
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    try {
      setIsModalOpen(false);
      console.log("Connecting wallet...");
      await router.replace("/test");
    } catch (error) {
      console.error("Navigation failed:", error);
    }
  };

  return (
    <>
      <LandingPage connectWallet={connectWallet} />
      <WalletConnectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
