import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { ShoppingCart } from "lucide-react";

interface NFTMarketplaceTemplateProps {
  customizable?: boolean;
  onCustomize?: () => void;
}

const NFTMarketplaceTemplate: React.FC<NFTMarketplaceTemplateProps> = ({
  customizable = false,
  onCustomize,
}) => {
  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-card/80 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-builder-accent" />
            <h2 className="font-semibold text-lg">NFT Marketplace</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-builder-accent/20"
          >
            Connect Wallet
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="explore" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="explore" className="flex-1">
              Explore
            </TabsTrigger>
            <TabsTrigger value="owned" className="flex-1">
              Your NFTs
            </TabsTrigger>
            <TabsTrigger value="create" className="flex-1">
              Create
            </TabsTrigger>
          </TabsList>
          <TabsContent value="explore" className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="border border-white/10 rounded-lg overflow-hidden hover-effect"
                >
                  <div
                    className={`h-32 bg-gradient-to-br ${
                      item % 2 === 0
                        ? "from-purple-500/20 to-blue-500/20"
                        : "from-pink-500/20 to-purple-500/20"
                    }`}
                  ></div>
                  <div className="p-3">
                    <div className="text-sm font-medium">NFT #{item}</div>
                    <div className="text-xs text-muted-foreground">
                      0.05 ETH
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full mt-2 text-xs hover:bg-builder-accent hover:text-white"
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="owned" className="pt-4">
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Connect your wallet to view your NFTs
              </p>
            </div>
          </TabsContent>
          <TabsContent value="create" className="pt-4">
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Connect your wallet to create an NFT
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      {customizable && (
        <CardFooter>
          <Button
            variant="outline"
            onClick={onCustomize}
            className="w-full gradient-border"
          >
            Customize This Template
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default NFTMarketplaceTemplate;
