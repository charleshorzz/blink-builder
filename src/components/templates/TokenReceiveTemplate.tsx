
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

interface TokenReceiveTemplateProps {
  customizable?: boolean;
  onCustomize?: () => void;
}

const TokenReceiveTemplate: React.FC<TokenReceiveTemplateProps> = ({ customizable = false, onCustomize }) => {
  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-card/80 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet size={20} className="text-builder-accent" />
          Receive Tokens
        </CardTitle>
        <CardDescription>Enter an amount and recipient address</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tokenAmount">Amount</Label>
          <div className="flex items-center">
            <Input id="tokenAmount" type="number" placeholder="0.0" className="bg-background/50" />
            <div className="bg-muted px-3 py-2 ml-2 rounded text-sm font-medium">ETH</div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="recipientAddress">Recipient Address</Label>
          <Input id="recipientAddress" placeholder="0x..." className="bg-background/50" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {customizable && (
          <Button variant="outline" onClick={onCustomize} className="gradient-border">Customize</Button>
        )}
        <Button className="w-full gradient-border bg-builder-accent hover:bg-builder-accent/80">Send Tokens</Button>
      </CardFooter>
    </Card>
  );
};

export default TokenReceiveTemplate;
