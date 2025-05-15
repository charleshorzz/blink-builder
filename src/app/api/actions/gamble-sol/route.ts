import { v4 as uuidv4 } from 'uuid';
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'x-action-version': '2.4',
};

// In-memory bet store (reset on server restart)
const bets: Record<string, any> = {};
const connection = new Connection("https://api.devnet.solana.com");

export const OPTIONS = async () => {
  return new Response(null, { headers });
};

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { creator, series, amount, side, account, time } = body;
    if (!creator || !series || !amount || !side || !account) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers,
      });
    }
    const betId = uuidv4();
    bets[betId] = {
      id: betId,
      creator,
      series,
      amount,
      side,
      time,
      challenger: null,
    };

    // Prepare Solana transaction
    const payer = new PublicKey(account);
    const creatorKey = new PublicKey(creator);
    const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;

    const instruction = SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: creatorKey,
      lamports,
    });

    const { blockhash } = await connection.getLatestBlockhash();
    const message = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: blockhash,
      instructions: [instruction],
    }).compileToV0Message();

    const transaction = new VersionedTransaction(message);

    const response = {
      type: "transaction",
      transaction: Buffer.from(transaction.serialize()).toString("base64"),
      blinkUrl: `/api/actions/gamble-sol?bet=${betId}`,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers,
    });
  }
};

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const bet = url.searchParams.get('bet');
  if (!bet || !bets[bet]) {
    return new Response(JSON.stringify({ error: 'Bet not found' }), {
      status: 404,
      headers,
    });
  }
  const betInfo = bets[bet];
  // Example team logos (expand as needed)
  const teamLogos: Record<string, string> = {
    'Knicks': 'https://upload.wikimedia.org/wikipedia/en/2/25/New_York_Knicks_logo.svg',
    'Celtics': 'https://upload.wikimedia.org/wikipedia/en/8/8f/Boston_Celtics.svg',
    'Warriors': 'https://upload.wikimedia.org/wikipedia/en/0/01/Golden_State_Warriors_logo.svg',
    'Timberwolves': 'https://upload.wikimedia.org/wikipedia/en/c/c2/Minnesota_Timberwolves_logo.svg',
  };
  // Determine the opposite side
  const allTeams = betInfo.series.split(' vs ');
  const oppositeSide = allTeams.find((team: string) => team !== betInfo.side) || 'Other';
  const icon = teamLogos[oppositeSide] || 'https://upload.wikimedia.org/wikipedia/en/2/25/Los_Angeles_Lakers_logo.svg';
  const response = {
    type: 'action',
    label: `🏀 Bet: ${betInfo.series}`,
    icon,
    title: `NBA Playoff Bet`,
    description:
      `• Match: ${betInfo.series}\n` +
      `• Creator: ${betInfo.creator} (picked: ${betInfo.side})\n` +
      `• You are betting on: ${oppositeSide}\n` +
      `• Amount: 💰 ${betInfo.amount} SOL\n` +
      `• Time: ${betInfo.time || 'N/A'}`,
    links: {
      actions: [
        {
          type: 'transaction',
          label: `Bet ${betInfo.amount} SOL on ${oppositeSide}`,
          href: `/api/actions/gamble-sol/join-bet?bet=${betInfo.id}`,
        },
      ],
    },
  };
  return new Response(JSON.stringify(response), {
    status: 200,
    headers,
  });
};

export const PUT = async (req: Request) => {
  const url = new URL(req.url);
  const bet = url.searchParams.get('bet');
  const { challenger } = await req.json();
  if (!bet || !bets[bet]) {
    return new Response(JSON.stringify({ error: 'Bet not found' }), {
      status: 404,
      headers,
    });
  }
  if (!challenger) {
    return new Response(JSON.stringify({ error: 'Missing challenger' }), {
      status: 400,
      headers,
    });
  }
  bets[bet].challenger = challenger;
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers,
  });
}; 