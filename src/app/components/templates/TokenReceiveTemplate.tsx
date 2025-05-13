"use client";

import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Blink, useBlink } from "@dialectlabs/blinks";
import { useBlinkSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana";
import "@dialectlabs/blinks/index.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus, Wallet } from "lucide-react";
import React from "react";
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
import { Textarea } from "../ui/textarea";
import { useToast } from "@/app/hooks/use-toast";
import { ToastAction } from "@radix-ui/react-toast";

interface TokenReceiveTemplateProps {
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
  description: z.string().min(1, "Description is required."),
  file: z
    .instanceof(File)
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Only .jpg, .jpeg, .png and .webp files are allowed",
    })
    .optional()
    .or(z.literal(undefined)),
  amounts: z
    .array(
      z.string().refine((val) => !isNaN(Number(val)) && val.trim() !== "", {
        message: "Amount must be a number.",
      })
    )
    .min(1, "At least one amount is required.")
    .max(3, "You can add up to 3 amounts."),
});

const TokenReceiveTemplate: React.FC<TokenReceiveTemplateProps> = ({
  customizable = false,
  onCustomize,
}) => {
  const { toast } = useToast();

  // The route api with the GET & POST logic
  const blinkApiUrl = "http://localhost:3000/api/actions/donate-sol";

  // Adapter, used to connect to the wallet
  const { adapter } = useBlinkSolanaWalletAdapter(
    "https://api.devnet.solana.com"
  );

  // Blink we want to execute
  const { blink, isLoading, refresh } = useBlink({ url: blinkApiUrl });

  // react-hook-form
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      file: undefined,
      amounts: [""],
    },
  });

  // handle submit
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("amounts", JSON.stringify(data.amounts));

    if (data.file) {
      formData.append("file", data.file);
    }

    try {
      const response = await fetch("../../api/blink-config", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit form data");
      }
      toast({
        title: "Scheduled: Catch up ",
        description: "Friday, February 10, 2023 at 5:57 PM",
        action: <ToastAction altText="Goto schedule to undo">Undo</ToastAction>,
      });
      refresh();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* ------ Left: User Input ------ */}
      {/* <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-card/80 border-white/10"> */}
      <Card className="w-full backdrop-blur-sm bg-card/80 border-none border-white/10 rounded-xl">
        {/* <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet size={20} className="text-builder-accent" />
            Receive Tokens
          </CardTitle>
          <CardDescription>
            Enter an amount and recipient address
          </CardDescription>
        </CardHeader> */}
        <CardContent className="space-y-4 mt-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your blink's title.
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
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          onChange(event.target.files && event.target.files[0])
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      The image for displaying in the blink.
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
                        placeholder="Describe about your blink..."
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
                        <div key={index}>
                          <Input
                            value={amount}
                            placeholder={`Amount ${index + 1}`}
                            onChange={(e) => {
                              const newAmounts = [...field.value];
                              newAmounts[index] = e.target.value;
                              form.setValue("amounts", newAmounts);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.amounts && (
                      <FormMessage>
                        {(form.formState.errors.amounts as any)?.message}
                      </FormMessage>
                    )}
                    <div className="flex gap-2 mt-2">
                      {/* Add button - max 3 inputs */}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="mt-2"
                        disabled={field.value.length >= 3}
                        onClick={() =>
                          form.setValue("amounts", [...field.value, ""])
                        }
                      >
                        <Plus />
                      </Button>

                      {/* Remove button - min 1 input */}
                      {form.watch("amounts").length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="mt-2"
                          onClick={() => {
                            const current = form.getValues("amounts");
                            current.pop();
                            form.setValue("amounts", current);
                          }}
                        >
                          <Minus />
                        </Button>
                      )}
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit">Preview Your Blink</Button>
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
  );
};

export default TokenReceiveTemplate;
