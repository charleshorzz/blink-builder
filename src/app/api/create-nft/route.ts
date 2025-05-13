import { NextRequest, NextResponse } from "next/server";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { uploadToIPFS, uploadMetadataToIPFS } from "../../utils/fileUploader";

// Validate environment variables
if (!process.env.RPC_URL) {
  throw new Error("SOLANA_RPC_URL is not defined in .env.local");
}
if (!process.env.SOLANA_PRIVATE_KEY) {
  throw new Error("WALLET_PRIVATE_KEY is not defined in .env.local");
}
if (!process.env.PINATA_API_KEY || !process.env.PINATA_API_SECRET) {
  throw new Error("Pinata API credentials are not defined in .env.local");
}

// Initialize connection and wallet
const connection = new Connection(process.env.RPC_URL, "confirmed");
const wallet = Keypair.fromSecretKey(
  bs58.decode(process.env.SOLANA_PRIVATE_KEY)
);
const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const symbol = formData.get("symbol") as string;
    const description = formData.get("description") as string;
    const seller = formData.get("seller") as string;
    const sellerFeeBasisPoints =
      parseInt(formData.get("sellerFeeBasisPoints") as string) || 500;

    if (!file || !name || !symbol || !description || !seller) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate seller public key
    try {
      new PublicKey(seller);
    } catch {
      return NextResponse.json(
        { error: "Invalid seller public key" },
        { status: 400 }
      );
    }

    // Upload image to IPFS
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await uploadToIPFS(fileBuffer, file.name);

    // Upload metadata to IPFS
    const metadata = {
      name,
      symbol,
      description,
      image: imageUrl,
    };
    const metadataUrl = await uploadMetadataToIPFS(metadata);

    // Mint NFT
    const { nft } = await metaplex.nfts().create({
      uri: metadataUrl,
      name,
      symbol,
      sellerFeeBasisPoints,
      creators: [{ address: new PublicKey(seller), share: 100 }],
    });

    return NextResponse.json({
      mintAddress: nft.address.toBase58(),
      sellerPublicKey: seller,
      metadataUri: nft.uri,
      message: "NFT created successfully",
    });
  } catch (error) {
    console.error("Error creating NFT:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create NFT",
      },
      { status: 500 }
    );
  }
}
