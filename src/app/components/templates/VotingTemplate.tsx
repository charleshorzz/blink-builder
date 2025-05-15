"use client";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { useToast } from "@/app/components/ui/use-toast";
import { Blink, useBlink } from "@dialectlabs/blinks";
import { useBlinkSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { Loader, Twitter } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BlinkSkeleton from "../BlinkSkeleton";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface VotingTemplateProps {
  customizable?: boolean;
  onCustomize?: () => void;
}
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Zod Schema
const FormSchema = z.object({
  title: z.string().min(1, "Title is required."),
  name: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  file: z
    .instanceof(File)
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Only .jpg, .jpeg, .png and .webp files are allowed",
    })
    .optional()
    .or(z.literal(undefined)),
});

const VotingTemplate: React.FC<VotingTemplateProps> = ({
  customizable = false,
  onCustomize,
}) => {
  const { connection } = useConnection();
  const [isWallet, setIsWallet] = useState<boolean>(true);
  const { publicKey, sendTransaction } = useWallet();
  const [miniblinkUrl, setMiniblinkUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [showBlink, setShowBlink] = useState(false);

  // The route api with the GET & POST logic
  const blinkApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/actions/vote-sol`;

  // Adapter, used to connect to the wallet
  const { adapter } = useBlinkSolanaWalletAdapter(
    "https://stylish-restless-sheet.solana-devnet.quiknode.pro/4785d23d03f566851f11e97f29b5787cb6b048e8"
  );

  // Blink we want to execute
  const { blink, isLoading, refresh } = useBlink({ url: blinkApiUrl });

  // react-hook-form
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      name: "",
      file: undefined,
    },
  });

  // handle submit
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!publicKey) {
      setIsWallet(false);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("name", data.name);
    formData.append("publicKey", publicKey!.toBase58());

    if (data.file) {
      formData.append("file", data.file);
    }
    try {
      const response = await fetch("../../api/vote-config", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit form data");
      }

      const voteUrl = "/api/actions/vote-sol?amount=0";
      const voteRes = await fetch(voteUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account: publicKey.toBase58(), // payer's public key
        }),
      });

      if (!voteRes.ok) {
        throw new Error("Failed to fetch transaction from vote-sol");
      }

      const donateSoleData = await voteRes.json();
      const tx = donateSoleData.transaction;

      const transaction = VersionedTransaction.deserialize(
        Buffer.from(tx, "base64")
      );

      const latestBlockhash = await connection.getLatestBlockhash();
      const txid = await sendTransaction(transaction, connection);

      // Show the Miniblink link immediately

      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      const fullBlinkUrl = donateSoleData.blinkUrl?.startsWith("http")
        ? donateSoleData.blinkUrl
        : `${baseUrl}${donateSoleData.blinkUrl}`;

      if (!fullBlinkUrl) {
        throw new Error("Failed to fetch transaction from vote-sol.");
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
      refresh();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-5">
        {/* ------ Left: User Input ------ */}
        {/* <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-card/80 border-white/10"> */}
        <Card className="w-full backdrop-blur-sm bg-card/80 border-white/10">
          <CardContent className="space-y-6 mt-5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className=" space-y-6"
              >
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Candidate Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Charles" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Enter your full name as it should appear on the voting
                        card.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* File */}
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Profile Image</FormLabel>
                      <FormControl>
                        <Input
                          {...fieldProps}
                          type="file"
                          accept="image/*"
                          onChange={(event) =>
                            onChange(
                              event.target.files && event.target.files[0]
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Upload a clear photo of yourself for voters to recognize
                        you.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="University Election" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Provide a short, attention-grabbing title.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share more details about yourself, your goals, and why people should vote for you."
                          className="resize-none h-[150px]"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={loading}>
                  {loading ? <Loader /> : "Preview Your Blink"}
                </Button>
                {!isWallet && (
                  <p className="text-sm text-red-500">
                    Please connect your wallet as receiver wallet first!
                  </p>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* ------ Right: BlinkCard ------ */}
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
    </>
  );
};

export default VotingTemplate;
