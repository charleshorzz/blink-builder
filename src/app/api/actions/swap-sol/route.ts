import {
  ActionGetResponse,
  ActionPostRequest,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from "@solana/actions";

import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import fetch from "cross-fetch";
import { GET as getConfig } from "../../blink-config/route";
import { v4 as uuidv4 } from "uuid";

const connection = new Connection(
  `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API!}`
);
const blockchain = BLOCKCHAIN_IDS.mainnet;

const headers = {
  ...ACTIONS_CORS_HEADERS,
  "x-blockchain-ids": blockchain,
  "x-action-version": "2.4",
};

const tokenMetadata: Record<string, { name: string; icon: string }> = {
  So11111111111111111111111111111111111111112: {
    name: "SOL",
    icon: "/solana-pic.png",
  },
  JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN: {
    name: "JUP",
    icon: "/JUP.jpg",
  },
  EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm: {
    name: "WIF",
    icon: "/WIF.jpeg",
  },
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: {
    name: "BONK",
    icon: "/BONK.jpg",
  },
};

export const OPTIONS = async () => new Response(null, { headers });

export const GET = async (req: Request) => {
  const configRes = await getConfig();
  const config = await configRes.json();
  const url = new URL(req.url);
  const inputMint = url.searchParams.get("inputMint") ?? "";
  const outputMint = url.searchParams.get("outputMint") ?? "";
  const inputToken = tokenMetadata[inputMint];
  const outputToken = tokenMetadata[outputMint];

  if (!inputToken || !outputToken) {
    return new Response(
      JSON.stringify({ error: "Unsupported input or output token" }),
      { status: 400 }
    );
  }

  const label = `Buy ${outputToken.name}`;
  const title = `Buy ${outputToken.name} with ${inputToken.name}`;
  const description = `Swap 0.01, 0.05, or 0.1 ${inputToken.name} to buy ${outputToken.name} using Jupiter via Blink`;

  const response: ActionGetResponse = {
    type: "action",
    icon: `${new URL(outputToken.icon, req.url)}`,
    label,
    title: config.title || title,
    description: config.description || description,
    links: {
      actions: [
        ...(config.amounts || ["0.01", "0.05", "0.1"]).map(
          (amount: string) => ({
            type: "transaction",
            label: `${amount} SOL`,
            href: `/api/actions/swap-sol?amount=${amount}&inputMint=${inputMint}&outputMint=${outputMint}`,
          })
        ),
        {
          type: "transaction",
          label: "Custom",
          href: `/api/actions/swap-sol?amount={amount}&inputMint=${inputMint}&outputMint=${outputMint}`,
          parameters: [
            {
              name: "amount",
              label: `Enter amount in ${inputToken.name}`,
              type: "number",
            },
          ],
        },
      ],
    },
  };

  return new Response(JSON.stringify(response), { status: 200, headers });
};

export const POST = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const body: ActionPostRequest = await req.json();
    const userPublicKey = new PublicKey(body.account);
    const inputMint = url.searchParams.get("inputMint");
    const outputMint = url.searchParams.get("outputMint");
    const amountSOL = parseFloat(url.searchParams.get("amount") || "0.01");
    const amountLamports = Math.floor(amountSOL * 1_000_000_000);

    const swapID = uuidv4();

    if (!inputMint || !outputMint) {
      return new Response(
        JSON.stringify({ error: "Missing mint parameters" }),
        {
          status: 400,
          headers,
        }
      );
    }

    // 1. Get fresh blockhash
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    // 2. Get quote from Jupiter
    const quote = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountLamports}&slippageBps=50`
    ).then((res) => {
      if (!res.ok) throw new Error(`Jupiter quote failed: ${res.statusText}`);
      return res.json();
    });

    // 3. Get versioned transaction
    const swap = await fetch("https://quote-api.jup.ag/v6/swap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: userPublicKey.toBase58(),
        wrapAndUnwrapSol: true,
        asLegacyTransaction: false,
        config: {
          maxSupportedTransactionVersion: 0,
          recentBlockhash: blockhash,
          lastValidBlockHeight,
        },
      }),
    });

    if (!swap.ok) throw new Error(`Swap failed: ${await swap.text()}`);
    const swapData = await swap.json();

    // 4. Validate transaction structure
    if (
      !swapData.swapTransaction ||
      typeof swapData.swapTransaction !== "string"
    ) {
      throw new Error("Invalid swap transaction returned by Jupiter");
    }

    // 5. Deserialize versioned transaction
    const tx = VersionedTransaction.deserialize(
      Buffer.from(swapData.swapTransaction, "base64")
    );

    // 6. Verify critical transaction details
    if (!tx.message.staticAccountKeys.some((k) => k.equals(userPublicKey))) {
      throw new Error("User public key not found in transaction accounts");
    }

    // 7. Serialize for client-side signing
    const serializedTxB64 = Buffer.from(tx.serialize()).toString("base64");

    // 8. Return unsigned versioned transaction
    const response = {
      type: "transaction",
      transaction: serializedTxB64,
      blinkUrl: `/api/actions/swap-sol?bet=${swapID}&inputMint=${inputMint}&outputMint=${outputMint}`,
    };

    return new Response(JSON.stringify(response), { status: 200, headers });
  } catch (error) {
    console.error("Swap error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers }
    );
  }
};
