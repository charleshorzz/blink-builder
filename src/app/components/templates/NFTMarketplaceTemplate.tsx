"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { ShoppingCart, Wallet } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import axios from "axios";
import { Blink, useBlink } from "@dialectlabs/blinks";
import { useBlinkSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana";
import "@dialectlabs/blinks/index.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Minus, Plus } from "lucide-react";
import BlinkSkeleton from "@/app/components/BlinkSkeleton";
import { useToast } from "@/app/hooks/use-toast";
import { ToastAction } from "@radix-ui/react-toast";
import { PublicKey } from "@solana/web3.js";

interface NFT {
  mintAddress: string;
  name: string;
  symbol: string;
  uri: string;
}

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Zod Schema for Create NFT
const CreateFormSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Only .jpg, .jpeg, .png, and .webp files are allowed",
    }),
  name: z.string().min(1, "Name is required."),
  symbol: z.string().min(1, "Symbol is required."),
  description: z.string().min(1, "Description is required."),
  sellerFeeBasisPoints: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Royalty must be a non-negative number.",
    }),
});

// Zod Schema for Sell NFT
const SellFormSchema = z.object({
  mintAddress: z
    .string()
    .min(1, "Mint address is required.")
    .refine(
      (val) => {
        try {
          new PublicKey(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid Solana mint address." }
    ),
  prices: z
    .array(
      z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Price must be a positive number.",
      })
    )
    .min(1, "At least one price is required.")
    .max(3, "You can add up to 3 prices."),
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
});

const NFTMarketplaceTemplate: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { toast } = useToast();
  const [tab, setTab] = useState("owned");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [blinkUrl, setBlinkUrl] = useState("");
  const [previewBlink, setPreviewBlink] = useState(false);
  const [previewData, setPreviewData] = useState<{
    mintAddress: string;
    price: string;
    seller: string;
    title: string;
    description: string;
  } | null>(null);

  // Blink setup
  const blinkApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/actions/nft`;
  const { adapter } = useBlinkSolanaWalletAdapter(
    "https://stylish-restless-sheet.solana-devnet.quiknode.pro/4785d23d03f566851f11e97f29b5787cb6b048e8"
  );
  const { blink, isLoading, refresh } = useBlink({ url: blinkApiUrl });

  // Forms
  const createForm = useForm<z.infer<typeof CreateFormSchema>>({
    resolver: zodResolver(CreateFormSchema),
    defaultValues: {
      file: undefined,
      name: "",
      symbol: "",
      description: "",
      sellerFeeBasisPoints: "500",
    },
  });

  const sellForm = useForm<z.infer<typeof SellFormSchema>>({
    resolver: zodResolver(SellFormSchema),
    defaultValues: {
      mintAddress: "",
      prices: [""],
      title: "",
      description: "",
    },
  });

  // Handle Create NFT
  const handleCreateNFT = async (data: z.infer<typeof CreateFormSchema>) => {
    if (!publicKey) {
      setError("Please connect your wallet");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("name", data.name);
      formData.append("symbol", data.symbol);
      formData.append("description", data.description);
      formData.append("seller", publicKey.toBase58());
      formData.append("sellerFeeBasisPoints", data.sellerFeeBasisPoints);

      const response = await axios.post("/api/create-nft", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { mintAddress } = response.data;
      if (!mintAddress) {
        throw new Error("Mint address not returned in response");
      }

      createForm.reset();
      setTab("owned");
      toast({
        title: "NFT Created",
        description: (
          <div className="flex items-center gap-2">
            <span>Mint Address: {mintAddress}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.write(mintAddress);
                toast({
                  title: "Copied",
                  description: "Mint address copied to clipboard.",
                });
              }}
            >
              Copy
            </Button>
          </div>
        ),
        action: (
          <ToastAction
            altText="View on Explorer"
            onClick={() =>
              window.open(
                `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`,
                "_blank"
              )
            }
          >
            View
          </ToastAction>
        ),
      });

      // Auto-fill sell form with mintAddress
      sellForm.setValue("mintAddress", mintAddress);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to mint NFT";
      setError(errorMessage);
      console.error("Create NFT Error:", err);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // handle submit
  async function onSubmit(data: z.infer<typeof SellFormSchema>) {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("mintAddress", data.mintAddress);
    formData.append("amounts", JSON.stringify(data.prices));
    formData.append("owner", publicKey?.toBase58() || "");

    // Update the blink template
    try {
      const response = await fetch("../../api/blink-config", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit form data");
      }
      refresh();
    } catch (error) {
      console.error("Error:", error);
    }

    await handleGenerateBlink();
  }

  // Handle Generate Blink (Approval)
  const handleGenerateBlink = async () => {
    setLoading(true);
    setError("");

    try {
      const mintAddress = sellForm.getValues("mintAddress");
      const prices = sellForm.getValues("prices");
      const title = sellForm.getValues("title");
      const description = sellForm.getValues("description");
      const owner = publicKey?.toBase58();

      // Validate inputs
      if (!mintAddress || !mintAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
        throw new Error("Invalid or missing mint address");
      }
      if (
        !prices ||
        prices.length === 0 ||
        prices.some((p) => isNaN(Number(p)))
      ) {
        throw new Error("Invalid or missing prices");
      }
      if (!title || !description) {
        throw new Error("Title and description are required");
      }
      if (!owner) {
        throw new Error("Wallet not connected");
      }

      // Construct URL with query parameters
      const url = new URL("/api/actions/nft", window.location.origin);
      url.searchParams.append("action", "list");
      url.searchParams.append("amount", prices[0]);
      url.searchParams.append("owner", owner);
      url.searchParams.append("mintAddress", mintAddress);

      const response = await axios.post(url.toString(), {
        account: owner,
        mintAddress,
        prices,
        title,
        description,
      });

      const { blinkUrl } = response.data;
      if (!blinkUrl) {
        throw new Error("Blink URL not returned");
      }

      setBlinkUrl(blinkUrl);
      sellForm.reset();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to list NFT";
      setError(errorMessage);
      console.error("Generate Blink Error:", err);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* Left: Input Form */}
      <Card className="w-full backdrop-blur-sm bg-card/80 border-white/10 rounded-xl">
        {/* <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-builder-accent" />
              <h2 className="font-semibold text-lg">NFT</h2>
            </div>
          </div>
        </CardHeader> */}
        <CardContent className="space-y-4 mt-5">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="owned" className="flex-1">
                Minted
              </TabsTrigger>
              <TabsTrigger value="create" className="flex-1">
                Create
              </TabsTrigger>
            </TabsList>
            <TabsContent value="create" className="pt-4">
              {connected ? (
                <Form {...createForm}>
                  <form
                    onSubmit={createForm.handleSubmit(handleCreateNFT)}
                    className="space-y-6"
                  >
                    <FormField
                      control={createForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="NFT Name" {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="symbol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Symbol</FormLabel>
                          <FormControl>
                            <Input placeholder="NFT Symbol" {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your NFT..."
                              className="resize-none h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="file"
                      render={({
                        field: { value, onChange, ...fieldProps },
                      }) => (
                        <FormItem>
                          <FormLabel>Image</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => onChange(e.target.files?.[0])}
                              {...fieldProps}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="sellerFeeBasisPoints"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Royalty (%)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 500 (5%)"
                              type="number"
                              step="100"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Royalty percentage (100 = 1%).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Minting..." : "Mint NFT"}
                    </Button>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                  </form>
                </Form>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    Connect your wallet to create an NFT
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="owned" className="pt-4">
              {connected ? (
                <Form {...sellForm}>
                  <form
                    onSubmit={sellForm.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={sellForm.control}
                      name="mintAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mint Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter NFT mint address"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the Solana mint address of the NFT to list for
                            sale.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sellForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sellForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your Blink"
                              className="resize-none h-[70px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sellForm.control}
                      name="prices"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prices (in SOL)</FormLabel>
                          <div className="space-y-2">
                            {field.value.map((price, index) => (
                              <div key={index}>
                                <Input
                                  value={price}
                                  placeholder={`0.01 SOL`}
                                  onChange={(e) => {
                                    const newPrices = [...field.value];
                                    newPrices[index] = e.target.value;
                                    sellForm.setValue("prices", newPrices);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          {sellForm.formState.errors.prices && (
                            <FormMessage>
                              {
                                (sellForm.formState.errors.prices as any)
                                  ?.message
                              }
                            </FormMessage>
                          )}

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Listing..." : "Preview Your Blink"}
                    </Button>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                    {blinkUrl && (
                      <div className="mt-4">
                        <p className="text-green-500">
                          NFT blink is generated!
                        </p>
                        <a
                          href={blinkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          View Blink URL
                        </a>
                      </div>
                    )}
                  </form>
                </Form>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    Connect your wallet to view your NFTs
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Right: Blink Preview */}
      {isLoading || !blink ? (
        <BlinkSkeleton />
      ) : (
        <div className="w-full max-w-2xl">
          <Blink
            blink={blink}
            adapter={adapter}
            securityLevel="all"
            stylePreset="x-dark"
          />
        </div>
      )}
    </div>
  );
};

export default NFTMarketplaceTemplate;
