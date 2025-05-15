import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Layers } from 'lucide-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useToast } from '@/app/components/ui/use-toast';
import { Transaction, VersionedTransaction } from '@solana/web3.js';

// Example NBA playoff series data
const nbaSeries = [
  {
    id: 1,
    teams: ['Knicks', 'Celtics'],
    time: 'Thu 7:00AM',
    logos: [
      'https://upload.wikimedia.org/wikipedia/en/2/25/New_York_Knicks_logo.svg',
      'https://upload.wikimedia.org/wikipedia/en/8/8f/Boston_Celtics.svg',
    ],
  },
  {
    id: 2,
    teams: ['Warriors', 'Timberwolves'],
    time: 'Thu 9:30AM',
    logos: [
      'https://upload.wikimedia.org/wikipedia/en/0/01/Golden_State_Warriors_logo.svg',
      'https://upload.wikimedia.org/wikipedia/en/c/c2/Minnesota_Timberwolves_logo.svg',
    ],
  },
];

const GamblingTemplate: React.FC = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState<string>('0.1');
  const [selectedSeries, setSelectedSeries] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [showBlink, setShowBlink] = useState(false);
  const [miniblinkUrl, setMiniblinkUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper to get the selected series and team names
  const selectedSeriesObj = nbaSeries.find((s) => s.id === selectedSeries);
  const selectedTeamName = selectedSeriesObj && selectedTeam !== null ? selectedSeriesObj.teams[selectedTeam] : '';
  const seriesLabel = selectedSeriesObj ? `${selectedSeriesObj.teams[0]} vs ${selectedSeriesObj.teams[1]}` : '';

  // Handler for placing a bet, sending transaction, and generating miniblink
  const handlePlaceBet = async () => {
    if (!publicKey || !selectedSeriesObj || !selectedTeamName || !betAmount) {
      toast({ title: 'Please select a series, team, and enter amount', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setShowBlink(false);
    try {
      console.log('Placing bet with:', {
        creator: publicKey.toBase58(),
        series: seriesLabel,
        amount: betAmount,
        side: selectedTeamName,
        account: publicKey.toBase58(),
      });
      const res = await fetch('/api/actions/gamble-sol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator: publicKey.toBase58(),
          series: seriesLabel,
          amount: betAmount,
          side: selectedTeamName,
          account: publicKey.toBase58(),
          time: selectedSeriesObj.time,
        }),
      });
      console.log('API response:', res);
      if (!res.ok) throw new Error('Failed to create bet');
      const data = await res.json();
      console.log('API data:', data);

      const tx = data.transaction;
      console.log('Serialized transaction:', tx);
      const transaction = VersionedTransaction.deserialize(Buffer.from(tx, 'base64'));
      console.log('Deserialized transaction:', transaction);

      const latestBlockhash = await connection.getLatestBlockhash();
      const txid = await sendTransaction(transaction, connection);
      console.log('Transaction sent, txid:', txid);

      // Show the Miniblink link immediately
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const fullBlinkUrl = data.blinkUrl.startsWith("http") ? data.blinkUrl : `${baseUrl}${data.blinkUrl}`;
      setMiniblinkUrl(`https://dial.to/?action=solana-action%3A${encodeURIComponent(fullBlinkUrl)}`);
      setShowBlink(true);
      toast({ title: 'Bet sent! Generating blink...' });
      toast({ title: 'Blink created successfully! Share with your friends now!' });

      // Confirm in the background
      connection.confirmTransaction({
        signature: txid,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      }).then(() => {
        toast({ title: 'Transaction confirmed!' });
        console.log('Transaction confirmed');
      }).catch((e) => {
        toast({ title: 'Transaction confirmation failed', variant: 'destructive' });
        console.error('Transaction confirmation error:', e);
      });
    } catch (e) {
      console.error('Error in handlePlaceBet:', e);
      toast({ title: 'Failed to place bet', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full backdrop-blur-sm bg-card/80 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers size={20} className="text-builder-accent" />
          NBA Games
        </CardTitle>
        <div className="mt-2 text-lg font-semibold">Choose Playoff Series</div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nbaSeries.map((series) => (
            <div
              key={series.id}
              className={`rounded-lg p-4 bg-muted cursor-pointer border-2 transition-colors ${
                selectedSeries === series.id ? 'border-white' : 'border-transparent'
              }`}
              onClick={() => {
                setSelectedSeries(series.id);
                setSelectedTeam(null);
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-mono">{series.time}</span>
                <span className="text-xs text-right font-mono">Upcoming</span>
              </div>
              <div className="flex flex-col gap-2">
                {series.teams.map((team, idx) => (
                  <div
                    key={team}
                    className={`flex items-center px-2 py-1 rounded cursor-pointer border-2 transition-colors justify-between ${
                      selectedSeries === series.id && selectedTeam === idx
                        ? 'border-white bg-builder-accent/20'
                        : 'border-transparent'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedSeries === series.id) setSelectedTeam(idx);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <img src={series.logos[idx]} alt={team} className="w-7 h-7" />
                      <span className="font-mono text-lg">{team}</span>
                    </div>
                    {selectedSeries === series.id && (
                      <Button
                        className="ml-2"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTeam(idx);
                          // Place bet logic here
                        }}
                      >
                        Bet
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
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
        <Button className="w-full mt-2" variant="secondary" onClick={handlePlaceBet} disabled={loading}>
          {loading ? 'Placing Bet...' : 'Place Bet'}
        </Button>
        {showBlink && miniblinkUrl && (
          <div className="mt-6 p-4 neo-blur rounded-lg animate-slide-up">
            <Label htmlFor="generated-link">Your Miniblink Link:</Label>
            <div className="flex mt-2">
              <Input
                id="generated-link"
                value={miniblinkUrl}
                readOnly
                className="flex-1 bg-background/50"
              />
              <Button
                variant="secondary"
                className="ml-2"
                onClick={() => {
                  navigator.clipboard.writeText(miniblinkUrl);
                  toast({ title: "Copied to clipboard" });
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GamblingTemplate;
