"use client";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { useToast } from "@/app/components/ui/use-toast";
import { Blink, useBlink } from "@dialectlabs/blinks";
import { useBlinkSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana";
import "@dialectlabs/blinks/index.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus, Twitter } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Connection, VersionedTransaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Label } from "@/app/components/ui/label";

const swapPairs = [
  {
    label: "SOL ⇄ JUP",
    inputMint: "So11111111111111111111111111111111111111112",
    outputMint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  },
  {
    label: "SOL ⇄ WIF",
    inputMint: "So11111111111111111111111111111111111111112",
    outputMint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
  },
  {
    label: "SOL ⇄ BONK",
    inputMint: "So11111111111111111111111111111111111111112",
    outputMint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  },
];

const FormSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  amounts: z
    .array(
      z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number",
      })
    )
    .min(1, "At least one amount is required")
    .max(3, "Maximum 3 amounts allowed")
    .refine(
      (arr) => arr.filter((a) => a !== "").length > 0,
      "At least one valid amount required"
    ),
});

const SwapCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isWallet, setIsWallet] = useState<Boolean>(true);
  const { connection } = useConnection();
  const [miniblinkUrl, setMiniblinkUrl] = useState("");
  const { publicKey, sendTransaction } = useWallet();
  const [showBlink, setShowBlink] = useState(false);
  const selectedPair = swapPairs[0];
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      amounts: [""],
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!publicKey) {
      setIsWallet(false);
      throw new Error("No wallet connected");
    }
    console.log(data);
    setShowPreview(true);

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("amounts", JSON.stringify(data.amounts));
    formData.append("publicKey", publicKey!.toBase58());

    try {
      const response = await fetch("../../api/blink-config", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit form data");
      }

      const swapSolUrl = `/api/actions/swap-sol?amount=0&inputMint=${selectedPair.inputMint}&outputMint=${selectedPair.outputMint}`;
      const swapSolRes = await fetch(swapSolUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account: publicKey.toBase58(), // payer's public key
        }),
      });

      if (!swapSolRes.ok) {
        throw new Error("Failed to fetch transaction from swap-sol");
      }

      const swapSolData = await swapSolRes.json();
      const tx = swapSolData.transaction;

      const transaction = VersionedTransaction.deserialize(
        Buffer.from(tx, "base64")
      );

      const latestBlockhash = await connection.getLatestBlockhash();
      const txid = await sendTransaction(transaction, connection);

      // Show the Miniblink link immediately
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      const fullBlinkUrl = swapSolData.blinkUrl?.startsWith("http")
        ? swapSolData.blinkUrl
        : `${baseUrl}${swapSolData.blinkUrl}`;

      if (!fullBlinkUrl) {
        throw new Error("Failed to fetch transaction from swap-sol");
      } else {
        console.log(
          `https://dial.to/?action=solana-action%3A${encodeURIComponent(
            fullBlinkUrl
          )}`
        );
      }

      setMiniblinkUrl(
        `https://dial.to/?action=solana-action%3A${encodeURIComponent(
          fullBlinkUrl
        )}`
      );
      setShowBlink(true);

      toast({
        title: "Blink created successfully! Share with your friends now!",
      });

      // Confirm transaction in background
      connection
        .confirmTransaction({
          signature: txid,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        })
        .then(() => {
          toast({ title: "Transaction confirmed!" });
        })
        .catch((e) => {
          console.error("Transaction confirmation error:", e);
          toast({
            title: "Transaction confirmation failed",
            variant: "destructive",
          });
        });

      setIsWallet(true);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      <Card className="w-full backdrop-blur-sm bg-card/80 border-none border-white/10 rounded-xl">
        <CardContent className="space-y-4 mt-5">
          <div className="flex justify-center gap-4">
            {swapPairs.map((pair, index) => (
              <button
                key={pair.outputMint}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentIndex === index
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {pair.label}
              </button>
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Instant SOL Swap" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your swap parameters..."
                        className="resize-none h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amounts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amounts (in SOL)</FormLabel>
                    <div className="space-y-2">
                      {field.value.map((amount, index) => (
                        <Input
                          key={index}
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={amount}
                          placeholder={`Amount ${index + 1}`}
                          onChange={(e) => {
                            const newAmounts = [...field.value];
                            newAmounts[index] = e.target.value;
                            form.setValue("amounts", newAmounts);
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={field.value.length >= 3}
                        onClick={() =>
                          form.setValue("amounts", [...field.value, ""])
                        }
                      >
                        <Plus />
                      </Button>
                      {field.value.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const current = [...field.value];
                            current.pop();
                            form.setValue("amounts", current);
                          }}
                        >
                          <Minus />
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Preview Your Blink
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {showPreview && (
        <div className="w-full max-w-2xl">
          <BlinkCard key={`${Date.now()}`} pair={swapPairs[currentIndex]} />
        </div>
      )}

      {showBlink && miniblinkUrl && (
        <div className="mt-6 p-4 neo-blur rounded-lg animate-slide-up">
          <Label htmlFor="generated-link">Your Miniblink Link:</Label>
          <div className="flex mt-2">
            <Input
              id="generated-link"
              value={miniblinkUrl}
              readOnly
              className="flex-1 bg-background/50"
            />
            <Button
              variant="secondary"
              className="ml-2"
              onClick={() => {
                navigator.clipboard.writeText(miniblinkUrl);
                toast({ title: "Copied to clipboard" });
              }}
            >
              Copy
            </Button>
            <a
              href={`https://x.com/intent/post?text=${encodeURIComponent(
                miniblinkUrl
              )}`}
              target="_blank"
            >
              <Button
                variant="outline"
                className="bg-neutral-900  hover:bg-neutral-950 ml-2"
              >
                <Twitter />
                Share
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

const BlinkCard: React.FC<{
  pair: (typeof swapPairs)[0];
}> = ({ pair }) => {
  const blinkApiUrl = `http://localhost:3002/api/actions/swap-sol?inputMint=${pair.inputMint}&outputMint=${pair.outputMint}`;
  const { adapter } = useBlinkSolanaWalletAdapter(
    `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API!}`
  );
  const { blink, isLoading } = useBlink({ url: blinkApiUrl });

  return (
    <div className="w-full h-full p-4">
      <div className="rounded-xl overflow-hidden shadow-lg border border-white/10 backdrop-blur-sm bg-card/80">
        {isLoading || !blink ? (
          <div />
        ) : (
          <Blink
            key={blinkApiUrl}
            blink={blink}
            adapter={adapter}
            securityLevel="all"
            stylePreset="x-dark"
          />
        )}
      </div>
    </div>
  );
};

export default SwapCarousel;
