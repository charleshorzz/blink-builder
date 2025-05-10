import * as React from "react";
import { useState } from "react";
import LandingPage from "@/app/components/LandingPage";
import BuilderPage from "@/app/components/BuilderPage";
import { useToast } from "@/app/hooks/use-toast";
import RegisterModal from "@/app/components/RegisterModal";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const { toast } = useToast();

  const connectWallet = () => {
    // For demo purposes, we're generating a mock wallet address
    const mockWalletAddress = `0x${Math.random()
      .toString(16)
      .substring(2, 14)}`;
    setWalletAddress(mockWalletAddress);

    // Check if wallet already exists in database
    checkWalletExists(mockWalletAddress);
  };

  const checkWalletExists = async (address: string) => {
    try {
      const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("wallet_address", address)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        // User already exists, proceed to connect
        handleSuccessfulConnection();
      } else {
        // New user, show registration modal
        setShowRegisterModal(true);
      }
    } catch (error: any) {
      console.error("Error checking wallet:", error);
      toast({
        title: "Connection Error",
        description: "Failed to check wallet status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSuccessfulConnection = () => {
    toast({
      title: "Wallet Connected",
      description: "Your wallet has been successfully connected.",
    });
    setIsConnected(true);
    setShowRegisterModal(false);
  };

  return (
    <>
      {isConnected ? (
        <BuilderPage isLoggedIn={isConnected} />
      ) : (
        <LandingPage connectWallet={connectWallet} />
      )}

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={handleSuccessfulConnection}
        walletAddress={walletAddress}
      />
    </>
  );
};

export default Index;
