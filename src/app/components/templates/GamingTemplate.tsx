import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/app/components/ui/tabs';
import { Layers } from 'lucide-react';

interface GamingTemplateProps {
  customizable?: boolean;
  onCustomize?: () => void;
}

const GamingTemplate: React.FC<GamingTemplateProps> = ({
  customizable = false,
  onCustomize,
}) => {
  return (
    // <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-card/80 border-white/10">
    <Card className="w-full backdrop-blur-sm bg-card/80 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers size={20} className="text-builder-accent" />
          Web3 Game Portal
        </CardTitle>
        <CardDescription>Play-to-earn blockchain games</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="popular" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="popular" className="flex-1">
              Popular
            </TabsTrigger>
            <TabsTrigger value="my-games" className="flex-1">
              My Games
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex-1">
              Rewards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="popular" className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  name: 'Crypto Raiders',
                  players: '2.5K',
                  rewards: '0.05 ETH',
                },
                { name: 'Block Battles', players: '1.8K', rewards: '180 BLK' },
                { name: 'Meta Racers', players: '3.2K', rewards: '12 MRC' },
                { name: 'Dungeon DAO', players: '950', rewards: '0.02 ETH' },
              ].map((game, i) => (
                <div
                  key={i}
                  className="border border-white/10 rounded-lg overflow-hidden hover-effect"
                >
                  <div
                    className={`h-20 bg-gradient-to-br ${
                      i % 2 === 0
                        ? 'from-indigo-500/20 to-purple-500/20'
                        : 'from-purple-500/20 to-pink-500/20'
                    }`}
                  ></div>
                  <div className="p-3">
                    <div className="text-sm font-medium">{game.name}</div>
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>👥 {game.players}</span>
                      <span>🏆 {game.rewards}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full mt-2 text-xs"
                    >
                      Play Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-games" className="pt-4">
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Connect your wallet to view your games
              </p>
              <Button variant="outline" className="mt-4">
                Connect Wallet
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="pt-4">
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Complete quests and earn rewards by playing games in our
                ecosystem
              </p>
              <div className="mt-4 bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium">Total Rewards Available</p>
                <p className="text-xl font-bold text-builder-accent mt-1">
                  2.5 ETH
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      {customizable && (
        <CardFooter>
          <Button variant="outline" onClick={onCustomize} className="w-full">
            Customize This Template
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default GamingTemplate;
