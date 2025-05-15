import { NextRequest, NextResponse } from "next/server";
import {
  ActionGetResponse,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from "@solana/actions";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import bs58 from "bs58";
import { GET as getConfig } from "../blink-config/route";

// Validate environment variables
if (!process.env.RPC_URL) {
  throw new Error("SOLANA_RPC_URL is not defined in .env.local");
}
if (!process.env.SOLANA_PRIVATE_KEY) {
  throw new Error("WALLET_PRIVATE_KEY is not defined in .env.local");
}
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined in .env.local");
}

// Initialize Solana connection
const connection = new Connection(process.env.RPC_URL, "confirmed");

// Initialize Metaplex
const wallet = Keypair.fromSecretKey(
  bs58.decode(process.env.SOLANA_PRIVATE_KEY)
);
const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));

// In-memory storage for sell listings (replace with database in production)
const listings: { mintAddress: string; price: number; seller: string }[] = [];

// Standardized headers for Blink providers
const headers = {
  ...ACTIONS_CORS_HEADERS,
  "x-blockchain-ids": BLOCKCHAIN_IDS.devnet,
  "x-action-version": "2.4",
  "Content-Type": "application/json",
};

// OPTIONS: Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: ACTIONS_CORS_HEADERS,
  });
}

// GET: Return default Blink action template
export async function GET(req: NextRequest) {
  const configRes = await getConfig();
  const config = await configRes.json();

  const response: ActionGetResponse = {
    type: "action",
    label: "Select NFT",
    icon: config.file || `${new URL("/solana-pic.png", req.url).toString()}`,
    title: config.title || "Example tittle",
    description: config.description || "Default description",
    links: {
      actions: [
        {
          type: "transaction",
          label: "0.01 SOL",
          href: `/api/nft/action?amount=0.01`,
        },
        {
          type: "transaction",
          label: "0.05 SOL",
          href: `/api/nft/action?amount=0.05`,
        },
        {
          type: "transaction",
          label: "0.1 SOL",
          href: `/api/nft/action?amount=0.1`,
        },
        {
          type: "transaction",
          href: `/api/nft/action?amount={amount}`,
          label: "Custom Amount",
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

  return new NextResponse(JSON.stringify(response), {
    status: 200,
    headers,
  });
}

// POST: Handle transaction construction for buy/sell actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = "buy", mintAddress, price, seller, account } = body;

    if (!mintAddress || !price || !seller) {
      return new NextResponse(
        JSON.stringify({ error: "Missing mintAddress, price, or seller" }),
        {
          status: 400,
          headers,
        }
      );
    }

    try {
      new PublicKey(mintAddress);
      new PublicKey(seller);
      if (action === "buy" && account) new PublicKey(account);
    } catch {
      return new NextResponse(JSON.stringify({ error: "Invalid public key" }), {
        status: 400,
        headers,
      });
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      return new NextResponse(JSON.stringify({ error: "Invalid price" }), {
        status: 400,
        headers,
      });
    }

    const mintPublicKey = new PublicKey(mintAddress);
    const sellerPublicKey = new PublicKey(seller);

    if (action === "buy") {
      if (!account) {
        return new NextResponse(
          JSON.stringify({ error: "Missing buyer account" }),
          {
            status: 400,
            headers,
          }
        );
      }

      const buyerPublicKey = new PublicKey(account);
      const priceInLamports = Math.floor(priceValue * LAMPORTS_PER_SOL);

      const sellerTokenAccount = await getAssociatedTokenAddress(
        mintPublicKey,
        sellerPublicKey
      );
      const buyerTokenAccount = await getAssociatedTokenAddress(
        mintPublicKey,
        buyerPublicKey
      );

      const sellerTokenAccountInfo = await connection.getTokenAccountBalance(
        sellerTokenAccount
      );
      if (sellerTokenAccountInfo.value.uiAmount !== 1) {
        return new NextResponse(
          JSON.stringify({ error: "Seller does not own the NFT" }),
          {
            status: 400,
            headers,
          }
        );
      }

      const instructions = [];
      const buyerTokenAccountInfo = await connection.getAccountInfo(
        buyerTokenAccount
      );
      if (!buyerTokenAccountInfo) {
        instructions.push(
          createAssociatedTokenAccountInstruction(
            buyerPublicKey,
            buyerTokenAccount,
            buyerPublicKey,
            mintPublicKey,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      instructions.push(
        SystemProgram.transfer({
          fromPubkey: buyerPublicKey,
          toPubkey: sellerPublicKey,
          lamports: priceInLamports,
        }),
        createTransferInstruction(
          sellerTokenAccount,
          buyerTokenAccount,
          sellerPublicKey,
          1,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      const { blockhash } = await connection.getLatestBlockhash();
      const message = new TransactionMessage({
        payerKey: buyerPublicKey,
        recentBlockhash: blockhash,
        instructions,
      }).compileToV0Message();

      const transaction = new VersionedTransaction(message);
      const serializedTransaction = Buffer.from(
        transaction.serialize()
      ).toString("base64");

      const response: ActionPostResponse = {
        type: "transaction",
        transaction: serializedTransaction,
      };

      return new NextResponse(JSON.stringify(response), {
        status: 200,
        headers,
      });
    } else if (action === "sell") {
      const ownsNFT = await verifyNFTOwnership(mintAddress, seller);
      if (!ownsNFT) {
        return new NextResponse(
          JSON.stringify({ error: "Seller does not own the NFT" }),
          {
            status: 400,
            headers,
          }
        );
      }

      listings.push({ mintAddress, price: priceValue, seller });
      const blinkUrl = generateBlinkUrl(
        action,
        mintAddress,
        [price.toString()],
        seller
      );

      return new NextResponse(
        JSON.stringify({
          message: `NFT listed for sale at ${price} SOL`,
          blinkUrl,
        }),
        {
          status: 200,
          headers,
        }
      );
    }

    return new NextResponse(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers,
    });
  } catch (error) {
    console.error("POST Error:", error);
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers,
      }
    );
  }
}

// GET /api/nft/owned: Fetch owned NFTs
export async function GET_owned(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");

    if (!owner) {
      return new NextResponse(
        JSON.stringify({ error: "Missing owner public key" }),
        {
          status: 400,
          headers,
        }
      );
    }

    try {
      new PublicKey(owner);
    } catch {
      return new NextResponse(
        JSON.stringify({ error: "Invalid owner public key" }),
        {
          status: 400,
          headers,
        }
      );
    }

    const nfts = await metaplex
      .nfts()
      .findAllByOwner({ owner: new PublicKey(owner) });

    const ownedNFTs = await Promise.all(
      nfts.map(async (nft) => {
        if ("mint" in nft) {
          const metadata = await getNFTMetadata(nft.mint.address.toBase58());
          return {
            mintAddress: nft.mint.address.toBase58(),
            name: metadata.name,
            symbol: metadata.symbol,
            uri: metadata.uri,
          };
        }
        return null;
      })
    ).then((results) =>
      results.filter((nft): nft is NonNullable<typeof nft> => nft !== null)
    );

    return new NextResponse(JSON.stringify({ nfts: ownedNFTs }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Owned NFTs Error:", error);
    return new NextResponse(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Failed to fetch owned NFTs",
      }),
      {
        status: 500,
        headers,
      }
    );
  }
}

// Helper function to get NFT metadata
async function getNFTMetadata(mintAddress: string) {
  try {
    const mintPublicKey = new PublicKey(mintAddress);
    const nft = await metaplex
      .nfts()
      .findByMint({ mintAddress: mintPublicKey });
    return {
      name: nft.name,
      symbol: nft.symbol,
      uri: nft.uri,
      sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
    };
  } catch {
    throw new Error("Invalid or non-existent NFT mint address");
  }
}

// Helper function to verify NFT ownership
async function verifyNFTOwnership(mintAddress: string, owner: string) {
  try {
    const mintPublicKey = new PublicKey(mintAddress);
    const ownerPublicKey = new PublicKey(owner);
    const tokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      ownerPublicKey
    );
    const accountInfo = await getAccount(connection, tokenAccount);
    return accountInfo.amount === BigInt(1);
  } catch {
    return false;
  }
}

// Helper function to generate Blink URL
function generateBlinkUrl(
  action: string,
  mintAddress: string,
  prices: string[],
  seller: string
) {
  const baseUrl = "https://dial.to/";
  const actionUrl = new URL(
    `${process.env.NEXT_PUBLIC_API_URL}/api/nft/action`
  );
  actionUrl.searchParams.append("actionType", action);
  actionUrl.searchParams.append("mintAddress", mintAddress);
  actionUrl.searchParams.append("prices", prices.join(","));
  actionUrl.searchParams.append("seller", seller);
  const params = new URLSearchParams({
    action: `solana-action:${actionUrl.toString()}`,
  });
  return `${baseUrl}?${params.toString()}`;
}
