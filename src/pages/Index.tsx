
import * as React from 'react';
import { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import BuilderPage from '@/components/BuilderPage';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const connectWallet = () => {
    // This would typically integrate with web3 wallet providers
    // For this demo, we'll just simulate a connection
    toast({
      title: "Wallet Connected",
      description: "Your wallet has been successfully connected.",
    });
    setIsConnected(true);
  };

  return isConnected ? (
    <BuilderPage isLoggedIn={isConnected} />
  ) : (
    <LandingPage connectWallet={connectWallet} />
  );
};

export default Index;
