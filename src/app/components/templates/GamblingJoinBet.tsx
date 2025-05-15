import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useToast, toast } from '@/app/components/ui/use-toast';

require('@solana/wallet-adapter-react-ui/styles.css');

export default function GamblingJoinBet() {
  const { publicKey, connected } = useWallet();
  const { toast: showToast } = useToast();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { bet } = router.query;
  const [betData, setBetData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get the current page URL for Miniblink
  const miniblinkUrl = mounted ? (typeof window !== 'undefined' ? window.location.href : '') : '';

  useEffect(() => {
    const fetchBetData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/join-bet?bet=${bet}`);
        if (!res.ok) throw new Error('Failed to fetch bet');
        const data = await res.json();
        setBetData(data);
      } catch (e) {
        setBetData(null);
        showToast({ title: 'Failed to load bet data', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    if (bet) {
      fetchBetData();
    }
  }, [bet]);

  const handleJoinBet = async () => {
    if (!connected || !publicKey) {
      showToast({ title: 'Please connect your wallet first', variant: 'destructive' });
      return;
    }

    if (!betData) {
      showToast({ title: 'Bet data not found', variant: 'destructive' });
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/join-bet?bet=${bet}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenger: publicKey.toBase58() }),
      });
      if (!res.ok) throw new Error('Failed to join bet');
      showToast({ title: 'Successfully joined the bet!' });
    } catch (error) {
      console.error('Error joining bet:', error);
      showToast({ title: 'Failed to join bet', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            {/* Miniblink preview with custom description */}
            {mounted && miniblinkUrl && (
              <div className="mb-6">
                {/* You can add Miniblink here if needed */}
              </div>
            )}
            {/* Show bet amount and Accept Challenge button */}
            <div className="flex flex-col items-center mb-6">
              <div className="text-lg font-semibold mb-2">
                Bet Amount: {betData?.amount ? `${betData.amount} SOL` : '... SOL'}
              </div>
              <button
                onClick={handleJoinBet}
                disabled={isLoading}
                className="mt-2 px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Joining Bet...' : 'Accept Challenge'}
              </button>
            </div>

            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="flex justify-center mb-8">
                  {mounted && <WalletMultiButton />}
                </div>

                {connected && betData && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-bold mb-4">Join Bet</h2>
                      <p className="mb-2">
                        <span className="font-semibold">Match:</span> {betData.series}
                      </p>
                      <p className="mb-2">
                        <span className="font-semibold">Creator:</span> {betData.creator}
                      </p>
                      {betData.challenger && (
                        <p className="mb-2">
                          <span className="font-semibold">Challenger:</span> {betData.challenger}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {!betData && (
                  <div className="text-center text-gray-500">
                    Loading bet data...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 