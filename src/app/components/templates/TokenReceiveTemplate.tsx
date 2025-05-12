"use client";

import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Blink, useBlink } from "@dialectlabs/blinks";
import { useBlinkSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana";
import "@dialectlabs/blinks/index.css";
import { Wallet } from "lucide-react";
import React from "react";
import BlinkSkeleton from "../BlinkSkeleton";

interface TokenReceiveTemplateProps {
  customizable?: boolean;
  onCustomize?: () => void;
}

const TokenReceiveTemplate: React.FC<TokenReceiveTemplateProps> = ({
  customizable = false,
  onCustomize,
}) => {
  // The route api with the GET & POST logic
  const blinkApiUrl = "http://localhost:3000/api/actions/donate-sol";

  // Adapter, used to connect to the wallet
  const { adapter } = useBlinkSolanaWalletAdapter(
    "https://api.devnet.solana.com"
  );

  // Blink we want to execute
  const { blink, isLoading, refresh } = useBlink({ url: blinkApiUrl });

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* Left: User Input */}
      {/* <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-card/80 border-white/10"> */}
      <Card className="w-full backdrop-blur-sm bg-card/80 border-white/10 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet size={20} className="text-builder-accent" />
            Receive Tokens
          </CardTitle>
          <CardDescription>
            Enter an amount and recipient address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tokenAmount">Amount</Label>
            <div className="flex items-center">
              <Input
                id="tokenAmount"
                type="number"
                placeholder="0.0"
                className="bg-background/50"
              />
              <div className="bg-muted px-3 py-2 ml-2 rounded text-sm font-medium">
                ETH
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipientAddress">Recipient Address</Label>
            <Input
              id="recipientAddress"
              placeholder="0x..."
              className="bg-background/50"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {customizable && (
            <Button
              variant="outline"
              onClick={onCustomize}
              className="gradient-border"
            >
              Customize
            </Button>
          )}
          <Button className="w-full gradient-border bg-builder-accent hover:bg-builder-accent/80">
            Send Tokens
          </Button>
        </CardFooter>
      </Card>

      {/* Right: BlinkCard */}
      {isLoading || !blink ? (
        <BlinkSkeleton />
      ) : (
        <div className="w-full max-w-2xl">
          <Blink
            blink={blink}
            adapter={adapter}
            securityLevel="all"
            stylePreset="x-dark"
          />
        </div>
      )}
    </div>
  );
};

export default TokenReceiveTemplate;
