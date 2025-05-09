
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layers } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface GamblingTemplateProps {
  customizable?: boolean;
  onCustomize?: () => void;
}

const GamblingTemplate: React.FC<GamblingTemplateProps> = ({ customizable = false, onCustomize }) => {
  const [betAmount, setBetAmount] = useState<string>('0.1');
  const [probability, setProbability] = useState<number>(50);

  // Calculate potential winnings based on probability
  const multiplier = 100 / probability * 0.97; // 3% house edge
  const potentialWin = parseFloat(betAmount) * multiplier;

  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-card/80 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers size={20} className="text-builder-accent" />
          Chance Dapp
        </CardTitle>
        <CardDescription>Test your luck on the blockchain</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="betAmount">Bet Amount (ETH)</Label>
          <Input 
            id="betAmount" 
            type="number" 
            value={betAmount} 
            onChange={(e) => setBetAmount(e.target.value)} 
            min="0.01" 
            step="0.01"
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label htmlFor="probability">Win Probability: {probability}%</Label>
            <span className="text-sm text-builder-accent">{multiplier.toFixed(2)}x</span>
          </div>
          <Input 
            id="probability" 
            type="range" 
            min="1" 
            max="98" 
            value={probability} 
            onChange={(e) => setProbability(parseInt(e.target.value))} 
            className="w-full"
          />
          <Progress value={probability} className="h-2" />
        </div>
        
        <div className="rounded-lg bg-muted p-3">
          <div className="flex justify-between text-sm">
            <span>Potential Win:</span>
            <span className="font-semibold text-builder-accent">{potentialWin.toFixed(4)} ETH</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {customizable && (
          <Button variant="outline" onClick={onCustomize}>Customize</Button>
        )}
        <Button className="w-full">Place Bet</Button>
      </CardFooter>
    </Card>
  );
};

export default GamblingTemplate;
