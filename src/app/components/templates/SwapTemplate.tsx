import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { Layers } from 'lucide-react';

interface SwapTemplateProps {
  customizable?: boolean;
  onCustomize?: () => void;
}

const SwapTemplate: React.FC<SwapTemplateProps> = ({
  customizable = false,
  onCustomize,
}) => {
  return (
    // <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-card/80 border-white/10">
    <Card className="w-full backdrop-blur-sm bg-card/80 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers size={20} className="text-builder-accent" />
          Sell Tokens
        </CardTitle>
        <CardDescription>Create a token sale for your project</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tokenSymbol">Token Symbol</Label>
          <Input id="tokenSymbol" placeholder="BTC" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tokenAmount">Amount to Sell</Label>
          <div className="flex items-center">
            <Input id="tokenAmount" type="number" placeholder="0.0" />
            <div className="bg-muted px-3 py-2 ml-2 rounded text-sm font-medium">
              Tokens
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tokenPrice">Price per Token</Label>
          <div className="flex items-center">
            <Input id="tokenPrice" type="number" placeholder="0.0" />
            <div className="bg-muted px-3 py-2 ml-2 rounded text-sm font-medium">
              ETH
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {customizable && (
          <Button variant="outline" onClick={onCustomize}>
            Customize
          </Button>
        )}
        <Button className="w-full">Create Sale</Button>
      </CardFooter>
    </Card>
  );
};

export default SwapTemplate;
