
import React from 'react';
import Navigation from '@/components/Navigation';
import { Button } from "@/components/ui/button";
import TemplateImage from '@/components/TemplateImage';

const TemplatesPage = () => {
  // Mock function for connecting wallet
  const connectWallet = () => {
    console.log("Connect wallet clicked from templates page");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0c111b] via-[#121a2c] to-[#1c2742]">
      <Navigation isLoggedIn={false} connectWallet={connectWallet} />
      
      <div className="container mx-auto pt-32 px-4">
        <h1 className="text-4xl font-bold mb-8 text-gradient">Templates</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-8">
          Choose from our professionally designed templates to kickstart your Web3 project.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Template items */}
          {[
            { 
              name: "Token Receiver", 
              description: "Accept token payments with a simple form", 
              image: "/blockchain-card.jpeg"
            },
            { 
              name: "DAO Voting", 
              description: "Create proposals and collect community votes", 
              image: "/blockchain-card.jpeg" 
            },
            { 
              name: "NFT Marketplace", 
              description: "Buy, sell and trade NFTs in a custom marketplace", 
              image: "/blockchain-card.jpeg" 
            },
            { 
              name: "Sell Tokens", 
              description: "Create a platform to sell your own tokens", 
              image: "/blockchain-card.jpeg" 
            },
            { 
              name: "Gambling", 
              description: "Build a decentralized gambling application", 
              image: "/blockchain-card.jpeg" 
            },
            { 
              name: "Gaming", 
              description: "Create Web3 games with blockchain integration", 
              image: "/blockchain-card.jpeg" 
            }
          ].map((template, i) => (
            <div key={i} className="border border-[#38c6f4]/20 rounded-lg overflow-hidden backdrop-blur-md hover:shadow-lg transition-all hover:shadow-[#38c6f4]/20">
              <div className="h-36">
                <TemplateImage 
                  imageUrl={template.image} 
                  title={template.name} 
                  className="h-full"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                <p className="text-muted-foreground mb-4">{template.description}</p>
                <Button className="w-full bg-gradient-to-r from-[#38c6f4] to-[#1a9ef4] hover:from-[#38c6f4] hover:to-[#4a9eff] border-none">
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;
