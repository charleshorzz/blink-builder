import { NextRequest, NextResponse } from "next/server";
import {
  ActionGetResponse,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from "@solana/actions";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import bs58 from "bs58";
import { GET as getConfig } from "../../blink-config/route";

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

// GET: Return Blink action template for preview
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mintAddress = searchParams.get("mintAddress");
    const price = searchParams.get("price");
    const seller = searchParams.get("seller");
    const title = searchParams.get("title");
    const description = searchParams.get("description");

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

    // Fetch NFT metadata
    let imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/solana-pic.png`;
    let nftName = "NFT";
    try {
      const metadata = await getNFTMetadata(mintAddress);
      imageUrl = metadata.uri || imageUrl;
      nftName = metadata.name || nftName;
    } catch (error) {
      console.error("Failed to fetch NFT metadata:", error);
    }

    const baseApiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Return preview Blink template
    const response: ActionGetResponse = {
      type: "action",
      label: "List NFT",
      icon: imageUrl,
      title: title || `${nftName} for Sale`,
      description:
        description ||
        `List ${nftName} for ${price} SOL on the Solana blockchain.`,
      links: {
        actions: [
          {
            type: "transaction",
            label: `${price} SOL`,
            href: `${baseApiUrl}/api/actions/template-nft?action=approve&mintAddress=${mintAddress}&price=${price}&seller=${seller}&title=${encodeURIComponent(
              title || ""
            )}&description=${encodeURIComponent(description || "")}`,
          },
          {
            type: "transaction",
            href: `${baseApiUrl}/api/actions/template-nft?action=approve&mintAddress=${mintAddress}&price={price}&seller=${seller}&title=${encodeURIComponent(
              title || ""
            )}&description=${encodeURIComponent(description || "")}`,
            label: "Custom Price",
            parameters: [
              {
                name: "price",
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
  } catch (error) {
    console.error("GET Error:", error);
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

// POST: Handle approval for sell actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action = "sell",
      mintAddress,
      price,
      seller,
      title,
      description,
      approve = false,
    } = body;

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

    if (!approve) {
      return new NextResponse(
        JSON.stringify({
          error: "Use GET /api/actions/template-nft for preview",
        }),
        {
          status: 400,
          headers,
        }
      );
    }

    // Finalize listing
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
// Helper function to generate Blink URL
function generateBlinkUrl(
  action: string,
  mintAddress: string,
  prices: string[],
  seller: string
) {
  const baseUrl = "https://dial.to/";
  const actionUrl = new URL(
    `${process.env.NEXT_PUBLIC_API_URL}/api/actions/template-nft`
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
