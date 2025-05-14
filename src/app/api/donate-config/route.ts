import { PublicKey } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";

let blinkConfig: {
  title: string;
  description: string;
  file: string;
  amounts: string[];
  publicKey: PublicKey;
} | null = null;

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const amounts = JSON.parse(formData.get("amounts") as string); // send as JSON string from frontend
  const encodeFile = formData.get("file") as File | null;
  const publicKeyString = formData.get("publicKey") as string;

  let decodeFile = "";

  if (encodeFile && encodeFile.type.startsWith("image/")) {
    const arrayBuffer = await encodeFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    decodeFile = `data:${encodeFile.type};base64,${base64}`;
  }

  const publicKey = new PublicKey(publicKeyString); // Convert to PublicKey instance

  blinkConfig = { title, description, file: decodeFile, amounts, publicKey };
  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json(blinkConfig || {});
}
