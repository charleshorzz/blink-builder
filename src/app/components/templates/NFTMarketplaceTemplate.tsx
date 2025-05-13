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
import { ShoppingCart } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import axios from "axios";
import Image from "next/image";

interface NFT {
  mintAddress: string;
  name: string;
  symbol: string;
  uri: string;
}

const NFTMarketplaceTemplate: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const [tab, setTab] = useState("create");
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [sellerFeeBasisPoints, setSellerFeeBasisPoints] = useState("500");
  const [mintAddress, setMintAddress] = useState("");
  const [price, setPrice] = useState("");
  const [ownedNFTs, setOwnedNFTs] = useState<NFT[]>([]);
  const [blinkUrl, setBlinkUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      fetchOwnedNFTs();
    }
  }, [connected, publicKey]);

  const fetchOwnedNFTs = async () => {
    try {
      const response = await axios.get("/api/nft/owned", {
        params: { owner: publicKey?.toBase58() },
      });
      setOwnedNFTs(response.data.nfts);
    } catch (err) {
      setError("Failed to fetch owned NFTs");
      console.error(err);
    }
  };

  const handleCreateNFT = async () => {
    if (!file || !name || !symbol || !description || !publicKey) {
      setError("Please fill all fields and select an image");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);
      formData.append("symbol", symbol);
      formData.append("description", description);
      formData.append("seller", publicKey.toBase58());
      formData.append("sellerFeeBasisPoints", sellerFeeBasisPoints);

      const response = await axios.post("/api/create-nft", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMintAddress(response.data.mintAddress);
      setTab("owned"); // Switch to owned tab to sell the new NFT
      fetchOwnedNFTs(); // Refresh owned NFTs
    } catch (err) {
      setError("Failed to mint NFT");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSellNFT = async () => {
    if (!mintAddress || !price || !publicKey) {
      setError("Please provide mint address and price");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/nft", {
        action: "sell",
        mintAddress,
        price,
        seller: publicKey.toBase58(),
      });

      setBlinkUrl(response.data.blinkUrl);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to list NFT for sale");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-card/80 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-builder-accent" />
            <h2 className="font-semibold text-lg">NFT Marketplace</h2>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="owned" className="flex-1">
              Your NFTs
            </TabsTrigger>
            <TabsTrigger value="create" className="flex-1">
              Create
            </TabsTrigger>
          </TabsList>

          <TabsContent value="owned" className="pt-4">
            {connected ? (
              <div>
                <label className="block text-sm font-medium mt-4 mb-2">
                  Enter Mint Address
                </label>
                <input
                  type="text"
                  value={mintAddress}
                  onChange={(e) => setMintAddress(e.target.value)}
                  className="w-full p-2 border rounded text-black"
                  placeholder="NFT Mint Address"
                />
                <label className="block text-sm font-medium mt-4 mb-2">
                  Price (SOL)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2 border rounded text-black"
                  placeholder="0.01"
                  step="0.01"
                />
                <Button
                  onClick={handleSellNFT}
                  disabled={loading}
                  className="w-full mt-4 hover:bg-builder-accent"
                >
                  {loading ? "Listing..." : "List NFT for Sale"}
                </Button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
                {blinkUrl && (
                  <div className="mt-4">
                    <p className="text-green-500">NFT listed successfully!</p>
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
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Connect your wallet to view your NFTs
                </p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="create" className="pt-4">
            {connected ? (
              <div>
                <label className="block text-sm font-medium mb-2">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border rounded text-black"
                />
                <label className="block text-sm font-medium mt-4 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded text-black"
                  placeholder="NFT Name"
                />
                <label className="block text-sm font-medium mt-4 mb-2">
                  Symbol
                </label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full p-2 border rounded text-black"
                  placeholder="NFT Symbol"
                />
                <label className="block text-sm font-medium mt-4 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="NFT Description"
                />
                <label className="block text-sm font-medium mt-4 mb-2">
                  Royalty (%)
                </label>
                <input
                  type="number"
                  value={sellerFeeBasisPoints}
                  onChange={(e) => setSellerFeeBasisPoints(e.target.value)}
                  className="w-full p-2 border rounded text-black"
                  placeholder="e.g., 500 (5%)"
                  step="100"
                />
                <Button
                  onClick={handleCreateNFT}
                  disabled={loading}
                  className="w-full mt-4 hover:bg-builder-accent"
                >
                  {loading ? "Minting..." : "Mint NFT"}
                </Button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Connect your wallet to create an NFT
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NFTMarketplaceTemplate;
