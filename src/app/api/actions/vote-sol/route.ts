// imports related to the blink
import {
  ActionError,
  ActionGetResponse,
  ActionPostRequest,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from '@solana/actions';

// imports for the transaction
import { Connection, PublicKey } from '@solana/web3.js';

// CAIP-2 format for Solana
const blockchain = BLOCKCHAIN_IDS.devnet;

// Set standardized headers for Blink Providers
const headers = {
  ...ACTIONS_CORS_HEADERS,
  'x-blockchain-ids': blockchain,
  'x-action-version': '2.4',
};
// Create a connection to the Solana blockchain
const connection = new Connection('https://api.devnet.solana.com');

// Set the donation wallet address
const donationWallet = new PublicKey(process.env.DONATION_WALLET_ADDRESS!);

// OPTIONS endpoint is required for CORS preflight requests
// Your Blink won't render if you don't add this
export const OPTIONS = async () => {
  return new Response(null, { headers });
};

// GET endpoint returns the Blink metadata (JSON) and UI configuration
export const GET = async (req: Request) => {
  const response: ActionGetResponse = {
    type: 'action',
    icon: `${new URL('/solana-pic.png', req.url).toString()}`,
    label: 'Vote Now',
    title: 'University Election',
    description: 'Vote for your favorite candidate in the university election.',
    links: {
      actions: [
        {
          type: 'message', // Not a transaction, just a message submission
          label: 'Vote for Alice',
          href: `/api/actions/vote-sol?candidate=Alice`,
        },
      ],
    },
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers,
  });
};

// POST endpoint handles the actual transaction creation
type VoteEntry = {
  voter: PublicKey; // voter's public key
  candidate: string; // chosen candidate
};

// In-memory store (use a real DB in production)
const votes: VoteEntry[] = [];

export const POST = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const candidate = url.searchParams.get('candidate');

    // Payer public key is passed in the request body
    const request: ActionPostRequest = await req.json();
    const voter = new PublicKey(request.account);

    if (!voter || !candidate) {
      return new Response(
        JSON.stringify({ message: 'Missing account or candidate' }),
        {
          status: 400,
          headers,
        }
      );
    }

    // Check if the user has already voted (optional rule)
    const alreadyVoted = votes.find(
      (v) => v.voter.toBase58() === voter.toBase58()
    );
    if (alreadyVoted) {
      return new Response(
        JSON.stringify({ message: 'You have already voted.' }),
        {
          status: 403, // Forbidden
          headers,
        }
      );
    }

    // Record the vote
    votes.push({ voter, candidate });

    // skip the wallet signing step and just display a confirmation message in the Blink UI
    const response = {
      type: 'message',
      data: "This process won't initiate any SOL transactions. It's solely for verification purposes.",
      links: {},
    };

    // Return the response with proper headers
    return Response.json(response, { status: 200, headers });
  } catch (error) {
    // Log and return an error response
    console.error('Error processing request:', error);

    // Error message
    const message =
      error instanceof Error ? error.message : 'Internal server error';

    // Wrap message in an ActionError object so it can be shown in the Blink UI
    const errorResponse: ActionError = {
      message,
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers,
    });
  }
};
