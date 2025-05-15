// imports related to the blink
import {
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

import { GET as getConfig } from "../../donate-config/route";

// CAIP-2 format for Solana
const blockchain = BLOCKCHAIN_IDS.devnet;

// Set standardized headers for Blink Providers
const headers = {
  ...ACTIONS_CORS_HEADERS,
  "x-blockchain-ids": blockchain,
  "x-action-version": "2.4",
};
// Create a connection to the Solana blockchain
const connection = new Connection(
  "https://stylish-restless-sheet.solana-devnet.quiknode.pro/4785d23d03f566851f11e97f29b5787cb6b048e8"
);

// Set the donation wallet address
// const donationWallet = new PublicKey(process.env.WALLET_ADDRESS!);

// OPTIONS endpoint is required for CORS preflight requests
// Your Blink won't render if you don't add this
export const OPTIONS = async () => {
  return new Response(null, { headers });
};

// GET endpoint returns the Blink metadata (JSON) and UI configuration
// export const GET = async (req: Request) => {
//   // This JSON is used to render the Blink UI
//   const response: ActionGetResponse = {
//     type: "action",
//     icon: `${new URL("/solana-pic.png", req.url).toString()}`,
//     label: "1 SOL",
//     title: "Donate SOL",
//     description:
//       "This Blink demonstrates how to donate SOL on the Solana blockchain. It is a part of the official Blink Starter Guides by Dialect Labs.",
//     // Links is used if you have multiple actions or if you need more than one params
//     links: {
//       actions: [
//         {
//           // Defines this as a blockchain transaction
//           type: "transaction",
//           label: "0.01 SOL",
//           // This is the endpoint for the POST request
//           href: `/api/actions/donate-sol?amount=0.01`,
//         },
//         {
//           type: "transaction",
//           label: "0.05 SOL",
//           href: `/api/actions/donate-sol?amount=0.05`,
//         },
//         {
//           type: "transaction",
//           label: "0.1 SOL",
//           href: `/api/actions/donate-sol?amount=0.1`,
//         },
//         {
//           // Example for a custom input field
//           type: "transaction",
//           href: `/api/actions/donate-sol?amount={amount}`,
//           label: "Donate",
//           parameters: [
//             {
//               name: "amount",
//               label: "Enter a custom SOL amount",
//               type: "number",
//             },
//           ],
//         },
//       ],
//     },
//   };

//   // Return the response with proper headers
//   return new Response(JSON.stringify(response), {
//     status: 200,
//     headers,
//   });
// };

export const GET = async (req: Request) => {
  const configRes = await getConfig();
  const config = await configRes.json();

  const response: ActionGetResponse = {
    type: "action",
    label: "1 SOL",
    icon: config.file || `${new URL("/solana-pic.png", req.url).toString()}`,
    title: config.title || "Example tittle",
    description: config.description || "Default description",
    links: {
      actions: [
        // The ... makes sure each mapped object is added as a flat element in the actions array — not nested.
        ...(config.amounts || ["0.01", "0.05", "0.1"]).map(
          (amount: string) => ({
            type: "transaction",
            label: `${amount} SOL`,
            href: `/api/actions/donate-sol?amount=${amount}`,
          })
        ),
        {
          type: "transaction",
          href: `/api/actions/donate-sol?amount={amount}`,
          label: "Donate",
          parameters: [
            {
              name: "amount",
              label: "Enter a custom SOL amount",
              type: "number",
            },
          ],
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
    // Get the latest dynamic config
    const configRes = await getConfig();
    const config = await configRes.json();

    if (!config.publicKey) {
      throw new Error("Public key is not found.");
    }

    const donationWallet = new PublicKey(config.publicKey);

    // Step 1: Extract parameters, prepare data
    const url = new URL(req.url);

    // Amount of SOL to transfer is passed in the URL
    const amount = Number(url.searchParams.get("amount"));

    // Payer public key is passed in the request body
    const request: ActionPostRequest = await req.json();
    const payer = new PublicKey(request.account);

    //Step 2: prepareTransaction
    const transaction = await prepareTransaction(
      connection,
      payer,
      donationWallet,
      amount
    );

    // Step 3: Create a response with the serialized transaction
    const response: ActionPostResponse = {
      type: "transaction",
      transaction: Buffer.from(transaction.serialize()).toString("base64"),
    };

    // Return the response with proper headers
    return Response.json(response, { status: 200, headers });
  } catch (error) {
    // Log and return an error response
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
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
