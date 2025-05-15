import { NextRequest, NextResponse } from "next/server";
import {
  ActionGetResponse,
  ActionPostRequest,
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
import { GET as getConfig } from "../../blink-config/route";
import { createClient } from "@/app/lib/supabase-server";

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
const listings: { mintAddress: string; price?: number; seller?: string }[] = [];

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
  let config = await configRes.json();
  const supabase = createClient();

  if (!config) {
    //  // 1. Extract Params
    const url = new URL(req.url);
    const owner =
      url.searchParams.get("owner") || url.searchParams.get("seller");
    const mintAddress = url.searchParams.get("mintAddress");

    const { data, error } = await supabase
      .from("user_blinks")
      .select("*")
      .eq("mint_address", mintAddress)
      .eq("owner", owner)
      .single();

    if (!error && data) {
      config = {
        title: data.title,
        description: data.description,
        file: data.file,
        amounts: data.amounts,
        owner: data.owner,
        mintAddress: data.mint_address,
      };
    }
  }

  console.log("amount", config.amount);

  const response: ActionGetResponse = {
    type: "action",
    label: "Select NFT",
    icon: config.file || `${new URL("/solana-pic.png", req.url).toString()}`,
    title: config.title || "NFT Blink",
    description:
      config.description || "Create or Select an NFT to list for sale",
    links: {
      actions: [
        // The ... makes sure each mapped object is added as a flat element in the actions array — not nested.
        ...(config.amounts || ["0.01"]).map((amount: string) => ({
          type: "transaction",
          label: `${amount} SOL`,
          href: `/api/actions/nft?amount=${amount}&owner=${config.owner}&mintAddress=${config.mintAddress}&action=buy`,
        })),
        {
          type: "transaction",
          href: `/api/actions/nft?amount=${
            (config.amount && config.amount[0]) || 0.1
          }&owner=${config.owner}&mintAddress=${
            config.mintAddress
          }&action=list`,
          label: "Get Blinks",
        },
      ],
    },
  };

  return new NextResponse(JSON.stringify(response), {
    status: 200,
    headers,
  });
}

const prepareTransaction = async (
  connection: Connection,
  payer: PublicKey,
  owner: PublicKey,
  amount: number,
  mintAddress: string
) => {
  //Create a transger instruction
  const instruction = SystemProgram.transfer({
    fromPubkey: payer,
    toPubkey: owner,
    lamports: amount * LAMPORTS_PER_SOL,
  });

  //Get the latest blockhash
  const { blockhash } = await connection.getLatestBlockhash();

  //Create a transaction message
  const message = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions: [instruction],
  }).compileToV0Message();

  //Create and return a versioned transaction
  return new VersionedTransaction(message);
};

// POST: Handle preview and final listing for sell actions
export async function POST(request: NextRequest) {
  try {
    // 1. Extract Params
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const amount = Number(url.searchParams.get("amount"));
    const req: ActionPostRequest = await request.json();
    const payer = new PublicKey(req.account);
    const owner =
      url.searchParams.get("owner") || url.searchParams.get("seller");
    if (!owner) {
      return new Error("Missing owner public key");
    }
    const ownerWallet = new PublicKey(owner);
    const mintAddress = url.searchParams.get("mintAddress");

    let sellerPubkey: PublicKey | null = null;
    let nftMint: PublicKey;
    try {
      if (owner) {
        sellerPubkey = new PublicKey(owner);
      }
      if (mintAddress) {
        nftMint = new PublicKey(mintAddress);
      }
    } catch {
      return new NextResponse(
        JSON.stringify({ error: "Invalid public key or mint address" }),
        { status: 400 }
      );
    }

    // Initialize Metaplex (no wallet identity)
    const connection = new Connection(process.env.RPC_URL!, "confirmed");
    const metaplex = Metaplex.make(connection);

    // Helper: Verify NFT ownership
    const verifyOwnership = async (mintAddress: string, owner: PublicKey) => {
      try {
        // Check token account balance
        const tokenAccount = await getAssociatedTokenAddress(
          new PublicKey(mintAddress),
          owner
        );
        const tokenBalance = await connection.getTokenAccountBalance(
          tokenAccount
        );
        if (tokenBalance.value.amount !== "1") {
          throw new Error("Seller does not own the NFT");
        }

        // Optional: Verify NFT metadata
        const nft = await metaplex
          .nfts()
          .findByMint({ mintAddress: new PublicKey(mintAddress) });
        if (!nft.creators[0].address.equals(owner)) {
          throw new Error("NFT owner mismatch");
        }

        console.log("verify success");
        return true;
      } catch {
        throw new Error("Seller does not own the NFT or invalid mint address");
      }
    };

    // GENERATE BLINKS
    console.log("actionssss", action);

    if (action === "list") {
      // Verify seller owns the NFT
      try {
        await verifyOwnership(mintAddress!, sellerPubkey!);
      } catch (error) {
        return new NextResponse(
          JSON.stringify({ error: (error as Error).message }),
          { status: 403 }
        );
      }

      // Generate Blink URL (placeholder; replace with Dialect Blinks)
      //   const blinkUrl = `https://dial.to/${
      //     process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      //   }/api/actions/nft/?mintAddress=${mintAddress}?action=buy&seller=${owner}&amount=${amount}`;
      const baseUrl = "https://dial.to/";
      const actionUrl = new URL(
        `${process.env.NEXT_PUBLIC_API_URL}/api/actions/nft`
      );
      actionUrl.searchParams.append("action", "buy");
      if (mintAddress) {
        actionUrl.searchParams.append("mintAddress", mintAddress);
      }
      actionUrl.searchParams.append("amount", amount.toString());
      actionUrl.searchParams.append("seller", owner);
      const params = new URLSearchParams({
        action: `solana-action:${actionUrl.toString()}`,
      });
      const blinkUrl = `${baseUrl}?${params.toString()}`;
      console.log("Blink URL", blinkUrl);

      return NextResponse.json({ success: true, blinkUrl }, { status: 200 });
    }

    // Step 3: Handle purchase
    if (!sellerPubkey) {
      return new NextResponse(
        JSON.stringify({ error: "Missing seller for purchase" }),
        { status: 400 }
      );
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid amount in listing" }),
        { status: 400 }
      );
    }

    // Verify seller still owns the NFT
    try {
      await verifyOwnership(mintAddress!, sellerPubkey);
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: (error as Error).message }),
        { status: 403 }
      );
    }

    // Step 4: Prepare transaction
    const prepareTransaction = async (
      connection: Connection,
      payer: PublicKey,
      seller: PublicKey,
      mintAddress: PublicKey,
      amount: number
    ) => {
      console.log("enter prepae transaction");
      // SOL transfer: Payer → Seller
      const solInstruction = SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: seller,
        lamports: amount * LAMPORTS_PER_SOL,
      });

      // NFT transfer: Seller → Payer
      const sellerTokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        seller
      );
      const payerTokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        payer
      );

      const metadataAccount = await metaplex
        .nfts()
        .findByMint({ mintAddress })
        .then((nft) => nft.metadataAddress);

      console.log("metadataAccount", metadataAccount.toBase58());

      //   const nftInstruction = createTransferInstruction({
      //     source: sellerTokenAccount,
      //     destination: payerTokenAccount,
      //     owner: seller,
      //     amount: 0.1,
      //     token: sellerTokenAccount,
      //     tokenOwner: seller,
      //   });

      const nftInstruction = createTransferInstruction(
        sellerTokenAccount,
        payerTokenAccount,
        seller,
        1,
        [],
        metadataAccount
      );

      // Get latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();

      // Create transaction message
      const message = new TransactionMessage({
        payerKey: payer,
        recentBlockhash: blockhash,
        instructions: [solInstruction, nftInstruction],
      }).compileToV0Message();

      // Create versioned transaction (unsigned)
      return new VersionedTransaction(message);
    };

    const transaction = await prepareTransaction(
      connection,
      payer,
      sellerPubkey,
      nftMint,
      amount
    );

    // Step 5: Create response
    const response = {
      type: "transaction",
      transaction: Buffer.from(transaction.serialize()).toString("base64"),
      blinkUrl: `https://dial.to/${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/blink/${mintAddress}`,
    };

    return NextResponse.json(response, { status: 200, headers });
  } catch (error) {
    // Log and return an error response
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers,
    });
  }
  //   try {
  //     // extract params
  //     const body = await request.json();
  //     const {
  //       action = "sell",
  //       mintAddress,
  //       price,
  //       seller,
  //       title,
  //       description,
  //       approve,
  //     } = body;

  //     console.log("POST Body", body);

  //     if (!mintAddress || !price || !seller) {
  //       return new NextResponse(
  //         JSON.stringify({ error: "Missing mintAddress, price, or seller" }),
  //         {
  //           status: 400,
  //           headers,
  //         }
  //       );
  //     }

  //     // Validate public keys
  //     try {
  //       new PublicKey(mintAddress);
  //       new PublicKey(seller);
  //     } catch {
  //       return new NextResponse(JSON.stringify({ error: "Invalid public key" }), {
  //         status: 400,
  //         headers,
  //       });
  //     }

  //     // Validate amount
  //     const amount = Number(price[0]);
  //     if (isNaN(amount) || amount <= 0) {
  //       return new NextResponse(JSON.stringify({ error: "Invalid amount" }), {
  //         status: 400,
  //       });
  //     }

  //     // Initialize Metaplex
  //     const wallet = Keypair.fromSecretKey(
  //       bs58.decode(process.env.SOLANA_PRIVATE_KEY!)
  //     );
  //     const connection = new Connection(process.env.RPC_URL!, "confirmed");
  //     const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));

  //     // If approve is true, finalize the listing
  //     if (approve) {
  //       const ownsNFT = await verifyNFTOwnership(mintAddress, seller);
  //       if (!ownsNFT) {
  //         return new NextResponse(
  //           JSON.stringify({ error: "Seller does not own the NFT" }),
  //           {
  //             status: 400,
  //             headers,
  //           }
  //         );
  //       }

  //       listings.push({ mintAddress, price: price, seller });
  //       const blinkUrl = generateBlinkUrl(
  //         action,
  //         mintAddress,
  //         [price.toString()],
  //         seller
  //       );
  //     }

  //     // Return preview Blink template
  //     const response: ActionGetResponse = {
  //       type: "action",
  //       label: "List NFT",
  //       icon: imageUrl,
  //       title: title || `${nftName} for Sale`,
  //       description:
  //         description ||
  //         `List ${nftName} for ${price} SOL on the Solana blockchain.`,
  //       links: {
  //         actions: [
  //           {
  //             type: "transaction",
  //             label: `${price} SOL`,
  //             href: `/api/nft?action=approve&mintAddress=${mintAddress}&price=${price}&seller=${seller}&title=${encodeURIComponent(
  //               title || ""
  //             )}&description=${encodeURIComponent(description || "")}`,
  //           },
  //           {
  //             type: "transaction",
  //             href: `/api/nft?action=approve&mintAddress=${mintAddress}&price={price}&seller=${seller}&title=${encodeURIComponent(
  //               title || ""
  //             )}&description=${encodeURIComponent(description || "")}`,
  //             label: "Custom Price",
  //             parameters: [
  //               {
  //                 name: "price",
  //                 label: "Enter a custom SOL amount",
  //                 type: "number",
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //     };

  //     return new NextResponse(JSON.stringify(response), {
  //       status: 200,
  //       headers,
  //     });
  //   } catch (error) {
  //     console.error("POST Error:", error);
  //     return new NextResponse(
  //       JSON.stringify({
  //         error: error instanceof Error ? error.message : "Internal server error",
  //       }),
  //       {
  //         status: 500,
  //         headers,
  //       }
  //     );
  //   }
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
    `${process.env.NEXT_PUBLIC_API_URL}/api/actions/nft/action`
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
