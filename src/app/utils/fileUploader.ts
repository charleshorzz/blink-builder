import PinataClient from "@pinata/sdk";
import { Readable } from "stream";

// Initialize Pinata client
const pinata = new PinataClient({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_API_SECRET,
});

export async function uploadToIPFS(
  file: Buffer,
  fileName: string
): Promise<string> {
  try {
    // Convert Buffer to Readable stream for Pinata
    const stream = Readable.from(file);
    (stream as any).path = fileName; // Pinata requires a path property

    const result = await pinata.pinFileToIPFS(stream, {
      pinataMetadata: { name: fileName },
      pinataOptions: { cidVersion: 0 },
    });

    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
  } catch (error) {
    console.error("Pinata Upload Error:", error);
    throw new Error("Failed to upload to IPFS");
  }
}

export async function uploadMetadataToIPFS(metadata: {
  name: string;
  symbol: string;
  description: string;
  image: string;
}): Promise<string> {
  try {
    const result = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: { name: `${metadata.name}_metadata.json` },
      pinataOptions: { cidVersion: 0 },
    });

    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
  } catch (error) {
    console.error("Pinata Metadata Upload Error:", error);
    throw new Error("Failed to upload metadata to IPFS");
  }
}
