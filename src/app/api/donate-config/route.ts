import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import bs58 from "bs58";
import { createClient } from "@/app/lib/supabase-server";

let blinkConfig: {
  title: string;
  description: string;
  file: string;
  amounts: string[];
  owner?: string;
  mintAddress?: string;
  publicKey: PublicKey;
} | null = null;

export async function POST(req: NextRequest) {
  try {
    //Initialize Supabase
    const supabase = createClient();
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const amounts = JSON.parse(formData.get("amounts") as string);
    const encodeFile = formData.get("file") as File | null;
    const mintAddress = formData.get("mintAddress") as string;
    const owner = (formData.get("owner") as string) || undefined;

    // Validate required fields
    if (!title || !description || !amounts) {
      return new NextResponse(
        JSON.stringify({
          error: "Missing required fields: title, description, or amounts",
        }),
        { status: 400 }
      );
    }

    // Default image URL
    let imageUrl = `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    }/solana-pic.png`;

    if (mintAddress) {
      // Initialize Metaplex
      const wallet = Keypair.fromSecretKey(
        bs58.decode(process.env.SOLANA_PRIVATE_KEY!)
      );
      const connection = new Connection(process.env.RPC_URL!, "confirmed");
      const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));

      // Helper function to get NFT metadata
      const getNFTMetadata = async (mintAddress: string) => {
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
      };

      try {
        const metadata = await getNFTMetadata(mintAddress);
        imageUrl = metadata.uri || imageUrl;
      } catch (error) {
        console.error("Failed to fetch NFT metadata:", error);
      }
    }

    // Helper function to fetch image and convert to Base64
    const fetchImageAsBase64 = async (url: string): Promise<string> => {
      try {
        const response = await fetch(url, { method: "GET" });
        if (!response.ok) {
          throw new Error(`Failed to fetch resource: ${response.statusText}`);
        }
        const contentType = response.headers.get("content-type") || "image/png";

        if (contentType === "application/json") {
          // Handle JSON metadata (e.g., IPFS metadata)
          const json = await response.json();
          const imageUrl = json.image || json.image_url;
          if (!imageUrl) {
            throw new Error("No image URL found in metadata JSON");
          }
          // Fetch the actual image
          const imageResponse = await fetch(imageUrl, { method: "GET" });
          if (!imageResponse.ok) {
            throw new Error(
              `Failed to fetch image: ${imageResponse.statusText}`
            );
          }
          const imageContentType =
            imageResponse.headers.get("content-type") || "image/png";
          if (!imageContentType.startsWith("image/")) {
            throw new Error(`Invalid image content type: ${imageContentType}`);
          }
          const arrayBuffer = await imageResponse.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");
          return `data:${imageContentType};base64,${base64}`;
        }

        if (!contentType.startsWith("image/")) {
          throw new Error(`Invalid content type: ${contentType}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        return `data:${contentType};base64,${base64}`;
      } catch (error) {
        console.error(`Error fetching resource from ${url}:`, error);
        throw error;
      }
    };

    let decodeFile = "";

    // Prioritize uploaded file (encodeFile) if provided
    if (encodeFile && encodeFile.type.startsWith("image/")) {
      const arrayBuffer = await encodeFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      decodeFile = `data:${encodeFile.type};base64,${base64}`;
    } else {
      // Fetch image from imageUrl and convert to Base64
      try {
        decodeFile = await fetchImageAsBase64(imageUrl);
      } catch (error) {
        console.error("Failed to convert imageUrl to Base64, using fallback");
        // Fallback to default image
        decodeFile = await fetchImageAsBase64(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
          }/solana-pic.png`
        );
      }
    }

    blinkConfig = {
      title,
      description,
      file: decodeFile,
      amounts,
      owner,
      mintAddress,
      publicKey: new PublicKey(formData.get("publicKey") as string),
    };

    //Save to supabase
    const { data, error } = await supabase
      .from("user_blinks")
      .insert({
        title,
        description,
        file: decodeFile,
        amounts,
        owner,
        mint_address: mintAddress,
      })
      .select()
      .single();
    return NextResponse.json({ success: true, mintAddress });
  } catch (error) {
    console.error("Error processing request:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(blinkConfig || {});
}
