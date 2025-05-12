import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Wallet,
  Vote,
  ShoppingCart,
  Layers,
  Home,
  Settings,
  Link,
} from "lucide-react";
import TokenReceiveTemplate from "./templates/TokenReceiveTemplate";
import VotingTemplate from "./templates/VotingTemplate";
import NFTMarketplaceTemplate from "./templates/NFTMarketplaceTemplate";
import SellTokensTemplate from "./templates/SellTokensTemplate";
import GamblingTemplate from "./templates/GamblingTemplate";
import GamingTemplate from "./templates/GamingTemplate";
import { useToast } from "@/app/hooks/use-toast";
import TemplateCardScene from "./3D/TemplateCardScene";
import Navigation from "./Navigation";

type TemplateType =
  | "token-receive"
  | "voting"
  | "nft-marketplace"
  | "sell-tokens"
  | "gambling"
  | "gaming"
  | null;

const BuilderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("receive");
  const [projectName, setProjectName] = useState("My Web3 App");
  const [link, setLink] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(null);
  const { toast } = useToast();

  const generateLink = () => {
    if (!selectedTemplate) {
      toast({
        title: "No Template Selected",
        description: "Please select a template first.",
        variant: "destructive",
      });
      return;
    }

    // This would typically connect to a backend to generate a unique link and save the template
    const randomId = Math.random().toString(36).substr(2, 9);
    setLink(`https://blockbuilder.app/${randomId}`);

    toast({
      title: "Link Generated!",
      description: "Your application link has been created successfully.",
    });
  };

  const renderSelectedTemplate = () => {
    switch (selectedTemplate) {
      case "token-receive":
        return <TokenReceiveTemplate customizable={true} />;
      case "voting":
        return <VotingTemplate customizable={true} />;
      case "nft-marketplace":
        return <NFTMarketplaceTemplate customizable={true} />;
      case "sell-tokens":
        return <SellTokensTemplate customizable={true} />;
      case "gambling":
        return <GamblingTemplate customizable={true} />;
      case "gaming":
        return <GamingTemplate customizable={true} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center text-center p-6 h-full">
            <p className="text-lg font-medium mb-4">
              Select a template to get started
            </p>
            <p className="text-muted-foreground max-w-md">
              Choose a template from the sidebar to begin building your Web3
              application.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen animated-bg">
      <Navigation />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden pt-20">
        {/* Left Sidebar - Templates */}
        <div className="w-64 border-r border-white/10 bg-background/30 backdrop-blur-md p-4 overflow-y-auto hidden md:block">
          <h2 className="font-medium mb-4 text-gradient">Templates</h2>
          <div className="space-y-3">
            <Card
              className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${
                selectedTemplate === "token-receive" ? "gradient-border" : ""
              }`}
              onClick={() => setSelectedTemplate("token-receive")}
            >
              <div className="flex items-center gap-3">
                <div className="text-builder-primary">
                  <Wallet size={18} />
                </div>
                <span className="text-sm font-medium">Token Receive</span>
              </div>
            </Card>

            <Card
              className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${
                selectedTemplate === "voting" ? "gradient-border" : ""
              }`}
              onClick={() => setSelectedTemplate("voting")}
            >
              <div className="flex items-center gap-3">
                <div className="text-builder-primary">
                  <Vote size={18} />
                </div>
                <span className="text-sm font-medium">DAO Voting</span>
              </div>
            </Card>

            <Card
              className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${
                selectedTemplate === "nft-marketplace" ? "gradient-border" : ""
              }`}
              onClick={() => setSelectedTemplate("nft-marketplace")}
            >
              <div className="flex items-center gap-3">
                <div className="text-builder-primary">
                  <ShoppingCart size={18} />
                </div>
                <span className="text-sm font-medium">NFT Marketplace</span>
              </div>
            </Card>

            <Card
              className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${
                selectedTemplate === "sell-tokens" ? "gradient-border" : ""
              }`}
              onClick={() => setSelectedTemplate("sell-tokens")}
            >
              <div className="flex items-center gap-3">
                <div className="text-builder-primary">
                  <Layers size={18} />
                </div>
                <span className="text-sm font-medium">Sell Tokens</span>
              </div>
            </Card>

            <Card
              className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${
                selectedTemplate === "gambling" ? "gradient-border" : ""
              }`}
              onClick={() => setSelectedTemplate("gambling")}
            >
              <div className="flex items-center gap-3">
                <div className="text-builder-primary">
                  <Layers size={18} />
                </div>
                <span className="text-sm font-medium">Gambling</span>
              </div>
            </Card>

            <Card
              className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${
                selectedTemplate === "gaming" ? "gradient-border" : ""
              }`}
              onClick={() => setSelectedTemplate("gaming")}
            >
              <div className="flex items-center gap-3">
                <div className="text-builder-primary">
                  <Layers size={18} />
                </div>
                <span className="text-sm font-medium">Gaming</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Preview Area */}
          <div className="flex-1 p-6 overflow-y-auto builder-grid">
            <div className="container mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-medium mb-3 text-gradient">
                  Template Preview
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select a template from the sidebar to preview.
                </p>
              </div>

              <Card className="p-6 min-h-[400px] backdrop-blur-sm bg-card/50 border-white/10">
                {renderSelectedTemplate()}
              </Card>

              {link && (
                <div className="mt-6 p-4 neo-blur rounded-lg animate-slide-up">
                  <Label htmlFor="generated-link">Your Generated Link:</Label>
                  <div className="flex mt-2">
                    <Input
                      id="generated-link"
                      value={link}
                      readOnly
                      className="flex-1 bg-background/50"
                    />
                    <Button
                      variant="secondary"
                      className="ml-2"
                      onClick={() => {
                        navigator.clipboard.writeText(link);
                        toast({ title: "Copied to clipboard" });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Tab Bar - Mobile Navigation */}
          <div className="md:hidden border-t border-white/10 bg-background/30 backdrop-blur-md p-2">
            <div className="flex justify-around">
              <Button
                variant={activeTab === "receive" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setActiveTab("receive")}
              >
                <Wallet size={20} />
              </Button>
              <Button
                variant={activeTab === "voting" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setActiveTab("voting")}
              >
                <Vote size={20} />
              </Button>
              <Button
                variant={activeTab === "nft" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setActiveTab("nft")}
              >
                <ShoppingCart size={20} />
              </Button>
              <Button
                variant={activeTab === "more" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setActiveTab("more")}
              >
                <Layers size={20} />
              </Button>
              <Button
                variant={activeTab === "settings" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setActiveTab("settings")}
              >
                <Settings size={20} />
              </Button>
            </div>

            {/* Mobile Template Selection */}
            <div className="p-4">
              {activeTab === "receive" && (
                <div className="space-y-4">
                  <h3 className="font-medium">Token Receiving</h3>
                  <Button
                    className="w-full justify-start"
                    onClick={() => setSelectedTemplate("token-receive")}
                  >
                    <Wallet size={16} className="mr-2" />
                    Use Token Receive Template
                  </Button>
                </div>
              )}
              {activeTab === "voting" && (
                <div className="space-y-4">
                  <h3 className="font-medium">DAO Voting</h3>
                  <Button
                    className="w-full justify-start"
                    onClick={() => setSelectedTemplate("voting")}
                  >
                    <Vote size={16} className="mr-2" />
                    Use Voting Template
                  </Button>
                </div>
              )}
              {activeTab === "nft" && (
                <div className="space-y-4">
                  <h3 className="font-medium">NFT Marketplace</h3>
                  <Button
                    className="w-full justify-start"
                    onClick={() => setSelectedTemplate("nft-marketplace")}
                  >
                    <ShoppingCart size={16} className="mr-2" />
                    Use NFT Marketplace
                  </Button>
                </div>
              )}
              {activeTab === "more" && (
                <div className="space-y-4">
                  <h3 className="font-medium">More Templates</h3>
                  <Button
                    className="w-full justify-start mb-2"
                    onClick={() => setSelectedTemplate("sell-tokens")}
                  >
                    <Layers size={16} className="mr-2" />
                    Use Sell Tokens Template
                  </Button>
                  <Button
                    className="w-full justify-start mb-2"
                    onClick={() => setSelectedTemplate("gambling")}
                  >
                    <Layers size={16} className="mr-2" />
                    Use Gambling Template
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => setSelectedTemplate("gaming")}
                  >
                    <Layers size={16} className="mr-2" />
                    Use Gaming Template
                  </Button>
                </div>
              )}
              {activeTab === "settings" && (
                <div className="space-y-4">
                  <h3 className="font-medium">Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="project-name-mobile">Project Name</Label>
                      <Input
                        id="project-name-mobile"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="mt-1 bg-background/50"
                      />
                    </div>
                    <Button
                      onClick={generateLink}
                      disabled={!selectedTemplate}
                      className="w-full"
                    >
                      Generate Link
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderPage;
