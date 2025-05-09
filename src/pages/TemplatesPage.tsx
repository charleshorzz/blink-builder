
import React from 'react';
import Navigation from '@/components/Navigation';
import { Button } from "@/components/ui/button";

const TemplatesPage = () => {
  // Mock function for connecting wallet
  const connectWallet = () => {
    console.log("Connect wallet clicked from templates page");
  };

  return (
    <div className="min-h-screen flex flex-col animated-bg">
      <Navigation isLoggedIn={false} connectWallet={connectWallet} />
      
      <div className="container mx-auto pt-32 px-4">
        <h1 className="text-4xl font-bold mb-8 text-gradient">Templates</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-8">
          Choose from our professionally designed templates to kickstart your Web3 project.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Template placeholders */}
          {[
            { name: "Token Receiver", description: "Accept token payments with a simple form" },
            { name: "DAO Voting", description: "Create proposals and collect community votes" },
            { name: "NFT Marketplace", description: "Buy, sell and trade NFTs in a custom marketplace" },
            { name: "Sell Tokens", description: "Create a platform to sell your own tokens" },
            { name: "Gambling", description: "Build a decentralized gambling application" },
            { name: "Gaming", description: "Create Web3 games with blockchain integration" }
          ].map((template, i) => (
            <div key={i} className="border border-white/10 rounded-lg p-6 backdrop-blur-md hover:shadow-lg transition-all">
              <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
              <p className="text-muted-foreground mb-4">{template.description}</p>
              <Button className="w-full bg-builder-accent hover:bg-builder-accent/80">
                Use Template
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;
