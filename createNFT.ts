import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import * as dotenv from "dotenv";

dotenv.config();

console.log("rpc", process.env.RPC_URL);

// Initialize connection and wallet
const connection = new Connection(
  process.env.RPC_URL || "https://api.devnet.solana.com",
  "confirmed"
);
const wallet = Keypair.fromSecretKey(
  bs58.decode(process.env.SOLANA_PRIVATE_KEY!)
);
const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));

async function createTestNFT() {
  try {
    const { nft } = await metaplex.nfts().create({
      uri: "https://example.com/metadata.json", // Replace with your metadata URL
      name: "Test NFT",
      symbol: "TNFT",
      sellerFeeBasisPoints: 500, // 5% royalty
      creators: [{ address: wallet.publicKey, share: 100 }],
    });

    console.log("NFT Mint Address:", nft.address.toBase58());
    console.log("Seller Public Key:", wallet.publicKey.toBase58());
    console.log("Metadata URI:", nft.uri);
  } catch (error) {
    console.error("Error creating NFT:", error);
  }
}

export default createTestNFT;
