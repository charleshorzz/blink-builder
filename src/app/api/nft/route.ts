import { NextRequest, NextResponse } from "next/server";
import { ACTIONS_CORS_HEADERS } from "@solana/actions";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import {
  TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import bs58 from "bs58";

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

// Interface for Action metadata
interface ActionMetadata {
  icon: string;
  title: string;
  description: string;
  label: string;
  disabled?: boolean;
  links?: {
    actions: {
      label: string;
      href: string;
      parameters?: { name: string; label: string }[];
    }[];
  };
  blinkUrl?: string;
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
  price: string,
  seller: string
) {
  const baseUrl = "https://dial.to/";
  const actionUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/nft`);
  actionUrl.searchParams.append("actionType", action);
  actionUrl.searchParams.append("mintAddress", mintAddress);
  actionUrl.searchParams.append("price", price);
  actionUrl.searchParams.append("seller", seller);
  const params = new URLSearchParams({
    action: `solana-action:${actionUrl.toString()}`,
  });
  return `${baseUrl}?${params.toString()}`;
}

// OPTIONS: Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: ACTIONS_CORS_HEADERS,
  });
}

// GET: Handle metadata requests for buy/sell actions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    console.log("GET Request Query:", Object.fromEntries(searchParams));

    let action =
      searchParams.get("action") || searchParams.get("actionType") || "buy";
    let mintAddress = searchParams.get("mintAddress");
    let price = searchParams.get("price");
    let seller = searchParams.get("seller");

    if (action.startsWith("solana-action:")) {
      try {
        const actionUrl = new URL(action.replace("solana-action:", ""));
        mintAddress = mintAddress || actionUrl.searchParams.get("mintAddress");
        price = price || actionUrl.searchParams.get("price");
        seller = seller || actionUrl.searchParams.get("seller");
        action = actionUrl.searchParams.get("actionType") || action;
      } catch {
        console.log("Failed to parse solana-action URL");
      }
    }

    if (!mintAddress || !price || !seller) {
      const metadata: ActionMetadata = {
        icon: "https://www.searchenginejournal.com/wp-content/uploads/2019/07/the-essential-guide-to-using-images-legally-online.png",
        title: "NFT Action",
        description:
          "Please provide mintAddress, price, and seller to proceed.",
        label: "Action Not Available",
        disabled: true,
      };
      return new NextResponse(JSON.stringify(metadata), {
        status: 200,
        headers: {
          ...ACTIONS_CORS_HEADERS,
          "Content-Type": "application/json",
        },
      });
    }

    try {
      new PublicKey(mintAddress);
      new PublicKey(seller);
    } catch {
      return new NextResponse(JSON.stringify({ error: "Invalid public key" }), {
        status: 400,
        headers: {
          ...ACTIONS_CORS_HEADERS,
          "Content-Type": "application/json",
        },
      });
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      return new NextResponse(JSON.stringify({ error: "Invalid price" }), {
        status: 400,
        headers: {
          ...ACTIONS_CORS_HEADERS,
          "Content-Type": "application/json",
        },
      });
    }

    const nftMetadata = await getNFTMetadata(mintAddress);
    const icon =
      nftMetadata.uri ||
      "https://www.searchenginejournal.com/wp-content/uploads/2019/07/the-essential-guide-to-using-images-legally-online.png";
    const blinkUrl = generateBlinkUrl(action, mintAddress, price, seller);

    let metadata: ActionMetadata;
    if (action === "buy") {
      metadata = {
        icon,
        title: `Buy ${nftMetadata.name || "NFT"}`,
        description: `Purchase an NFT for ${price} SOL`,
        label: "Buy NFT",
        blinkUrl,
      };
    } else if (action === "sell") {
      metadata = {
        icon,
        title: `List ${nftMetadata.name || "NFT"} for Sale`,
        description: `List your NFT for ${price} SOL`,
        label: "List NFT",
        blinkUrl,
      };
    } else {
      return new NextResponse(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: {
          ...ACTIONS_CORS_HEADERS,
          "Content-Type": "application/json",
        },
      });
    }

    return new NextResponse(JSON.stringify(metadata), {
      status: 200,
      headers: { ...ACTIONS_CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET Error:", error);
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: {
          ...ACTIONS_CORS_HEADERS,
          "Content-Type": "application/json",
        },
      }
    );
  }
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
          headers: {
            ...ACTIONS_CORS_HEADERS,
            "Content-Type": "application/json",
          },
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
        headers: {
          ...ACTIONS_CORS_HEADERS,
          "Content-Type": "application/json",
        },
      });
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      return new NextResponse(JSON.stringify({ error: "Invalid price" }), {
        status: 400,
        headers: {
          ...ACTIONS_CORS_HEADERS,
          "Content-Type": "application/json",
        },
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
            headers: {
              ...ACTIONS_CORS_HEADERS,
              "Content-Type": "application/json",
            },
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
            headers: {
              ...ACTIONS_CORS_HEADERS,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const transaction = new Transaction();
      const buyerTokenAccountInfo = await connection.getAccountInfo(
        buyerTokenAccount
      );
      if (!buyerTokenAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            buyerPublicKey,
            buyerTokenAccount,
            buyerPublicKey,
            mintPublicKey,
            TOKEN_PROGRAM_ID
          )
        );
      }

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: buyerPublicKey,
          toPubkey: sellerPublicKey,
          lamports: priceInLamports,
        })
      );

      transaction.add(
        createTransferInstruction(
          sellerTokenAccount,
          buyerTokenAccount,
          sellerPublicKey,
          1,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      transaction.feePayer = buyerPublicKey;

      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
      });
      const base64Transaction = serializedTransaction.toString("base64");

      const blinkUrl = generateBlinkUrl(
        action,
        mintAddress,
        price.toString(),
        seller
      );

      return new NextResponse(
        JSON.stringify({
          transaction: base64Transaction,
          message: `Buy NFT for ${price} SOL`,
          blinkUrl,
        }),
        {
          status: 200,
          headers: {
            ...ACTIONS_CORS_HEADERS,
            "Content-Type": "application/json",
          },
        }
      );
    } else if (action === "sell") {
      const ownsNFT = await verifyNFTOwnership(mintAddress, seller);
      if (!ownsNFT) {
        return new NextResponse(
          JSON.stringify({ error: "Seller does not own the NFT" }),
          {
            status: 400,
            headers: {
              ...ACTIONS_CORS_HEADERS,
              "Content-Type": "application/json",
            },
          }
        );
      }

      listings.push({ mintAddress, price: priceValue, seller });
      const blinkUrl = generateBlinkUrl(
        action,
        mintAddress,
        price.toString(),
        seller
      );

      return new NextResponse(
        JSON.stringify({
          message: `NFT listed for sale at ${price} SOL`,
          blinkUrl,
        }),
        {
          status: 200,
          headers: {
            ...ACTIONS_CORS_HEADERS,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new NextResponse(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...ACTIONS_CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST Error:", error);
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: {
          ...ACTIONS_CORS_HEADERS,
          "Content-Type": "application/json",
        },
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
          headers: {
            ...ACTIONS_CORS_HEADERS,
            "Content-Type": "application/json",
          },
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
          headers: {
            ...ACTIONS_CORS_HEADERS,
            "Content-Type": "application/json",
          },
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
    );

    return new NextResponse(JSON.stringify({ nfts: ownedNFTs }), {
      status: 200,
      headers: { ...ACTIONS_CORS_HEADERS, "Content-Type": "application/json" },
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
        headers: {
          ...ACTIONS_CORS_HEADERS,
          "Content-Type": "application/json",
        },
      }
    );
  }
}
