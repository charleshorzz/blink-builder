import { v4 as uuidv4 } from "uuid";
import {
  ActionError,
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from "@solana/actions";

// imports for the transaction
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { createClient } from "@supabase/supabase-js";

// imports for the transaction

import { GET as getConfig } from "../../vote-config/route";

// CAIP-2 format for Solana
const blockchain = BLOCKCHAIN_IDS.devnet;

// Set standardized headers for Blink Providers
const headers = {
  ...ACTIONS_CORS_HEADERS,
  "x-blockchain-ids": blockchain,
  "x-action-version": "2.4",
};

// Create a connection to the Solana blockchain
const connection = new Connection("https://api.devnet.solana.com");

// OPTIONS endpoint is required for CORS preflight requests
// Your Blink won't render if you don't add this
export const OPTIONS = async () => {
  return new Response(null, { headers });
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET endpoint returns the Blink metadata (JSON) and UI configuration
export const GET = async (req: Request) => {
  const configRes = await getConfig();
  const config = await configRes.json();

  const response: ActionGetResponse = {
    type: "action",
    label: "Vote Now",
    icon: config.file || `${new URL("/votePerson.jpg", req.url).toString()}`,
    title: config.title || "University Election",
    description:
      config.description ||
      "Vote for your favorite candidate in the university election.",
    links: {
      actions: [
        {
          type: "message", // Not a transaction, just a message submission
          label: `Vote for ${config.name || "Charles"}`,
          href: `/api/actions/vote-sol?candidate=${config.name || "Charles"}`,
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
export const POST = async (req: Request) => {
  try {
    const configRes = await getConfig();
    const config = await configRes.json();

    if (!config.publicKey) {
      throw new Error("Candidate's public key is not found.");
    }

    const url = new URL(req.url);
    const amountParam = url.searchParams.get("amount");
    const candidateParam = url.searchParams.get("candidate");

    const request: ActionPostRequest = await req.json();
    const voterKey = new PublicKey(request.account);
    const candidateKey = new PublicKey(config.publicKey);
    const candidateTitle = config.title;

    // ✅ CASE 1: Transaction mode (when amount is present)
    if (amountParam) {
      const amount = Number(amountParam);
      const voteId = uuidv4();

      const transaction = await prepareTransaction(
        connection,
        voterKey,
        candidateKey,
        amount
      );

      const response = {
        type: "transaction",
        transaction: Buffer.from(transaction.serialize()).toString("base64"),
        blinkUrl: `/api/actions/vote-sol?bet=${voteId}`,
      };

      return Response.json(response, { status: 200, headers });
    }

    // ✅ CASE 2: Supabase voting logic (when candidate is present)
    if (candidateParam) {
      if (candidateKey.toBase58() === voterKey.toBase58()) {
        return new Response(
          JSON.stringify({ message: "You cannot vote for yourself." }),
          {
            status: 403,
            headers,
          }
        );
      }

      if (!voterKey || !candidateParam || !candidateKey) {
        return new Response(
          JSON.stringify({ message: "Missing required fields." }),
          {
            status: 400,
            headers,
          }
        );
      }

      const { data: existingCandidate, error: fetchError } = await supabase
        .from("candidates")
        .select("voter")
        .eq("candidatePublicKey", candidateKey)
        .eq("title", candidateTitle)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (!existingCandidate) {
        // Candidate doesn't exist: insert new
        const { error: insertError } = await supabase
          .from("candidates")
          .insert([
            {
              candidateName: candidateParam,
              candidatePublicKey: candidateKey,
              voter: [voterKey.toBase58()],
              title: candidateTitle,
            },
          ]);

        if (insertError) throw insertError;
      } else {
        // Candidate exists: update voter list
        const currentVoters: string[] = existingCandidate.voter || [];

        if (currentVoters.includes(voterKey.toBase58())) {
          return new Response(
            JSON.stringify({ message: "You have already voted." }),
            {
              status: 403,
              headers,
            }
          );
        }

        const updatedVoters = [...currentVoters, voterKey.toBase58()];

        const { error: updateError } = await supabase
          .from("candidates")
          .update({ voter: updatedVoters })
          .eq("candidatePublicKey", candidateKey.toBase58())
          .eq("title", candidateTitle);

        if (updateError) throw updateError;
      }

      const response = {
        type: "message",
        data: "This process won't initiate any SOL transactions. It's solely for verification purposes.",
        links: {},
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers,
      });
    }

    // ❌ Invalid case: neither amount nor candidate
    return new Response(
      JSON.stringify({ message: "Invalid request: missing query parameters." }),
      { status: 400, headers }
    );
  } catch (error) {
    console.error("Vote error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const errorResponse: ActionError = { message };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers,
    });
  }
};

// Prepare the transaction
const prepareTransaction = async (
  connection: Connection,
  payer: PublicKey,
  receiver: PublicKey,
  amount: number
) => {
  // Create a transfer instruction
  const instruction = SystemProgram.transfer({
    fromPubkey: payer,
    toPubkey: new PublicKey(receiver),
    lamports: amount * LAMPORTS_PER_SOL,
  });

  // Get the latest blockhash
  const { blockhash } = await connection.getLatestBlockhash();

  // Create a transaction message
  const message = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions: [instruction],
  }).compileToV0Message();

  // Create and return a versioned transaction
  return new VersionedTransaction(message);
};
